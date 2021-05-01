process.env.TZ='Asia/Shanghai';
const credentials = require("./credentials");
const bot = require('./bot'); //酷Q机器人的api
const logger = require('./lib/logger'); //日志记录
const dayjs = require('dayjs'); //日期格式转换
const db = require('./lib/db');
const db2 = require('./lib/db2');
const PFCache = require('./lib/PFCache');
const NodeCache = require('node-cache');
const cache = new NodeCache({
    stdTTL: 1 * 5 //秒
});
var pfcache = new PFCache();

//const node_localStorage = require('node-localstorage').LocalStorage;
async function search(context) {
    let data;
    let uid = context.group_id || null;
    if (await db.read().has(`guanjianci[${uid}]`).value() == true) {
        data = await db.read().get(`guanjianci[${uid}]`).value();
    } else {
        data = await db.read().get(`guanjianci[quanju]`).value();
    }
    let s1 = "";
    let s2 = "";
    //logger.info("search:" + data)
    if (data != undefined) {
        for (let i = 0; i < data.length; i++) {
            s2 = "";
            //console.log(data[i].name);
            //console.log(data[i].enable);
            //console.log(data[i].mohuchaxun);
            //console.log(data[i].neirong);
            s2 += "关键词：" + data[i].name;
            s2 += ",开关：" + data[i].enable;
            s2 += ",模糊还是精确：" + data[i].mohuchaxun;
            s2 += ",是否解析cq码：" + data[i].enablecq;
            s2 += ",是否at：" + data[i].enableat;
            //s2 += ",内容：" + data[i].neirong;//可能内容过长，所以不显示
            s1 += s2 + "\n";
        }
        //console.log(s1);
        if (context.message_type == 'private') {
            send_private_msg(context, credentials.xiaoxi + "\n" + s1 + "");
        } else {
            send_group_msg(context, `[CQ:at,qq=${context.user_id}]\n` + credentials.xiaoxi + "\n" + s1 + "");
        }
    } else {
        if (context.message_type == 'private') {
            send_private_msg(context, credentials.xiaoxi + "\n未找到设定的关键词列表列表");
        } else {
            send_group_msg(context, `[CQ:at,qq=${context.user_id}]\n` + credentials.xiaoxi + "\n未找到设定的关键词列表列表");
        }
    }
}

/*async function compare(context, temp) {
    let data = await db.read().get(`guanjianci[${context.group_id}]`).find({
        name: temp[0]
    }).value();
    let frish2 = false;
    let frish3 = false;
    let frish4 = false;
    let s = "";
    if (data.enable == temp[1]) {
        frish2 = true;
    } else if (data.mohuchaxun == temp[2]) {
        frish3 = true;
    } else if (data.neirong == temp[3]) {
        frish4 = true;
    }
    if (frish2 == true || frish3 == true || frish4 == true) {
        s = "已修改关键词：" + temp[0];
    } else {
        s = "未修改关键词：" + temp[0];
    }
    bot('send_group_msg', {
        group_id: context.group_id,
        message: `[CQ:at,qq=${context.user_id}]\n` + s
    }).then(data => {
        //logger.info(data);
    }).catch(err => {
        let t = new Date();
        logger.error(t.toString() + dayjs(t.toString()).format(' A 星期d') + ":" + err);
    });
}*/

