/**
 * 
 * 量子变量：script_account_book_statistics_month_number，从多少月前的数据重新统计，数字，不指定时默认6，即近6个月的月记账数据会被重新统计
 * 
 */
const {
    sendNotify, addCustomData, getCustomData, sleep, updateCustomData
} = require('./quantum');



const {
    getFlows
} = require('./account_book_base');

const moment = require("moment")

let customerDataType = "account_book_statistics_month"


let monthNumber = 6;


!(async () => {


    try {
        monthNumber = process.env.script_account_book_statistics_month_number ? parseInt(process.env.script_account_book_statistics_month_number) : monthNumber
    } catch {
    }

    let d = moment(moment().add(-monthNumber, "months").format("YYYY-MM-01"))

    let max = moment();

    for (d; d < max;) {

        let month_str = d.format("YYYY年MM月")

        let date = d.format("YYYY-MM-DD")

        let endMonthValue = moment((d.add(1, "months").valueOf() - 1)).format("YYYY-MM-DD HH:mm:ss")


        let zhichuList = await getFlows(date, endMonthValue, "支出");

        const zhichu = zhichuList.reduce((accumulator, current) => {
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

        let tagStatistics = {};

        zhichuList.forEach(item => {
            const keyValue = item.Data3;
            if (!tagStatistics[keyValue]) {
                tagStatistics[keyValue] = 0;
            }
            tagStatistics[keyValue] += parseFloat(item.Data2);;
        });
        console.log("支出标签统计：" + JSON.stringify(tagStatistics));

        /**
         * 对上一个月的数据进行统计通知
         */
        let tsl = [];

        for (let k in tagStatistics) {
            tsl.push({
                t:k,
                v:tagStatistics[k].toFixed(2)
            })
        }

        tsl.sort((a, b) => b.v - a.v);
        if (month_str == moment().add(-1, "months").format("YYYY年MM月")) {
            let msg = `${month_str}记账统计通知`
            if (shouru > 0) {
                msg += `\r总收入：${shouru}元`
            }
            if (zhichu > 0) {
                msg += `\r总支出：${zhichu}元`
            }
            msg+=`\r结余：${((shouru - zhichu).toFixed(2))}元`
            if (zhichuList.length > 0) {
                msg += `\r支出标签统计`
                tsl.forEach((item)=>{
                     msg += `\r${item.t}：${item.v}元`
                })
            }
            await sendNotify(msg, true)
        }
        await sleep(1000)
    }

})().catch((e) => {
    console.log("脚本异常：" + e.message);
    console.log(e.stack)
});