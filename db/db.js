

import mysql from "mysql2";
import {MYSQL_DEFAULT_DB, MYSQL_HOST, MYSQL_PORT, MYSQL_PWD, MYSQL_USER} from "../env.js";

function newMySQLConnect() {
    const conn = mysql.createConnection({
        host     : MYSQL_HOST,
        port     : MYSQL_PORT,
        user     : MYSQL_USER,
        password : MYSQL_PWD,
        database : MYSQL_DEFAULT_DB
    });

    conn.connect();

    return conn;
}

function closeMySQLConnect(conn) {
    try {
        conn?.end();
    } catch (e) {
        console.error('close connection failed', e.toString());
        console.error(e);
    }
}

export default {
    // 插入单独那出来写，是因为要有幂等, 如果不需要幂等，可以不用这个插入函数
    async insertIdempotent(sql) {
        const dbPromise = new Promise((resolve, reject) => {
            const conn = newMySQLConnect();

            conn.query(sql, function (error, results, _ /*fields*/) {
                closeMySQLConnect(conn);

                if (error) {
                    if (error.code && error.code === 'ER_DUP_ENTRY') {
                        resolve(true);
                    } else {
                        console.error("======== insertIdempotent error ========");
                        console.error(error);
                        reject(false);
                    }
                }
                else {
                    resolve(true);
                }

                // console.log('The solution is: ', results[0].solution);
            });
        });

        return dbPromise;
    },

    async executeSQL(sql) {
        const dbPromise = new Promise((resolve, reject) => {
            const conn = newMySQLConnect();

            conn.query(sql, function (error, results, _ /*fields*/) {
                closeMySQLConnect(conn);

                if (error) {
                    reject(error);
                    // throw error;
                }
                else {
                    resolve(results);
                }

                // console.log('The solution is: ', results[0].solution);
            });
        });

        return dbPromise;
    },

    initObject(o, rowData) {
        if (!rowData) {
            return null;
        }

        const attributes = Object.keys(o);

        for (const ar of attributes) {
            o[ar] = rowData[ar];
        }

        return o;
    }
}

