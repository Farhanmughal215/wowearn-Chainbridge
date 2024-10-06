import db from "../db/db.js";
import utils from "../utils.js";


class UnknowOrder {
    constructor() {
        this.id = 0;
        this.from_net = '';
        this.from_address = '';
        this.from_amount = null;
        this.to_net = '';
        this.to_address = '';
        this.to_amount = null;
        this.tx_hash = '';
        this.fail_reason = '';
        this.status = 0;
        this.trade_time= null;
        this.create_time = 0;
        this.create_str = '';
        this.update_time = 0;
        this.update_str = '';
    }
};


// 正常状态
UnknowOrder.NORMAL      = 0;  // 未退款
UnknowOrder.REFUNDED     = 1;  // 已退款
UnknowOrder.REFUND_FAILED  = 2;  // 退款失败


UnknowOrder.insert = async function(o) {
    try {
        o.updateTime = o.createTime;
        o.updateStr = o.createStr;

        const sql = 'insert into unknow_order ('
         + ' from_net,from_address,from_amount,to_net,to_address,to_amount,tx_hash,status,'
         + ' trade_time, create_time, create_str, update_time, update_str) values ('
         + ` '${o.from_net}', '${o.from_address}', '${o.from_amount}', '${o.to_net}',` 
         + ` '${o.to_address}', '${o.to_amount}', '${o.tx_hash}','${o.status}', '${o.trade_time}', `
         + ` '${o.create_time}' ,'${o.create_str}', '${o.update_time}', '${o.update_str}'`
         + ')'
         ;

        const results = await db.executeSQL(sql);

        return !!results && 1 === results.affectedRows;
    } catch (e) {
        utils.getServerLog().error('UnknowOrder.insert exception. order = ', o, e);
        return null;
    }
}


UnknowOrder.getById = async function (id) {
    try {
        if (null == id || undefined == id) {
            return null;
        }

        const sql = 'select * from unknow_order where id  = ' + id;
        const result = await db.executeSQL(sql);
        if (!result) {
            return null;
        }
        return result[0];
    } catch (e) {
        utils.getServerLog().error('UnknowOrder.getById excepted. id = ' + id, e);
        return null;
    }
}




UnknowOrder.update = async function(o) {
    try {
        const updateTime = Date.now();
        const updateStr = utils.UTCTimeString(updateTime, false);

        const sql = 'update unknow_order set '
        
        + `  update_time = ${updateTime}`
        + ` , update_str = '${updateStr}'`;
        if(o.status != null){
            sql += `, status = ${o.status}`
        }
        if(o.tx_hash != null){
            sql += `, tx_hash = '${o.tx_hash}'`
        }
        if(o.fail_reason != null){
            sql += `, fail_reason = '${o.fail_reason}'`
        }
        sql += ` where id = ${id} `;
    
        const results = await db.executeSQL(sql);

        return !!results && results.affectedRows > 0;
    } catch (e) {
        utils.getServerLog().error('UnknowOrder.updateStatus exception. id = ', id, 'status = ', status, e);
        return null;
    }
 }


UnknowOrder.updateStatus = async function(id, status) {
    try {
        const updateTime = Date.now();
        const updateStr = utils.UTCTimeString(updateTime, false);

        const sql = 'update unknow_order set '
        + ` status = ${status}`
        + ` , update_time = ${updateTime}`
        + ` , update_str = '${updateStr}'`
        
        + ` where id = ${id} `;
    
        const results = await db.executeSQL(sql);

        return !!results && results.affectedRows > 0;
    } catch (e) {
        utils.getServerLog().error('UnknowOrder.updateStatus exception. id = ', id, 'status = ', status, e);
        return null;
    }
 }

export default UnknowOrder;