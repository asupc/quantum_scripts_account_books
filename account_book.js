/**
 * 量子记账
 * 
 */

const {
    sendNotify
} = require('./quantum');


const {
    addFlows
} = require('./account_book_base');


let command = process.env.command;
let isQuantum = process.env.QuantumAssistantTemporaryToken && process.env.QuantumAssistantTemporaryToken.length > 0;


!(async () => {
    if (!isQuantum) {
    } else {
        if (process.env.user_id != '51a2685836c745c198193e902ff2e7c4' && process.env.user_id != 'c512959ec0e14a4ea1c830c88c99fa03') {
            return;
        }
    }
    if (!command) {
        return;
    }

    let commands = extractInfo(command)

    if (commands.length < 3) {
        await sendNotify("格式错误，参考如下：\r支出地铁9\r收入工资1000");
        return;
    }
    await addFlows(commands[0].indexOf("支出") > -1 ? "支出" : "收入", commands[1], commands[2], commands[3], (commands[0].indexOf("支出") > -1 && commands[0].indexOf("必要") > -1) ? "是" : "否")
    await sendNotify(command + "，记账完成")
})().catch((e) => {
    console.log("脚本异常：" + e.message);
    console.log(e.stack)
});


/**
 * 正则提取信息
 * @param {*} text 
 * @returns 
 */
function extractInfo(text) {
    // 定义正则表达式
    // const pattern = /^(支出|收入)\s*(\S+?)\s*(\d+(\.\d+)?)\s*(.*)$/;
    const pattern = /^(必要支出|支出|收入)\s*(\S+?)\s*(\d+(\.\d+)?)\s*(.*)$/;
    // 执行匹配
    const match = text.match(pattern);

    if (match) {
        const direction = match[1].trim();  // 费用方向
        const item = match[2].trim();       // 费用项
        const amount = match[3].trim();     // 费用金额
        const note = match[5].trim();       // 备注信息

        // 构建结果数组
        const result = [direction, item, amount];
        if (note) {
            result.push(note);
        }
        return result;
    }
    return null;
}