async function run() {
    /*var key= [];
    var val = String( 1513);
    var obj1 = {};
    obj1[val] =key;
    //https://www.cnblogs.com/sherlock-tang/p/7740859.html 使用变量作为key值和键值创建JavaScript对象
    console.log(obj1);*/
    bot.on('message', async context => {
        if (context.message == credentials.search && credentials.admin.toString().search(context.user_id.toString()) != -1) { //查询
            await search(context);
            return;
        }
        if (context.message_type == 'group') {
            if (context.message.search(credentials.switch) != -1 && credentials.admin.toString().search(context.user_id.toString()) != -1) { //开关
                let temp = context.message.split("=");
                if (temp.length == 2) {
                    let data0;
                    if (await db.read().has(`guanjianci[${context.group_id}]`).value() == true) {
                        data0 = await db.read().get(`guanjianci[${context.group_id}]`);
                    } else {
                        data0 = await db.read().get(`guanjianci[quanju]`);
                    }
                    let data = data0.find({
                        name: temp[1]
                    }).value();
                    if (data != undefined) {
                        let temp2 = "false";
                        let temp3 = "";
                        if (data.enable == "false") { //没输对词就默认关闭
                            temp2 = "true";
                            temp3 = "开启关键词：" + temp[1];
                        } else {
                            temp2 = "false";
                            temp3 = "关闭关键词：" + temp[1];
                        }
                        await db.read().get(`guanjianci[${context.group_id}]`).find({
                            name: temp[1]
                        }).assign({
                            enable: temp2
                        }).write();

                        send_group_msg(context, `[CQ:at,qq=${context.user_id}]\n` + temp3);
                        await search(context);
                    } else {
                        let t = new Date();
                        logger.error(t.toString() + dayjs(t.toString()).format(' A 星期d') + "未找到关键词:" + data);
                        send_group_msg(context, `[CQ:at,qq=${context.user_id}]\n` + "未找到关键词:" + data);
                    }
                } else {
                    let t = new Date();
                    logger.error(t.toString() + dayjs(t.toString()).format(' A 星期d') + "消息解析错误:" + temp);
                    send_group_msg(context, `[CQ:at,qq=${context.user_id}]\n` + "消息解析错误1:" + temp);
                }
                return;
            }
            /*if (context.message.search(credentials.add) != -1 && credentials.admin.toString().search(context.user_id.toString()) != -1) { //增加
                //关键词增加=。动画+true+false+内容
                let temp = context.message.split("=");
                let error = false;
                let s = "输入内容有误，不进行操作1";
                if (temp.length == 2) {
                    let temp2 = temp[1].split("+");
                    if (temp2.length == 4) {
                        if (await db.read().has(`guanjianci[${context.group_id}]`)
                            .value() == false) {
                            let key = [];
                            let val = String(context.group_id);
                            let obj1 = {};
                            obj1[val] = key;
                            await db.read().get('guanjianci').defaults(obj1).write();
                        }
                        //console.log(await db.read().get(`guanjianci[${context.group_id}]`).filter({
                        //    name: temp2[0]
                        //}).value());
                        if (await db.read().get(`guanjianci[${context.group_id}]`).filter({
                                name: temp2[0]
                            }).value().length == 0) {
                            await db.read().get(`guanjianci[${context.group_id}]`)
                                .push({
                                    name: temp2[0],
                                    enable: temp2[1],
                                    mohuchaxun: temp2[2],
                                    neirong: temp2[3]
                                })
                                .write();
                            await search(context);
                            logger.info(temp2[0]);
                            let data = await db.read().get(`guanjianci[${context.group_id}]`).find({
                                name: temp2[0]
                            }).value();
                            logger.info(JSON.stringify(data));
                            if (data != undefined) {
                                bot('send_group_msg', {
                                    group_id: context.group_id,
                                    message: `[CQ:at,qq=${context.user_id}]\n` + "已添加：" + temp2[0]
                                }).then(data => {
                                    //logger.info(data);
                                }).catch(err => {
                                    let t = new Date();
                                    logger.error(t.toString() + dayjs(t.toString()).format(' A 星期d') + ":" + err);
                                });
                            }
                            return;
                        }
                    } else {
                        //logger.info(2);
                        error = true;
                        s = "输入参数过多或缺失，请确认格式为:关键词增加=。动画+true+false+内容";
                    }
                } else {
                    //logger.info(3);
                    error = true;
                    s = "输入参数过多或缺失，请确认格式为:关键词增加=。动画+true+false+内容";
                }
                if (error == true) {
                    bot('send_group_msg', {
                        group_id: context.group_id,
                        message: `[CQ:at,qq=${context.user_id}]\n` + s
                    }).then(data => {
                        //logger.info(data);
                    }).catch(err => {
                        let t = new Date();
                        logger.error(t.toString() + dayjs(t.toString()).format(' A 星期d') + ":" + err);
                    });
                }
                return;
            }
            if (context.message.search(credentials.del) != -1 && credentials.admin.toString().search(context.user_id.toString()) != -1) { //删除
                //关键词删除=。动画
                let temp = context.message.split("=");
                if (temp.length == 2) {
                    let data = await db.read().get(`guanjianci[${context.group_id}]`).find({
                        name: temp[1]
                    }).value();
                    if (data == undefined) {
                        bot('send_group_msg', {
                            group_id: context.group_id,
                            message: `[CQ:at,qq=${context.user_id}]\n` + "未发现：" + temp[1] + ",不做任何动作"
                        }).then(data => {
                            //logger.info(data);
                        }).catch(err => {
                            let t = new Date();
                            logger.error(t.toString() + dayjs(t.toString()).format(' A 星期d') + ":" + err);
                        });
                        await search(context);
                        return;
                    }
                    await db.read().get(`guanjianci[${context.group_id}]`)
                        .remove({
                            name: temp[1]
                        })
                        .write();
                    data = await db.read().get(`guanjianci[${context.group_id}]`).find({
                        name: temp[1]
                    }).value();
                    if (data == undefined) {
                        bot('send_group_msg', {
                            group_id: context.group_id,
                            message: `[CQ:at,qq=${context.user_id}]\n` + "已删除：" + temp[1]
                        }).then(data => {
                            //logger.info(data);
                        }).catch(err => {
                            let t = new Date();
                            logger.error(t.toString() + dayjs(t.toString()).format(' A 星期d') + ":" + err);
                        });
                        await search(context);
                    }
                }
            }
            if (context.message.search(credentials.upd) != -1 && credentials.admin.toString().search(context.user_id.toString()) != -1) { //修改
                //关键词修改=。动画+true+false+内容
                let temp = context.message.split("=");
                let error = false;
                let s = "输入内容有误，不进行操作2";
                if (temp.length == 2) {
                    let temp2 = temp[1].split("+");
                    if (temp2.length == 4) {
                        if (await db.read().get(`guanjianci[${context.group_id}]`).filter({
                                name: temp2
                            }).value().length == 1) {
                            await db.read().get(`guanjianci[${context.group_id}]`)
                                .find({
                                    name: temp2[0]
                                }).assign({
                                    name: temp2[0],
                                    enable: temp2[1],
                                    mohuchaxun: temp2[2],
                                    neirong: temp2[3]
                                })
                                .write();

                            await compare(context, temp2);
                            await search(context);
                            return;
                        } else {
                            error = true;
                            s = "存在多个相同的关键词，不进行操作";
                        }
                    } else {
                        error = true;
                        s = "输入参数过多或缺失，请确认格式为:关键词增加=。动画+true+false+内容";
                    }
                } else {
                    error = true;
                    s = "输入参数过多或缺失，请确认格式为:关键词增加=。动画+true+false+内容";
                }
                if (error == true) {
                    bot('send_group_msg', {
                        group_id: `[CQ:at,qq=${context.user_id}]\n` + context.group_id,
                        message: s
                    }).then(data => {
                        //logger.info(data);
                    }).catch(err => {
                        let t = new Date();
                        logger.error(t.toString() + dayjs(t.toString()).format(' A 星期d') + ":" + err);
                    });
                }
                return;
            }*/
        }
    });
    bot.on('message', async context => {
        let uid = context.user_id;
        if (uid) {
            let cacheKeys = [`${uid}-${true}`]; //防御狂刷
            if (cacheKeys.some(key => cache.has(key))) {
                return;
            } else {
                [true].forEach((id, i) => id && cache.set(cacheKeys[i], true));
            }
        }
        if (context.message_type == 'group') {
            let temp1 = false; //确认匹配
            //console.log(context.user_id);
            //console.log(context.message);
            //console.log(context);
            //console.log(credentials.search)
            //console.log(credentials.admin)
            let data;
            if (await db.read().has(`guanjianci[${context.group_id}]`).value() == true) {
                data = await db.read().get(`guanjianci[${context.group_id}]`).value();
            } else {
                data = await db.read().get(`guanjianci[quanju]`).value();
            }
            //logger.info(data);
            if (data != undefined) { //console.log(c2);
                //console.log(i2);
                for (let i = 0; i < data.length; i++) {
                    /*console.log(data[i].name);
                    console.log(data[i].enable);
                    console.log(data[i].mohuchaxun);
                    console.log(data[i].neirong);*/
                    if (data[i].enable == "true") {
                        let temp2 = data[i].name.split(" "); //解析空格
                        for (let ii = 0; ii < temp2.length; ii++) {
                            if (data[i].mohuchaxun == "false") {
                                if (context.message == temp2[ii]) { //精确查询
                                    temp1 = true;
                                    break;
                                }
                            } else {
                                if (context.message.search(temp2[ii]) != -1) { //模糊查询
                                    temp1 = true;
                                    break;
                                }
                            }
                        }
                    }
                    if (temp1 == true) {
                        send_group_msg(context, (data[i].enableat == "true" ? `[CQ:at,qq=${context.user_id}]\n` : "") + data[i].neirong, data[i].enablecq == "true" ? false : true); //第三项是true为不解析cq码
                        break;
                    }
                }
            }
            //logger.info("66666");
        } else if (context.message_type == 'private') {
            let temp1 = false; //确认匹配
            //console.log(context.user_id);
            //console.log(context.message);
            //console.log(context);
            //console.log(credentials.search)
            //console.log(credentials.admin)
            let data = await db.read().get(`guanjianci[quanju]`).value();
            //logger.info(data);
            if (data != undefined) { //console.log(c2);
                //console.log(i2);
                for (let i = 0; i < data.length; i++) {
                    /*console.log(data[i].name);
                    console.log(data[i].enable);
                    console.log(data[i].mohuchaxun);
                    console.log(data[i].neirong);*/
                    if (data[i].enable == "true") {
                        let temp2 = data[i].name.split(" "); //解析空格
                        for (let ii = 0; ii < temp2.length; ii++) {
                            if (data[i].mohuchaxun == "false") {
                                if (context.message == temp2[ii]) { //精确查询
                                    temp1 = true;
                                    break;
                                }
                            } else {
                                if (context.message.search(temp2[ii]) != -1) { //模糊查询
                                    temp1 = true;
                                    break;
                                }
                            }
                        }
                    }
                    if (temp1 == true) {
                        send_private_msg(context, data[i].neirong, data[i].enablecq == "true" ? false : true); //第三项是true为不解析cq码
                        break;
                    }
                }
            }
        }
        /*if (context.message == "test") {
            return;
            bot('get_group_list').then(async data => {
                //logger.info(data.data.length);
                for (let i = 0; i < data.data.length; i++) {
                    //console.log(data.data[i].group_id);
                    await pfcache.createTable(data.data[i].group_id);
                    bot('get_group_member_list', {
                        group_id: data.data[i].group_id
                    }).then(async data2 => {
                        //logger.info(JSON.stringify(data2));
                        for (let ii = 0; ii < data2.data.length; ii++) {
                            await pfcache.addCache(data2.data[ii].group_id, data2.data[ii].user_id, data2.data[ii].nickname);
                        }
                        let temp = await pfcache.getCache(context.group_id, context.user_id);
                        logger.info((temp != false ? temp.nickname : "2333"));
                    }).catch(err => {
                        logger.error(new Date().toString() + "加群3:" + JSON.stringify(err));
                    });
                }
            }).catch(err => {
                logger.error(new Date().toString() + "加群4:" + JSON.stringify(err));
            });
        }*/
    });
}
/**
# 群成员增加
# 上报数据
字段名	数据类型	可能的值	说明
post_type	string	notice	上报类型
notice_type	string	group_increase	通知类型
sub_type	string	approve、invite	事件子类型，分别表示管理员已同意入群、管理员邀请入群
group_id	number (int64)	-	群号
operator_id	number (int64)	-	操作者 QQ 号
user_id	number (int64)	-	加入者 QQ 号

 群成员减少
# 上报数据
字段名	数据类型	可能的值	说明
post_type	string	notice	上报类型
notice_type	string	group_decrease	通知类型
sub_type	string	leave、kick、kick_me	事件子类型，分别表示主动退群、成员被踢、登录号被踢
group_id	number (int64)	-	群号
operator_id	number (int64)	-	操作者 QQ 号（如果是主动退群，则和 user_id 相同）
user_id	number (int64)	-	离开者 QQ 号
 */
