/**
 * 量子变量：script_account_book_statistics_day_number ，从多少天前的数据重新统计，数字，不指定时默认60，即近60天的日记账数据会被重新统计
 * 
 */

const {
    sendNotify, addCustomData, getCustomData, sleep, updateCustomData
} = require('./quantum');


const {
    getFlows
} = require('./account_book_base');

const moment = require("moment")

let customerDataType = "account_book_statistics_day"


let dayNumber = 60;


!(async () => {

    try {
        dayNumber = process.env.script_account_book_statistics_day_number ? parseInt(process.env.script_account_book_statistics_day_number) : dayNumer
    } catch {
    }

    let d = moment(moment().add(-dayNumber, "days").format("YYYY-MM-DD"))
    let max = moment();
    for (d; d < max;) {
        let date = d.format("YYYY-MM-DD")
        let end = d.add(1, "days").format("YYYY-MM-DD")

        const zhichuList = await getFlows(date, end, "支出");

        const zhichu = zhichuList.reduce((accumulator, current) => {
            return accumulator + parseFloat(current.Data2); // 累加 Data1 的值
        }, 0).toFixed(2);

        const shouru = (await getFlows(date, end, "收入")).reduce((accumulator, current) => {
            return accumulator + parseFloat(current.Data2); // 累加 Data1 的值
        }, 0).toFixed(2);

        console.log(`获取【${date}】记账数据，收入：【${shouru}】，支出：【${zhichu}】`)

        var cds = await getCustomData(customerDataType, null, null, {
            Data1: date
        });
        if (cds.length > 0) {
            let uData = cds[0];
            uData.Data2 = zhichu
            uData.Data3 = shouru
            uData.Data4 = (shouru - zhichu).toFixed(2)
            await updateCustomData(uData)
        } else {
            await addCustomData([{
                Type: customerDataType,
                Data1: date,
                Data2: zhichu,
                Data3: shouru,
                Data4: (shouru - zhichu).toFixed(2)
            }])
        }

        let tagStatistics = {};

        zhichuList.forEach(item => {
            const keyValue = item.Data3;
            if (!tagStatistics[keyValue]) {
                tagStatistics[keyValue] = 0;
            }
            tagStatistics[keyValue] += parseFloat(item.Data2);;
        });

        console.log("支出标签统计：" + JSON.stringify(tagStatistics));

        if (date == moment().format("YYYY-MM-DD") && (shouru > 0 || zhichu > 0)) {
            let msg = `今日[${date}]记账统计通知`
            if (shouru > 0) {
                msg += `\r总收入：【${shouru}】元`
            }
            if (zhichu > 0) {
                msg += `\r总支出：【${zhichu}】元`
            }
            if (zhichuList.length > 0) {
                msg += `\r支出标签统计`
                for (let k in tagStatistics) {
                    msg += `\r${k}：【${tagStatistics[k]}】元`
                }
            }
            await sendNotify(msg, true)
        }
        await sleep(1000)
    }
})().catch((e) => {
    console.log("脚本异常：" + e.message);
    console.log(e.stack)
});