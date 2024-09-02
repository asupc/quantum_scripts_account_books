const {
    sendNotify, addCustomData, addOrUpdateCustomDataTitle, getCustomData, deleteCustomData, sleep, updateCustomData
} = require('./quantum');


const {
    login, statistics
} = require('./account_book_base');

const moment = require("moment")

let customerDataType = "moneywhere_statistics_day"
!(async () => {

    await addOrUpdateCustomDataTitle({
        Type: customerDataType,
        TypeName: "记账统计",
        Title1: "日期",
        Title2: "支出",
        Title3: "收入",
        Title4: "结余"
    })

})().catch((e) => {
    console.log("脚本异常：" + e.message);
    console.log(e.stack)
});