//-------------------------------------------
async function search2(context) {
    let data = await db2.read().get(`jiaquntuiqun[${context.group_id}]`).value();
    let s1 = "";
    let s2 = "";
    //logger.info("search:" + data)
    if (data != undefined) {
        for (let i = 0; i < data.length; i++) {
            s2 = "\n";
            //console.log(data[i].name);
            //console.log(data[i].enable);
            //console.log(data[i].mohuchaxun);
            //console.log(data[i].neirong);
            s2 += "加群发言词开关：" + data[i].kaiguan1 + "\n";
            s2 += "退群发言词开关：" + data[i].kaiguan2 + "\n";
            s2 += "加群发言词：(AT人)" + data[i].come + "\n";
            s2 += "退群发言词：(显示QQ号)" + data[i].out;
            //s2 += ",内容：" + data[i].neirong;
            s1 += s2 + "\n";
        }
        //console.log(s1);
        send_group_msg(context, `[CQ:at,qq=${context.user_id}]\n` + credentials.xiaoxi2 + s1 + "");
    } else {
        let key = [];
        let val = String(context.group_id);
        let obj1 = {};
        obj1[val] = key;
        await db2.read().get('jiaquntuiqun').defaults(obj1).write();
        await db2.read().get(`jiaquntuiqun[${context.group_id}]`)
            .push({
                id: context.group_id,
                kaiguan1: "false",
                kaiguan2: "false",
                come: "",
                out: ""
            })
            .write();
        send_group_msg(context, `[CQ:at,qq=${context.user_id}]\n` + credentials.xiaoxi2 + "\n未找到设定的加群退群自动发言列表，系统已自动创建，请再输入'加群进群'查询，默认禁用");
    }
}

