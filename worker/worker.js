
import utils from "../utils.js";
import schedule from "node-schedule"
import { DC_SCHEDULE_ENABLE, DC_SCHEDULE_MOD_VALUE, DC_SCHEDULE_NODE_COUNT } from "../env/distributedCfg.template.js";
import ChainOrder from "../data/ChainOrder.js";
import TrcContract from '../contract/TrcContract.js';
import { BIRDGE_CONFIG ,MQ_ENABLE} from "../env.js";
import eth from '../eth/index.js';


import mq from "../mq/mq.js"
let MQUtil = MQ_ENABLE ? new mq() : undefined;

class Worker {
    constructor() {
       
    }
}

Worker.start = async () => {
    const job1 = schedule.scheduleJob('0 * * * * * ', function () {
        Worker.scheduleExpireWorker().then(r => {
            // utils.getServerLog().info('poolUpdateJob success. ');
        }).catch(e => {
            utils.getServerLog().error('scheduleExpireWorker cron job catched an exception', e);
        });
    });

    const job2 = schedule.scheduleJob('0/30 * * * * ?', function () {
        Worker.scheduleOrderStatus().then(r => {
            utils.getServerLog().info('scheduleOrderStatus success. ');
        }).catch(e => {
            utils.getServerLog().error('scheduleOrderStatus cron job catched an exception', e);
        });
    });
}



Worker.scheduleOrderStatus = async () => {
    if (!DC_SCHEDULE_ENABLE) {
        return ;
    }

    const orderList = await ChainOrder.getTrcOpenRecord();

    
    if (!orderList || !orderList.length) {
        return ;
    }

    utils.getServerLog().info('orderList.',orderList);

    const cfg = BIRDGE_CONFIG['TRON'];
    
    let result = await TrcContract.getTRC20Transaction(cfg.collect);

    utils.getServerLog().info('result.',result);
    for (const order of orderList) {
        //用fromAddress 和 fromAmount 来匹配
        const matchList = result.filter(item => item.from == order.fromAddress && item.value.toString() == order.fromAmount);
        utils.getServerLog().info('matchList.',matchList);
        if (matchList && matchList.length) {
            utils.getServerLog().info('match success.');
            order.status = ChainOrder.StatusReceived;
            order.fromHash = matchList[0].txHash;
            order.updateTime = Date.now();
            order.updateStr = utils.UTCTimeString(order.updateTime, false);
            await ChainOrder.updateStatus(order);

            const toAmountBig = order.toNet === 'TRON'? order.toAmount: utils.nolossPow10(order.toAmount, eth.getUSDTDecimal(order.toNet));
            const toAmountStr = toAmountBig.toString();

            // 检查合约里的币够不够。 不够就退币
            const dataObj = {
                toAddress: order.toAddress,
                toNet: order.toNet,
                hash:order.fromHash,
                id:order.id,
                amount: toAmountStr
            };
            // 发送MQ 消息
            utils.getServerLog().info('mq dataObj = ', dataObj);
            //发送消息并且执行下单交易，或者退币操作
            MQUtil.sendMessage(dataObj)
        }
    }
}


Worker.scheduleExpireWorker = async () => {
    if (!DC_SCHEDULE_ENABLE) {
        return ;
    }

    const orderList = await ChainOrder.getRecordByStatus(ChainOrder.StatusPending);

    if (!orderList || !orderList.length) {
        return ;
    }

    const now = Date.now();

    for (const order of orderList) {
        if (order.id % DC_SCHEDULE_NODE_COUNT !== DC_SCHEDULE_MOD_VALUE) {
            continue ;
        }

        if (now >= order.expireTime) {
            await utils.sleep(10);
            await ChainOrder.updateStatusById(order.id, ChainOrder.StatusExpire);
        }
    }
}


export default Worker;

