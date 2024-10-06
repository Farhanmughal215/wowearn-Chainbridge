import axios from "axios";
import { ErrCodeDefault, getErrCodeMsg } from "./env/Constants.js";

import log4js from "log4js";

log4js.configure({
  appenders: {
    console: {
      type: "console",
    },
    serverlog: {
      type: "dateFile",
      filename: "logs/server.log",
      pattern: "yyyy-MM-dd.log",
      // alwaysIncludePattern: true,
      // maxLogSize: 10, // 无效
      // backups: 5, // 无效
      compress: true,
      numBackups: 10,
    },
    // more...
  },
  categories: {
    default: {
      appenders: ["console"],
      level: "debug",
    },
    poollog: {
      // 指定为上面定义的appender，如果不指定，无法写入
      appenders: ["serverlog", "console"],
      level: "debug", // 指定等级
    },
    // more...
  },

  // for pm2...
  // pm2: true,
  // disableClustering: true, // not sure...
});

export default {
  buildSuccessResponse: function (data) {
    return {
      data: !data ? {} : data,
      code: 0,
      message: "success",
    };
  },

  buildErrorResponse: function (errorMessage, errCode) {
    return {
      data: {},
      code: !errCode ? ErrCodeDefault : errCode,
      message:
        !errorMessage || !errorMessage.length
          ? getErrCodeMsg(errCode)
          : errorMessage,
    };
  },

  writeInterfaceLog: function (req, data) {
    !data
      ? this.getServerLog().info("----req in: " + req.originalUrl)
      : this.getServerLog().info("----req in: " + req.originalUrl, data);
  },

  /**
   *
   * @param {*} time : millsecond or Date
   * @param {*} printMillisecond
   * @returns
   */
  UTCTimeString: function (time, appendZ = true) {
    let t = undefined;

    if ("number" === typeof time) {
      t = new Date();
      t.setTime(time);
    } else {
      t = time;
    }

    return (
      t.getUTCFullYear().toString() +
      "-" +
      (t.getUTCMonth() + 1).toString().padStart(2, "0") +
      "-" +
      t.getUTCDate().toString().padStart(2, "0") +
      (appendZ ? "T" : " ") +
      t.getUTCHours().toString().padStart(2, "0") +
      ":" +
      t.getUTCMinutes().toString().padStart(2, "0") +
      ":" +
      t.getUTCSeconds().toString().padStart(2, "0") +
      (appendZ ? ".000000Z" : "")
    );
  },

  sleep: async function (ms) {
    return await new Promise((resolve) => {
      setTimeout(resolve, ms);
    });
  },

  nolossPow10: function (floatString, decimal) {
    if (decimal < 0) {
      return undefined;
    }

    if (!floatString || !floatString.length) {
      return BigInt(0);
    }

    // 不移位，转出来就可以了
    if (0 === decimal) {
      return BigInt(floatString);
    }

    const dotIndex = floatString.indexOf(".");

    if (dotIndex < 0) {
      // 不是个小数，直接乘指数，返回
      const mulitly = BigInt(floatString);
      const multiplicand = BigInt(Math.pow(10, decimal));

      return mulitly * multiplicand;
    }

    // 小数，准备移位
    // 小数点后的字符串是否够长
    const floatStringLen = floatString.length;
    const finalLength = dotIndex + decimal; // 处理完的字符串最终长度
    const appendLength = finalLength + 1 - floatStringLen; // + 1 是要把原始字符串的小数点占1字符算进去

    if (appendLength >= 0) {
      // 要补0字符
      let tmpString = floatString;

      for (let i = 0; i < appendLength; i++) {
        tmpString = tmpString + "0";
      }

      tmpString = tmpString.replace(".", "");

      return BigInt(tmpString);
    } else {
      // 原始字符串超长，要丢弃
      // 计算丢弃字符数量
      const delLength = floatStringLen - finalLength - 1;
      let tmpString = floatString.substring(0, floatStringLen - delLength);

      tmpString = tmpString.replace(".", "");

      return BigInt(tmpString);
    }
  },

  prettyFloat: function (num, t = 18) {
    if (!num) {
      return "0";
    }

    let s = num.toFixed(t);
    let delIndex = -1;

    for (delIndex = s.length - 1; delIndex >= 0; delIndex--) {
      if (s.charAt(delIndex) !== "0") {
        break;
      }
    }

    if (delIndex >= 0) {
      s = s.substring(0, delIndex + 1);

      if (s.endsWith(".")) {
        s = s.substring(0, s.length - 1);
      }

      return s;
    } else {
      return s;
    }
  },

  normalUSDT(value, net) {
    if (!value) {
      return 0;
    }

    if ("BSC" === net) {
      return value / Math.pow(10, 18);
    } else {
      return value / Math.pow(10, 6);
    }
  },

  decimalUSDT(value, net) {
    if (!value) {
      return 0;
    }

    if ("BSC" === net) {
      return value * Math.pow(10, 18);
    } else {
      return value * Math.pow(10, 6);
    }
  },

  getUSDTDecimal(net) {
    switch (net) {
      case "BSC": {
        return 18;
      }
      case "TRON": {
        return 18;
      }
      default: {
        return 6;
      }
    }
  },

  parseContractParams(input) {
    if (!input || !input.length) {
      return null;
    }

    const params = [];

    for (let i = input.length; i > 64; i -= 64) {
      params.unshift(input.substring(i - 64, i));
    }

    return params;
  },

  postJSON(url, data) {
    return axios.post(url, !data ? {} : data, {
      headers: {
        "Content-Type": "application/json",
        // 'Authorization': SYS_TOKEN
      },
    });
  },

  getNumberDecimal(n) {
    if (n <= 0) {
      return 0;
    }

    let power = 1;

    while (n * Math.pow(10, power) < 1) {
      power += 1;
    }

    return power;
  },

  makeThrowErrorByCode(errCode) {
    const e = new Error();

    e.name = "debit";
    e.message = errCode.toString();

    return e;
  },

  getServerLog() {
    return log4js.getLogger("serverlog");
  },

  stringHashCode(str) {
    let hashcode = 0;

    for (let i = 0; i < str.length; i++) {
      hashcode = hashcode * 31 + str.charCodeAt(i);
      hashcode &= 0xffffffff;
    }

    return hashcode;
  },

  /**
   * 数据处理
   * @param arr [Array] 被处理的数组
   * @param group_key [String] 分组字段
   */
  groupData(arr, group_key) {
    let map = {};
    let res = [];

    for (let i = 0; i < arr.length; i++) {
      let ai = arr[i];
      if (!map[ai[group_key]]) {
        map[ai[group_key]] = [ai];
      } else {
        map[ai[group_key]].push(ai);
      }
    }
    Object.keys(map).forEach((key) => {
      res.push({
        [group_key]: key,
        list: map[key],
      });
    });
    return res;
  },
  
};
