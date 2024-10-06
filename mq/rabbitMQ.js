
import amqplib from "amqplib";
import { MQ_PORT, MQ_HOST, MQ_USER, MQ_PWD, MQ_PROTOCOL } from "../env.js";
import utils from "../utils.js";



export default {
    connectRabbitMQ: async function(callback, {exchage, queue, routingKey}) {
        if (!callback) {
            return ;
        }

        const mqConData = {
            protocol: MQ_PROTOCOL,
            hostname: MQ_HOST,
            port: MQ_PORT,
            username: MQ_USER,
            password: MQ_PWD,
        };

        const conn = await amqplib.connect(mqConData);

        const channel = await conn.createChannel();
        await channel.assertExchange(exchage, 'fanout');
        const q = await channel.assertQueue(queue);
        await channel.bindQueue(q.queue, exchage, routingKey);

        channel.consume(q.queue, (msg) => {
            if (msg !== null) {
                try {
                    utils.getServerLog().info('======== MQ Received a message start =======');
                    const content = msg.content.toString();
                    utils.getServerLog().info('content = ', content);
                    
                    channel.ack(msg);
                    callback(content).then(r => {
                        utils.getServerLog().info('callback success. r = ', r);
                    }).catch(e => {
                        utils.getServerLog().error('callback excepted. e = ', e);
                    });
                    utils.getServerLog().info('======== MQ Received a message end =======');
                } catch (e) {
                    utils.getServerLog().error('MQ Received a message excepted. e = ', e);
                }
            } else {
                utils.getServerLog().error('Approval cancelled by server');
            }
        });
        return conn;
    },

    sendMessage: async function(conn, exchage, routingKey, msg) {
        const channel = await conn.createChannel();
        await channel.assertExchange(exchage, 'fanout');
        await channel.publish(exchage, routingKey, Buffer.from(msg));
    },
};