async function run2() {
    function group() //获取并储存群成员昵称列表
    {
        bot('get_group_list').then(async data => {
            //logger.info(data.data.length);
            for (let i = 0; i < data.data.length; i++) {
                //console.log(data.data[i].group_id);
                await pfcache.createTable(data.data[i].group_id);
                bot('get_group_member_list', {
                    group_id: data.data[i].group_id
                }).then(async data2 => {
                    //logger.info(JSON.stringify(data2));
                    for (let ii = 0; ii < data2.data.length; ii++) {
                        await pfcache.addCache(data2.data[ii].group_id, data2.data[ii].user_id, data2.data[ii].nickname);
                    }
                    //let temp=await pfcache.getCache(context.group_id,context.user_id);
                    //logger.info((temp!=false?temp.nickname:"2333"));
                }).catch(err => {
                    logger.error(new Date().toString() + "获取并储存群成员昵称列表1:" + JSON.stringify(err));
                });
            }
        }).catch(err => {
            logger.error(new Date().toString() + "获取并储存群成员昵称列表2:" + err);
        });
    }
    await group(); //初始化获取群成员昵称列表
    setInterval(async () => {
            await group();
        },
        1 * 60 * 60 * 1000); //每1小时更新一次群成员列表
    bot.on('message', async context => { //操作
        if (context.message_type == 'group') {
            if (context.message == credentials.jiaquntuiqun) { //查询
                await search2(context);
                return;
            }
            //不知道CQ码如何处理
            if (context.message.search(credentials.jiaquntuiqun2) != -1 && credentials.admin.toString().search(context.user_id.toString()) != -1) { //开关
                //进群退群开关=true+true
                let temp = context.message.split("=");
                let error = false;
                let s = "输入内容有误，不进行操作3";
                if (temp.length == 2) {
                    let temp2 = temp[1].split("+");
                    if (temp2.length == 2 && (temp2[0] == "true" || temp2[0] == "false") && (temp2[1] == "true" || temp2[1] == "false")) {
                        let temp3 = "false";
                        let temp4 = "false";
                        if (temp2[0] == "true") {
                            temp3 = "true";
                        }
                        if (temp2[1] == "true") {
                            temp4 = "true";
                        }
                        //logger.info(await db2.read().has(`jiaquntuiqun[${context.group_id}]`).value());
                        if (await db2.read().has(`jiaquntuiqun[${context.group_id}]`)
                            .value() == true) {
                            await db2.read().get(`jiaquntuiqun[${context.group_id}]`).find({
                                    id: context.group_id
                                }).assign({
                                    kaiguan1: temp3,
                                    kaiguan2: temp4,
                                })
                                .write();
                            //logger.info("66666666666666666666");
                            await search2(context);
                            return;
                        } else {
                            let key = [];
                            let val = String(context.group_id);
                            let obj1 = {};
                            obj1[val] = key;
                            await db2.read().get('jiaquntuiqun').defaults(obj1).write();
                            await db2.read().get(`jiaquntuiqun[${context.group_id}]`)
                                .push({
                                    id: context.group_id,
                                    kaiguan1: "false",
                                    kaiguan2: "false",
                                    come: "",
                                    out: ""
                                })
                                .write();
                            send_group_msg(context, `[CQ:at,qq=${context.user_id}]\n` + credentials.xiaoxi2 + "\n未找到设定的加群退群自动发言列表，系统已自动创建，请再输入'加群进群'查询，默认禁用");
                            return;
                        }
                    } else {
                        error = true;
                        s = "输入参数错误或缺失、过多，请确认格式为:加群退群开关=true+true";
                    }
                } else {
                    error = true;
                    s = "输入参数错误或缺失、过多，请确认格式为:加群退群开关=true+true";
                }
                if (error == true) {
                    send_group_msg(context, `[CQ:at,qq=${context.user_id}]\n` + s);
                }
                return;
            }
        }
    });
    //加群
    bot.on('notice', async context => {
        if (context.notice_type === 'group_increase') {
            // 处理群成员添加事件
            //const name = data.nickname || '新人';
            if (await db2.read().has(`jiaquntuiqun[${context.group_id}]`)
                .value() == false) {
                let key = [];
                let val = String(context.group_id);
                let obj1 = {};
                obj1[val] = key;
                await db2.read().get('jiaquntuiqun').defaults(obj1).write();
                await db2.read().get(`jiaquntuiqun[${context.group_id}]`)
                    .push({
                        id: context.group_id,
                        kaiguan1: "false",
                        kaiguan2: "false",
                        come: "",
                        out: ""
                    })
                    .write();
            }
            let data2 = await db2.read().get(`jiaquntuiqun[${context.group_id}]`).value()[0];
            //logger.info(JSON.stringify(context));
            //logger.info(data2.kaiguan1);
            if (data2.kaiguan1 == "true") {
                send_group_msg(context, `欢迎[CQ:at,qq=${context.user_id}]加入本群!\n${data2.come}`);
                bot('get_group_member_info', {
                    group_id: context.group_id,
                    user_id: context.user_id
                }).then(async data => {
                    const name = data.data.nickname || "";
                    await pfcache.addCache(context.group_id, context.user_id, name);
                    /*
                    {
                        "data": {
                            "age": 0,
                            "area": "",
                            "card": "",
                            "card_changeable": false,
                            "group_id": ,
                            "join_time": ,
                            "last_sent_time": 0,
                            "level": "0",
                            "nickname": "",
                            "role": "member",
                            "sex": "unknown",
                            "title": "",
                            "title_expire_time": 0,
                            "unfriendly": false,
                            "user_id": 
                        },
                        "retcode": 0,
                        "status": "ok"
                    }
                    */
                    //logger.info(JSON.stringify(data));
                }).catch(err => {
                    logger.error(new Date().toString() + "加群:" + JSON.stringify(err));
                });
            }
        }
        if (context.notice_type === 'group_decrease') {
            // 处理群成员减少事件
            //const name = data.nickname || '有群员';//要使用数据库记录群成员昵称才能实现，因为退群后无法使用get_group_member_info
            if (await db2.read().has(`jiaquntuiqun[${context.group_id}]`)
                .value() == false) {
                let key = [];
                let val = String(context.group_id);
                let obj1 = {};
                obj1[val] = key;
                await db2.read().get('jiaquntuiqun').defaults(obj1).write();
                await db2.read().get(`jiaquntuiqun[${context.group_id}]`)
                    .push({
                        id: context.group_id,
                        kaiguan1: "false",
                        kaiguan2: "false",
                        come: "",
                        out: ""
                    })
                    .write();
            }
            let data2 = await db2.read().get(`jiaquntuiqun[${context.group_id}]`).value()[0];
            if (data2.kaiguan2 == "true") {
                let temp = await pfcache.getCache(context.group_id, context.user_id);
                await pfcache.delCache(context.group_id, context.user_id);
                //logger.info((temp!=false?temp.nickname:""));
                send_group_msg(context, `很遗憾${temp!=false&&temp!=""?"("+temp.nickname+")":""}${context.user_id}离开了本群。\n${data2.out}`);
            }
        }
        // 忽略其它事件
    });
}

