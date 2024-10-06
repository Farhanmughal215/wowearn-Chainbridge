
import crypto from 'crypto';
import db from "../db/db.js";
import utils from "../utils.js";


class ChainOrder {
    constructor() {
        this.id = 0;
        this.oid = '';

        this.fromHash = '';
        this.fromNet = '';
        this.fromSymbol = '';
        this.fromAddress = '';
        this.fromLower = '';
        this.fromAmount = '';
        this.fromReceiver = '';

        this.toHash = '';
        this.toNet = '';
        this.toSymbol = '';
        this.toAddress = '';
        this.toLower = '';
        this.toAmount = '';
        this.fail_reason = '';
        this.refund_time = null;
        this.refund_hash = null;

        this.fee = 0.0;
        this.status = 0;

        this.createTime = 0;
        this.createStr = '';
        this.updateTime = 0;
        this.updateStr = '';
        this.expireTime = 0;
        this.expireStr = '';
    }
};

// 正常状态
ChainOrder.StatusPending      = 0;  // 订单已经创建，尚未收到币
ChainOrder.StatusReceived     = 1;  // from的链已经收到币，尚未给to的链转币
ChainOrder.StatusBroadcasted  = 2;  // 已经给to的链转了币，但是链上没确认
ChainOrder.StatusSent         = 4;  // 链上已经确认
ChainOrder.StatusRefund       = 5;  // 已退款
ChainOrder.StatusRefundFail   = 6;  // 退款失败

// 异常状态
ChainOrder.StatusExpire      = 10;   // 超时
ChainOrder.StatusToFailed    = 11;   // 转出链发送失败
ChainOrder.StatusUnknow      = 12;   // 未知转账


ChainOrder.insert = async function(o) {
    try {
        o.updateTime = o.createTime;
        o.updateStr = o.createStr;

        const sql = 'insert into chain_order ('
         + ' oid, createTime, createStr, updateTime, updateStr, expireTime, expireStr'
         + ' , fromHash, fromNet, fromSymbol, fromAddress, fromLower, fromAmount'
         + ' , toHash, toNet, toSymbol, toAddress, toLower, toAmount'
         + ' , status, fee, fromReceiver'
         + ' ) values ('
         + ` '${o.oid}', ${o.createTime}, '${o.createStr}', ${o.updateTime}, '${o.updateStr}', ${o.expireTime}, '${o.expireStr}'` 
         + ` , '${o.fromHash}', '${o.fromNet}', '${o.fromSymbol}', '${o.fromAddress}', '${o.fromLower}', '${o.fromAmount}'`
         + ` , '${o.toHash}', '${o.toNet}', '${o.toSymbol}', '${o.toAddress}', '${o.toLower}', '${o.toAmount}'`
         + ` , ${o.status}, ${o.fee}, '${o.fromReceiver}'`
         + ')'
         ;

        const results = await db.executeSQL(sql);

        return !!results && 1 === results.affectedRows;
    } catch (e) {
        utils.getServerLog().error('ChainOrder.insert exception. order = ', o, e);
        return null;
    }
}


ChainOrder.updateTx = async function(o) {
    try {
        o.updateTime = Date.now();
        o.updateStr = utils.UTCTimeString(o.updateTime, false);

        let sql = 'update chain_order set '
                  + ` status = ${o.status}`;
                  if(o.toHash){
                    sql += ` ,toHash = '${o.toHash}'`
                  }
                  
                  if(o.fromHash){
                    sql += ` ,fromHash = '${o.fromHash}'`
                  }
                  
                sql += `, updateTime = ${o.updateTime}`
                + `, updateStr = '${o.updateStr}'`
                + ` where id = ${o.id}`;
        const results = await db.executeSQL(sql);

        return !!results && 1 === results.affectedRows;
    } catch (e) {
        utils.getServerLog().error('ChainOrder.update exception. order = ', o, e);
        return null;
    }
}


ChainOrder.update = async function(o) {
    try {
        o.updateTime = Date.now();
        o.updateStr = utils.UTCTimeString(o.updateTime, false);

        const sql = 'update chain_order set'
                  + ` fromHash = '${o.fromHash}'`
                  + `, fromNet = '${o.fromNet}'`
                  + `, fromSymbol = '${o.fromSymbol}'`
                  + `, fromAddress = '${o.fromAddress}'`
                  + `, fromLower = '${o.fromLower}'`
                  + `, fromAmount = '${o.fromAmount}'`
                  + `, fromReceiver = '${o.fromReceiver}'`
                  + `, toHash = '${o.toHash}'`
                  + `, toNet = '${o.toNet}'`
                  + `, toSymbol = '${o.toSymbol}'`
                  + `, toAddress = '${o.toAddress}'`
                  + `, toLower = '${o.toLower}'`
                  + `, toAmount = '${o.toAmount}'`

                  + `, fee = ${o.fee}`
                  + `, status = ${o.status}`
                  + `, createTime = ${o.createTime}`
                  + `, createStr = '${o.createStr}'`
    
                  + `, updateTime = ${o.updateTime}`
                  + `, updateStr = '${o.updateStr}'`

                  + `, expireTime = ${o.expireTime}`
                  + `, expireStr = '${o.expireStr}'`

                  + ` where id = ${o.id}`
                  ;

        const results = await db.executeSQL(sql);

        return !!results && 1 === results.affectedRows;
    } catch (e) {
        utils.getServerLog().error('ChainOrder.update exception. order = ', o, e);
        return null;
    }
}



