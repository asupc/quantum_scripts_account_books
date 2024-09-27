const accoutBookCustomDataType = "quantum_account_book_record"

const {
    addCustomData,
    getCustomData
} = require('./quantum');

const moment = require("moment")

/**
 * 添加流水
 * @param {*} type 类型：支出/收入
 * @param {*} tag 标签
 * @param {*} amount 金额
 * @param {*} remark 备注
 * @param {*} isNecessity 是否必要支出
 */
async function addFlows(type, tag, amount, remark, isNecessity) {
    const data = {
        Type: accoutBookCustomDataType,
        Data1: type,
        Data2: amount,
        Data3: tag,
        Data4: isNecessity,
        Data5: moment().format("YYYY-MM-DD HH:mm:ss"),
        Data6: remark
    }
    return (await addCustomData([data]))[0];
}

/**
 * 查询流水
 * @param {*} type 类型 （支出/收入）
 * @param {*} startTime 开始时间
 * @param {*} endTime 结束时间
 * @param {*} tag 标签
 * @param {*} isNecessity  是否必要支出
 * @returns 
 */
async function getFlows(startTime, endTime, type, tag, isNecessity) {
    console.log(`getFlows:${startTime} ${endTime} ${type}`)
    return await getCustomData(accoutBookCustomDataType, startTime, endTime, {
        Data1: type,
        Data3: tag,
        Data4: isNecessity
    })
}

/**
 * 统计当周的数据
 * @param {*} type 类型（支出/收入）
 * @param {*} tag 标签
 * @param {*} isNecessity  是否必要支出
 */
async function getDayStatistics(type, tag, isNecessity) {
    const startTime = moment().format("YYYY-MM-DD 00:00:00");
    const endTime = moment().format("YYYY-MM-DD HH:mm:ss")
    const flows = await getFlows(startTime, endTime, type, tag, isNecessity)
    return flows.reduce((accumulator, current) => {
        return accumulator + current.Data2; // 累加 Data1 的值
    }, 0);
}


/**
 * 统计当周的数据
 * @param {*} type 类型（支出/收入）
 * @param {*} tag 标签
 * @param {*} isNecessity  是否必要支出
 */
async function getWeekStatistics(type, tag, isNecessity) {
    const startTime = moment(getStartOfWeek()).format("YYYY-MM-DD HH:mm:ss");
    const endTime = moment().format("YYYY-MM-DD HH:mm:ss")
    const flows = await getFlows(startTime, endTime, type, tag, isNecessity)

    return flows.reduce((accumulator, current) => {
        return accumulator + parseFloat(current.Data2); // 累加 Data1 的值
    }, 0);
}

/**
 * 统计当月的数据
 * @param {*} type 类型（支出/收入）
 * @param {*} tag 标签
 * @param {*} isNecessity  是否必要支出
 */
async function getMonthStatistics(type, tag, isNecessity) {
    const startTime = moment(getStartOfMonth()).format("YYYY-MM-DD HH:mm:ss");
    const endTime = moment().format("YYYY-MM-DD HH:mm:ss")
    const flows = await getFlows(startTime, endTime, type, tag, isNecessity)
    return flows.reduce((accumulator, current) => {
        return accumulator +  parseFloat(current.Data2); // 累加 Data1 的值
    }, 0);
}

function getStartOfWeek() {
    const today = new Date();
    const day = today.getDay(); // 星期几，0代表周日，1代表周一，依此类推
    const diff = (day < 1 ? -6 : 1) - day; // 计算到上一个周一的差值
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() + diff); // 设置为周一
    startOfWeek.setHours(0, 0, 0, 0); // 设置时间为00:00:00
    return startOfWeek;
}

function getStartOfMonth() {
    const today = new Date(); // 获取当前日期
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1); // 设置为本月的第一天
    startOfMonth.setHours(0, 0, 0, 0); // 设置时间为00:00:00
    return startOfMonth;
}


module.exports.accoutBookCustomDataType = accoutBookCustomDataType;
module.exports.addFlows = addFlows;
module.exports.getFlows = getFlows;
module.exports.getWeekStatistics = getWeekStatistics;
module.exports.getDayStatistics = getDayStatistics;
module.exports.getMonthStatistics = getMonthStatistics;