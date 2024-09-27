const {
    sendNotify, addCustomData, addOrUpdateCustomDataTitle, getCustomData, deleteCustomData, sleep, updateCustomData
} = require('./quantum');


const {
    getFlows
} = require('./account_book_base');

const moment = require("moment")

let customerDataType = "account_book_statistics_month"
!(async () => {
    let d = moment(moment().add(-9, "months").format("YYYY-MM-01"))
    let max = moment();
    for (d; d < max;) {
        let month_str = d.format("YYYY年MM月")
        let date = d.format("YYYY-MM-DD")
        let endMonthValue = moment((d.add(1, "months").valueOf() - 1)).format("YYYY-MM-DD HH:mm:ss")

        const zhichu = (await getFlows(date, endMonthValue, "支出")).reduce((accumulator, current) => {
            return accumulator + parseFloat(current.Data2); // 累加 Data1 的值
        }, 0).toFixed(2);
        const shouru = (await getFlows(date, endMonthValue, "收入")).reduce((accumulator, current) => {
            return accumulator + parseFloat(current.Data2); // 累加 Data1 的值
        }, 0).toFixed(2);

        console.log(`获取【${date}】记账数据，收入：【${shouru}】，支出：【${zhichu}】`)

        var cds = await getCustomData(customerDataType, null, null, {
            Data1: month_str
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
                Data1: month_str,
                Data2: zhichu,
                Data3: shouru,
                Data4: (shouru - zhichu).toFixed(2)
            }])
        }
        await sleep(1000)
    }

})().catch((e) => {
    console.log("脚本异常：" + e.message);
    console.log(e.stack)
});