ChainOrder.updateStatusById = async function(id,status) {
    try {
        const updateTime = Date.now();
        const updateStr = utils.UTCTimeString(updateTime, false);

        let sql = 'update chain_order set '
        + ` status = ${status}`
        +` , updateTime = ${updateTime}`
        + ` , updateStr = '${updateStr}'`
        + ` where id = ${id} `
        ;
        const results = await db.executeSQL(sql);

        return !!results && results.affectedRows > 0;
    } catch (e) {
        utils.getServerLog().error('ChainOrder.updateStatus exception. id = ', id, 'status = ', status, e);
        return null;
    }
 }

ChainOrder.updateStatus = async function(o) {
    try {
        const updateTime = Date.now();
        const updateStr = utils.UTCTimeString(updateTime, false);

        let sql = 'update chain_order set '
        + ` status = ${o.status}`;
        if(o.refund_hash){
            sql += `, refund_hash = '${o.refund_hash}'`
        }
        if(o.refund_time){
            sql += `, refund_time = '${o.refund_time}'`
        }
        if(o.fail_reason){
            sql += `, fail_reason = '${o.fail_reason}'`
        }

        sql += ` , updateTime = ${updateTime}`
        + ` , updateStr = '${updateStr}'`
        + ` where id = ${o.id} `
        ;

        utils.getServerLog().info('ChainOrder.updateStatus sql = ', sql);
    
        const results = await db.executeSQL(sql);

        return !!results && results.affectedRows > 0;
    } catch (e) {
        utils.getServerLog().error('ChainOrder.updateStatus exception. id = ', id, 'status = ', status, e);
        return null;
    }
 }

ChainOrder.getOpenRecordByAddress = async function (address, isFrom) {
    try {
        if (!address || !address.length) {
            return null;
        }

        let addressSQL = '';

        if (isFrom === undefined) {
            addressSQL = ` (fromLower = '${address.toLowerCase()}' or toLower = '${address.toLowerCase()}')`;  
        } else if (isFrom) {
            addressSQL = ` fromLower = '${address.toLowerCase()}'`;  
        } else {
            addressSQL = ` toLower = '${address.toLowerCase()}'`;  
        }

        const statusSQL = `( status = ${ChainOrder.StatusPending} `
                         + ` or status = ${ChainOrder.StatusReceived} `
                         + ` or status = ${ChainOrder.StatusBroadcasted} ) `;
        
        const excludeSql = `(fromNet != 'TRON')`;

        const sql = 'select * from chain_order where ' + addressSQL + ' AND ' + excludeSql +  ' and ' + statusSQL;
        const results = await db.executeSQL(sql);

        if (!results) {
            return null;
        }

        const list = [];

        for (const rowData of results) {
            const obj = db.initObject(new ChainOrder(), rowData);

            if (!obj) {
                continue;
            }
    
            list.push(obj);
        }
    
        return list;
    } catch (e) {
        utils.getServerLog().error('ChainOrder.getOpenRecordByAddress excepted. address = ', address, 'isFrom = ', isFrom, e);

        return null;
    }
}



ChainOrder.getTrcOpenRecord = async function () {
    try {
        const statusSQL = `( status = ${ChainOrder.StatusPending} `
                         + ` or status = ${ChainOrder.StatusReceived} `
                         + ` or status = ${ChainOrder.StatusBroadcasted} ) `;
        
        const trcSql = `(fromNet = 'TRON')`;

        const sql = 'SELECT * FROM chain_order WHERE ' + trcSql + ' AND ' +  statusSQL;
        
        const results = await db.executeSQL(sql);

        if (!results) {
            return null;
        }

        const list = [];

        for (const rowData of results) {
            const obj = db.initObject(new ChainOrder(), rowData);

            if (!obj) {
                continue;
            }
    
            list.push(obj);
        }
    
        return list;
    } catch (e) {
        utils.getServerLog().error('ChainOrder.getTrcOpenRecordByAddress excepted. address = ', address, 'isFrom = ', isFrom, e);

        return null;
    }
}
 
ChainOrder.getPendingRecordByAddress = async function (address, isFrom) {
    try {
        if (!address || !address.length) {
            return null;
        }

        const fieldName = isFrom ? 'fromLower' : 'toLower';

        const sql = 'select * from chain_order where '
                    + `${fieldName} = '${address.toLowerCase()}' `
                    + ` and status = ${ChainOrder.StatusPending}`;
        const results = await db.executeSQL(sql);

        if (!results) {
            return null;
        }

        const list = [];

        for (const rowData of results) {
            const obj = db.initObject(new ChainOrder(), rowData);

            if (!obj) {
                continue;
            }
    
            list.push(obj);
        }
    
        return list;
    } catch (e) {
        utils.getServerLog().error('ChainOrder.getPendingRecordByAddress excepted. address = ' + address, 'isFrom = ', isFrom, e);

        return null;
    }
}



ChainOrder.getById = async function (id) {
    try {
        if (null == id || undefined == id) {
            return null;
        }

        const sql = 'select * from chain_order where id  = ' + id;
        const result = await db.executeSQL(sql);
        if (!result) {
            return null;
        }
        return result[0];
    } catch (e) {
        utils.getServerLog().error('ChainOrder.getById excepted. id = ' + id, e);
        return null;
    }
}

ChainOrder.getRecordByStatus = async function (status) {
    try {
        const sql = `select * from chain_order where status = ${status} order by id desc `;
        const results = await db.executeSQL(sql);

        if (!results) {
            return null;
        }

        const lst = [];

        for (const rowData of results) {
            const obj = db.initObject(new ChainOrder(), rowData);

            if (!obj) {
                continue;
            }
    
            lst.push(obj);
        }
    
        return lst;
    } catch (e) {
        utils.getServerLog().error('ChainOrder.getRecordByStatus excepted. status = ' + status, e);

        return null;
    }
}


export default ChainOrder;