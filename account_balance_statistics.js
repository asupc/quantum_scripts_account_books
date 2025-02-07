/**
 * 账户余额 统计
 */


const { getCustomData, deleteCustomData, sendNotify, addCustomData, addOrUpdateCustomDataTitle } = require('./quantum');
const moment = require('moment');

// 账户余额数据类型
const ACCOUNT_BALANCE_TYPE = 'account_balance';
// 账户余额统计数据类型
const ACCOUNT_BALANCE_STATISTICS_TYPE = 'account_balance_statistics';

!(async () => {

    const title = {
        Type: ACCOUNT_BALANCE_STATISTICS_TYPE,
        TypeName: "余额统计",
        Title1: "统计日期",
        Title2: "账面余额",
        Title3: "负债金额",
        Title4: "资产剩余",
        Title5: "账面余额变动",
        Title6: "负债金额变动",
        Title7: "资产剩余变动"
    }

    await addOrUpdateCustomDataTitle(title);
    await calculateAccountBalance();

})().catch((e) => {
    console.log("脚本异常：" + e.message);
    console.log(e.stack)
});




// 统计账户余额的函数
async function calculateAccountBalance() {
    try {
        const now = moment();

        // 获取账户余额数据
        const accountBalanceData = await getCustomData(ACCOUNT_BALANCE_TYPE, null, null, { Data4: "是" });

        // 计算账户余额总和
        let totalBalance = 0;
        let liabilities = 0;
        accountBalanceData.forEach(data => {
            if (parseFloat(data.Data2) > 0) {
                totalBalance += parseFloat(data.Data2); // 假设数据中有 balance 字段
            } else {
                liabilities += parseFloat(data.Data2)
            }
        });

        // 构建统计结果数据
        const statisticsData = {
            Type: ACCOUNT_BALANCE_STATISTICS_TYPE,
            Data1: now.format('YYYY-MM-DD'),
            Data2: totalBalance.toFixed(2),
            Data3: liabilities.toFixed(2),
            Data4: (totalBalance + liabilities).toFixed(2),
            Data5: 0,
            Data6: 0,
            Data7: 0,
            createTime: now.format('YYYY-MM-DD HH:mm:ss')
        };

        // 先删除已有的统计数据（如果存在）
        const existingStatistics = await getCustomData(ACCOUNT_BALANCE_STATISTICS_TYPE, null, null, { Data1: statisticsData.Data1 });

        // now

        const yesterday = moment().subtract(1, 'days').format('YYYY-MM-DD');
        const yesterdayDatas = await getCustomData(ACCOUNT_BALANCE_STATISTICS_TYPE, null, null, { Data1: yesterday });


        if (existingStatistics && existingStatistics.length > 0) {
            console.log(`${statisticsData.Data1}数据已存在，删除后添加`)
            const existingIds = existingStatistics.map(data => data.Id);

            console.log(existingIds)
            await deleteCustomData(existingIds);
        }
        let msg = `${statisticsData.Data1} 账户余额统计完成
账面余额：${statisticsData.Data2}元
负债金额：${statisticsData.Data3}元
资产剩余：${statisticsData.Data4}元`

        if (yesterdayDatas && yesterdayDatas.length > 0) {
            const yesterdayData = yesterdayDatas[0];
            console.log("昨日账户余额数据：" + JSON.stringify(yesterdayData))
            statisticsData.Data5 = (parseFloat(statisticsData.Data2) - parseFloat(yesterdayData.Data2)).toFixed(2)
            statisticsData.Data6 = (parseFloat(statisticsData.Data3) - parseFloat(yesterdayData.Data3)).toFixed(2)
            statisticsData.Data7 = (parseFloat(statisticsData.Data4) - parseFloat(yesterdayData.Data4)).toFixed(2)
            msg += `
账面余额变动：${statisticsData.Data5}
负债金额变动：${statisticsData.Data6}
资产剩余变动：${statisticsData.Data7}`
        }

        // 保存统计结果数据
        await addCustomData([statisticsData]);

        console.log(msg);
        await sendNotify(msg, true)

    } catch (error) {
        console.error('账户余额统计失败：', error);
    }
}