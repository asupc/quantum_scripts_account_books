/**
 * 记账月度统计
 */

const {
    sendNotify, addCustomData, addOrUpdateCustomDataTitle, getCustomData, deleteCustomData, sleep, updateCustomData
} = require('./quantum');


const {
    
} = require('./account_book_base');

const moment = require("moment")

!(async () => {
    await addOrUpdateCustomDataTitle({
        Type: customerDataType,
        TypeName: "记账月统计",
        Title1: "月份",
        Title2: "支出",
        Title3: "收入",
        Title4: "结余"
    })
   
})().catch((e) => {
    console.log("脚本异常：" + e.message);
    console.log(e.stack)
});