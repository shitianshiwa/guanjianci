const sqlite3 = require('sqlite3');
const {
    open
} = require('sqlite');
const Path = require('path');
const logger = require('./logger'); //日志记录

const sqlPath = Path.resolve(__dirname, '../db/db.sqlite');

/**
 * 得到当前时间戳
 *
 * @returns 当前时间戳（秒）
 */
function getDateSec() {
    return Math.floor(Date.now() / 1000);
}

/**
 * 群成员昵称列表数据库
 *
 * @class PFCache
 */
class PFCache {
    /**
     * 连接数据库
     * @memberof PFCache
     */
    constructor() {
        this.ready = false;
        this.sql = null;
        (async () => {
            this.sql = await open({
                filename: sqlPath,
                driver: sqlite3.Database,
            });
            this.ready = true;
        })().catch(e => {
            logger.error(`${new Date().toLocaleString()} [error] SQLite`);
            logger.error(e);
        });
    }
    /**
     * 创建群表单
     *
     * @param {number} userid 用户id
     * @param {string} nickname 昵称
     * @param {number} time 时间戳
     * @returns Promise
     * @memberof PFCache
     */
    async createTable(groupid) {
        if (!this.ready) return;
        await this.sql.run(
            'CREATE TABLE IF NOT EXISTS `pf' + groupid + '` ( `userid` INT NOT NULL , `nickname` VARCHAR(40) NOT NULL , `time` INT NOT NULL , PRIMARY KEY (`userid`));'
        );
    }
    /**
     * 关闭数据库连接
     *
     * @memberof PFCache
     */
    close() {
        if (!this.ready) return;
        return this.sql.close();
    }

    /**
     * 增加或更新群成员昵称
     * @param {number} groupid 群id
     * @param {number} userid 用户id
     * @param {string} nickname 昵称
     * @returns Promise
     * @memberof PFCache
     */
    addCache(groupid, userid, nickname) {
        if (!this.ready) return;
        return this.sql.run('REPLACE INTO `pf' + groupid + '` (`userid`, `nickname`, `time`) VALUES (?, ?, ?)', [
            userid,
            nickname,
            getDateSec()
        ]);
    }
    /**
     * 删除群成员昵称
     * @param {number} groupid 群id
     * @param {number} userid 用户id
     * @returns Promise
     * @memberof PFCache
     */
    delCache(groupid, userid) {
        if (!this.ready) return;
        return this.sql.run('DELETE FROM `pf' + groupid + '` WHERE `userid` = ?', [userid])
    }
    
    /**
     * 得到群成员昵称
     * @param {number} groupid 群id
     * @param {string} nickname 昵称
     * @returns
     * @memberof PFCache
     */
    async getCache(groupid, userid) {
        if (!this.ready) return;
        const result = await this.sql.get('SELECT * from `pf'+groupid+'` WHERE `userid` = ?', [userid]);
        //logger.info("result: " + JSON.stringify(result))
        if (result) {
            return result;
        }
        return false;
    }
}

module.exports = PFCache;