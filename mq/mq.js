import rabbitMQ from "./rabbitMQ.js";
import {
  MQ_BRIDGE_EXCHANGE,
  MQ_BRIDGE_QUEUE,
  MQ_BRIDGE_ROUTING_KEY,
} from "../env.js";

import eth from "../eth/index.js";
import utils from "../utils.js";
import ChainOrder from "../data/ChainOrder.js";
import TrcContract from "../contract/TrcContract.js";

// 这个方法应该在全局启动的时候 进行挂载
class mq {
  constructor() {
    // 判断new 的时候 conn 有没有创建
    if (!this.conn) {
      // 咩有就初始化
      this.init();
    }
  }

  async init() {
    // 初始化
    this.conn = await rabbitMQ.connectRabbitMQ(this.msgHandle, {
      exchage: MQ_BRIDGE_EXCHANGE,
      queue: MQ_BRIDGE_QUEUE,
      routingKey: MQ_BRIDGE_ROUTING_KEY,
    });
  }
  // 对消息消费的处理
  async msgHandle(data) {
    let order = JSON.parse(data);

    utils.getServerLog().info("received mq data:", order);

    await utils.sleep(1000);
    try {
      let toHash;
      //如果order.toNet是TRON 则调用TrcContract.transfer进行转账
      if (order.toNet === "TRON") {
        toHash = await TrcContract.transfer(
          order.toAddress,
          order.amount,
          order.hash
        );
      } else {
        toHash = await eth.sendBridgeToken(
          order.toAddress,
          order.hash,
          order.amount,
          order.toNet
        );
      }
      if (!toHash || null == toHash)
        throw new Error("toHash is null ,transaction failed");
      utils
        .getServerLog()
        .info(
          "sTxSuccess sendBridgeToken success. net = ",
          order.toNet,
          " toHash = ",
          toHash
        );
      order.toHash = toHash;
      order.status = ChainOrder.StatusSent;
      await ChainOrder.updateTx(order);
    } catch (error) {
      utils
        .getServerLog()
        .error(
          "sTxSuccess sendBridgeToken cateched. order = ",
          order,
          "e = ",
          error
        );
      await utils.sleep(50); // 避免立刻失败导致的和之前的 update时序颠倒
      await ChainOrder.updateStatusById(order.id, ChainOrder.StatusToFailed);
    }
  }

  async sendMessage(dataObj) {
    await rabbitMQ.sendMessage(
      this.conn,
      MQ_BRIDGE_EXCHANGE,
      MQ_BRIDGE_ROUTING_KEY,
      JSON.stringify(dataObj)
    );
  }
}

export default mq;
