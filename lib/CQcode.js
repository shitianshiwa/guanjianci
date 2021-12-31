/**
 * 转义
 *
 * @param {string} str 欲转义的字符串
 * @param {boolean} [insideCQ=false] 是否在CQ码内
 * @returns 转义后的字符串
 */
function escape(str, insideCQ = false) {
    //return str;
    let temp = str.replace(/&/g, '&amp;').replace(/\[/g, '&#91;').replace(/\]/g, '&#93;');
    if (insideCQ) {
        temp = temp
            .replace(/,/g, '&#44;')
            .replace(/(\ud83c[\udf00-\udfff])|(\ud83d[\udc00-\ude4f\ude80-\udeff])|[\u2600-\u2B55]/g, ' ');
    }
    return temp;
}

/**
 * 反转义
 *
 * @param {string} str 欲反转义的字符串
 * @returns 反转义后的字符串
 */
function unescape(str) {
    return str.replace(/&#44;/g, ',').replace(/&#91;/g, '[').replace(/&#93;/g, ']').replace(/(&amp;|&#38;)/g, '&');
}

/**
 * CQ码 图片
 *
 * @param {string} file 本地文件路径或URL
 * @returns CQ码 图片
 */
function img(file) {
    //TODO: Mrs4s/go-cqhttp#9
    return `[CQ:image,file=${file}]`;
    //return `[CQ:image,file=${escape(file, true)}]`;
}

/**
 * CQ码 Base64 图片
 *
 * @param {string} base64 图片 Base64
 * @returns CQ码 图片
 */
function img64(base64) {
    return `[CQ:image,file=base64://${base64}]`;
}

/**
 * CQ码 分享链接
 *
 * @param {string} url 链接
 * @param {string} title 标题
 * @param {string} content 内容
 * @param {string} image 图片URL
 * @param {string} source 源URL
 * @returns CQ码 分享链接
 */
function share(url, title, content, image) {
    return `[CQ:share,url=${escape(url, true)},title=${escape(title, true)},content=${escape(
        content,
        true
    )},image=${escape(image, true)}]`;
}

/**
 * CQ码 @
 *
 * @param {number} qq
 * @returns CQ码 @
 */
function at(qq) {
    return `[CQ:at,qq=${qq}] `;
}

/**
 * CQ码 回复
 *
 * @param {number} id 消息ID
 * @returns CQ码 回复
 */
function reply(id) {
    return `[CQ:reply,id=${id}]`;
}

module.exports = {
    escape,
    unescape,
    share,
    img,
    img64,
    at,
    reply,
};