function send_group_msg(context, msg, auto_escape = false) {
    bot('send_group_msg', {
        group_id: context.group_id,
        message: msg,
        auto_escape: auto_escape
    }).then(data => {
        let t = new Date();
        logger.info(t.toString() + dayjs(t.toString()).format(' A 星期d') + ", 群聊: " + JSON.stringify(data));
    }).catch(err => {
        let t = new Date();
        logger.error(t.toString() + dayjs(t.toString()).format(' A 星期d') + ", 群聊: " + JSON.stringify(err));
    });
}

function send_private_msg(context, msg, auto_escape = false) {
    bot('send_private_msg', {
        user_id: context.user_id,
        message: msg,
        auto_escape: auto_escape
    }).then(data => {
        let t = new Date();
        logger.info(t.toString() + dayjs(t.toString()).format(' A 星期d') + ", 私聊: " + JSON.stringify(data));
    }).catch(err => {
        let t = new Date();
        logger.error(t.toString() + dayjs(t.toString()).format(' A 星期d') + ", 私聊: " + JSON.stringify(err));
    });
}
run();
run2();
let t = new Date();
//logger.info(t.getUTCHours()+8);
//logger.info(t.getMinutes());
//logger.info(t.getSeconds());
logger.info('关键词和加群退群,' + t.toString() + dayjs(t.toString()).format(' A 星期d'));
bot('get_status').then(data1 => {
    logger.info(JSON.stringify(data1));
    if (data1.data.online != false || data1.data.online != null) {
        logger.info(t.toString() + dayjs(t.toString()).format(' A 星期d').replace("星期0", "星期天") + ", gocqhttp在线中：" + data1.data.online);
        bot('send_private_msg', {
            user_id: credentials.admin,
            message: `关键词和加群退群插件已启动`,
        });
    }
}).catch(err => {
    logger.error(t.toString() + dayjs(t.toString()).format(' A 星期d').replace("星期0", "星期天") + ", get_status:" + err);
});