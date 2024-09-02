
const accoutBookCustomDataType = "quantum_account_book_record"

const {
     addCustomData
} = require('./quantum');

const moment = require("monent")

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

module.exports.accoutBookCustomDataType = accoutBookCustomDataType;

module.exports.addFlows = addFlows;