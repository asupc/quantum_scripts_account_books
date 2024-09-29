/**
 * 
 * 记账本初始化
 * 默认禁用，手动执行一次即可
 * 
 */

const {
    addOrUpdateCustomDataTitle
} = require('./quantum');


const { accoutBookCustomDataType } = require("./account_book_base")

!(async () => {
    const title = {
        Type: accoutBookCustomDataType,
        TypeName: "记账流水",
        Title1: "交易类型",
        Title2: "交易金额",
        Title3: "交易标签",
        Title4: "是否必要开支",
        Title5: "交易时间",
        Title6: "交易说明",
    }
    await addOrUpdateCustomDataTitle(title);


    await addOrUpdateCustomDataTitle({
        Type: "account_book_statistics_day",
        TypeName: "记账日统计",
        Title1: "日期",
        Title2: "支出",
        Title3: "收入",
        Title4: "结余"
    });

    await addOrUpdateCustomDataTitle({
        Type: "account_book_statistics_month",
        TypeName: "记账月统计",
        Title1: "月份",
        Title2: "支出",
        Title3: "收入",
        Title4: "结余"
    });

    console.log("初始化标题完成")
})().catch((e) => {
    console.log("脚本异常：" + e.message);
    console.log(e.stack)
});