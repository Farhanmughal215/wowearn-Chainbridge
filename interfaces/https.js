
import crypto from "crypto";
import utils from "../utils.js";
import eth from '../eth/index.js';
import { BIRDGE_CONFIG, CALL_TOKEN, MIN_BRIDGE_USDT, MAX_BRIDGE_USDT, PENDING_EXPIRE, MQ_ENABLE} from "../env.js";
import { ErrCodeAddress, ErrCodeContract, ErrCodeInvalidArgs, ErrCodeLessThanMin, ErrCodeNet, 
    ErrCodeNoData, ErrCodeOrderExisted, ErrCodeOverMax, ErrCodeSymbol, ErrCodeToken, ErrCodeWriteDB, getErrCodeMsg,ErrCodeDefault } from "../env/Constants.js";
import ChainOrder from "../data/ChainOrder.js";
import UnknowOrder from "../data/UnknowOrder.js";
import Referral from '../contract/referral.js';
import TrcContract from '../contract/TrcContract.js';
import Beta from '../contract/BetaContract.js';
import WOWTransfer from '../contract/WOWTransfer.js';



import mq from "../mq/mq.js"
import hdAddress from "hd-address";


let MQUtil = MQ_ENABLE ? new mq() : undefined;

export default {
    tempTemp: function(server) {
        server.get('/temp/temp', async (req, res) => {
            try {
                utils.writeInterfaceLog(req);

                res.json({ret: "OK"});
            }
            catch (e) {
                console.log(e);
                res.json({e: e.toString()});
            }
        });
    },

    cCreateOrder: function(server) {
        server.post('/chainbridge/c/co', async (req, res) => {
            try {
                //日志打印
                utils.writeInterfaceLog(req, req.body);

                //获取请求参数
                const fromAddress = req.body.fromAddress;
                const fromNet = req.body.fromNet;
                const fromAmoutStr = req.body.fromAmount;  // 字符串，正常精度
                const fromSymbol = 'WOW' === fromNet ? 'WUSDT' : 'USDT';   // req.body.fromSymbol;

                const toNet = req.body.toNet;
                const toAddress = req.body.toAddress; // req.body.toAddress;
                const toSymbol = 'WOW' === toNet ? 'WUSDT' : 'USDT';    // req.body.toSymbol;

                // 参数校验
                if (!eth.isSupportedNet(fromNet) || !eth.isSupportedNet(toNet)) {
                    utils.getServerLog().error('cCreateOrder unsupported net. fromNet = ', fromNet, ' toNet = ', toNet);
                    return res.json(utils.buildErrorResponse(null, ErrCodeNet));
                }

                // 只能跨到W链，或者从W链跨出
                if ('WOW' !== fromNet && 'WOW' != toNet) {
                    utils.getServerLog().error('cCreateOrder WOW to WOW');
                    return res.json(utils.buildErrorResponse(null, ErrCodeNet));
                }

                
                //校验是否是TRON地址
                if ('TRON' === fromNet) {
                    if (!TrcContract.isAddress(fromAddress)) {
                        utils.getServerLog().error('cCreateOrder invalid fromAddress , fromAddress = ', fromAddress);
                        return res.json(utils.buildErrorResponse(null, ErrCodeAddress));
                    }
                }else{
                    if (!eth.isValidAddress(fromAddress)) {
                        utils.getServerLog().error('cCreateOrder invalid fromAddress. from = ', fromAddress);
                        return res.json(utils.buildErrorResponse(null, ErrCodeAddress));
                    }
                }

                //校验是否是TRON地址
                if ('TRON' === toNet) {
                    if (!TrcContract.isAddress(toAddress)) {
                        utils.getServerLog().error('cCreateOrder invalid toAddress , toAddress = ', toAddress);
                        return res.json(utils.buildErrorResponse(null, ErrCodeAddress));
                    }
                }else{
                    if (!eth.isValidAddress(toAddress)) {
                        utils.getServerLog().error('cCreateOrder invalid fromAddress. to = ', toAddress);
                        return res.json(utils.buildErrorResponse(null, ErrCodeAddress));
                    }
                }

                //校验是否是合法的币种
                if(!eth.isSupportedSymbol(fromSymbol, fromNet) || !eth.isSupportedSymbol(toSymbol, toNet)) {
                    utils.getServerLog().error('cCreateOrder unsupported symbol. fromSymbol = ', fromSymbol,
                                               ' toSymbol = ', toSymbol);
                    return res.json(utils.buildErrorResponse(null, ErrCodeSymbol));
                }
                //校验金额
                const fromAmout = parseFloat(fromAmoutStr);

                if (!fromAmout) {
                    if (fromAmout < MIN_BRIDGE_USDT) {
                        utils.getServerLog().error('cCreateOrder less than min. fromAmout = ', fromAmout);
                        const errMsg = getErrCodeMsg(ErrCodeLessThanMin) + ' ' + MIN_BRIDGE_USDT;
                        
                        return res.json(utils.buildErrorResponse(errMsg, ErrCodeLessThanMin));
                    } else if (fromAmout > MAX_BRIDGE_USDT) {
                        utils.getServerLog().error('cCreateOrder over max. fromAmout = ', fromAmout);
                        const errMsg = getErrCodeMsg(ErrCodeOverMax) + ' ' + MAX_BRIDGE_USDT;
                        
                        return res.json(utils.buildErrorResponse(errMsg, ErrCodeOverMax));

                    }
                }

                //根据net获取基础配置
                const cfg = BIRDGE_CONFIG[fromNet];

                //校验是否有未完成的订单
                const records = await ChainOrder.getPendingRecordByAddress(fromAddress, true);

                if (!!records && records.length > 0) {
                    utils.getServerLog().error('cCreateOrder has pending orders. records = ', records);
                    return res.json(utils.buildErrorResponse(null, ErrCodeOrderExisted));
                }

                //创建订单所需要的参数
                const fee = 0.04;
                const toAmount = fromAmout * (1 - fee);
                const toAmountStr = utils.prettyFloat(toAmount, utils.getUSDTDecimal(toNet));

                const o = new ChainOrder();

                o.oid = crypto.randomUUID();;

                o.fromHash = '';
                o.fromNet = fromNet;
                o.fromSymbol = fromSymbol;
                o.fromAddress = fromAddress;
                o.fromLower = fromAddress.toLowerCase();
                o.fromAmount = fromAmoutStr;
                // o.fromReceiver = cfg.contract;
                o.fromReceiver = cfg.collect;


                o.toHash = '';
                o.toNet = toNet;
                o.toSymbol = toSymbol;
                o.toAddress = toAddress;
                o.toLower = toAddress.toLowerCase();
                o.toAmount = toAmountStr;
                
                o.fee = fee;
                o.status = ChainOrder.StatusPending;

                o.createTime = Date.now();
                o.createStr = utils.UTCTimeString(o.createTime, false);

                o.expireTime = o.createTime + PENDING_EXPIRE;  // 15分钟超时
                o.expireStr = utils.UTCTimeString(o.expireTime, false);

                //订单记录保存
                const success = await ChainOrder.insert(o);

                utils.getServerLog().info('cCreateOrder success = ', success, 'order = ', o);

                if (success) {
                    utils.getServerLog().info('cCreateOrder successfully');

                    return res.json(utils.buildSuccessResponse({
                        oid: o.oid,       // 订单id
                        fromAddress: o.fromAddress,   // 转出的地址
                        fromAmount: o.fromAmount,    // 转币数量. 数量是正常精度
                        fromSymbol: o.fromSymbol,    // 转出链币symbol
                        fromContract: eth.getUSDTContract(fromNet),   // 转出链合约地址
                        formNet: fromNet,       // 转出链
                        fromReceiver: o.fromReceiver,  // 转账的收币地址 
                        fromTransAmount: (utils.nolossPow10(o.fromAmount, utils.getUSDTDecimal(fromNet))).toString(),  // 转账金额
    
                        fee: utils.prettyFloat(fee, 4),      // 跨链桥费用比例
    
                        toAmount: toAmountStr,   // 收到的币的数量，正常精度
                        toAddress: toAddress,    // 收币链的地址
                        toSymbol: toSymbol,   // 收币链的symbol
                        toNet: toNet,    // 收币链的net
    
                        expireTime: o.expireTime,    // UTC时间戳，订单有效期

                        minAmount: MIN_BRIDGE_USDT
                    }));
                } else {
                    utils.getServerLog().error('cCreateOrder write db error');
                    return res.json(utils.buildErrorResponse('', ErrCodeWriteDB));
                }
            }
            catch (e) {
                utils.getServerLog().error('cCreateOrder excepted. e = ', e);
                res.json(utils.buildErrorResponse(e.toString(), ErrCodeDefault));
            }
        });
    },
    
    cUserOrder: function(server) {
        server.post('/chainbridge/c/uo', async (req, res) => {
            try {
                utils.writeInterfaceLog(req, req.body);

                const fromAddress = req.body.fromAddress;
                const toAddress = req.body.toAddress;
                const status = req.body.status;
                const pageNo = req.body.pageNo;
                const pageSize = req.body.pageSize;
               
                const resp = {
                    orders: [],
                    total: 0
                };

                return res.json(utils.buildSuccessResponse(resp));
            }
            catch (e) {
                utils.getServerLog().error('cUserOrder excepted. e = ', e);
                res.json(utils.buildErrorResponse(e.toString(), ErrCodeDefault));
            }
        });
    },

    sTxSuccess: function(server) {
        server.post('/s/chainbridge/txSuccess', async (req, res) => {
            try {
                //日志输出
                utils.writeInterfaceLog(req, req.body);

                //校验token
                const auth = !req.headers.Authorization ? req.headers.authorization : req.headers.Authorization;

                if (!auth || CALL_TOKEN !== auth) {
                    utils.getServerLog().error('txSuccess Invalid token. token = ', auth);
                    return res.json(utils.buildErrorResponse('Invalid token', ErrCodeToken)); 
                }

                //获取回调请求参数
                const net = req.body.net;
                const from = req.body.from;
                const to = req.body.to;     // chain bridge contract address
                const contract = req.body.contract;   // USDT contract address
                const amountHEX = req.body.amount;
                const tokenSymbol = req.body.tokenSymbol;
                const hash = req.body.txHash;

                //校验是否是支持的链
                if (!eth.isSupportedNet(net)) {
                    utils.getServerLog().error('txSuccess unsupported net, net = ', net);
                    return res.json(utils.buildErrorResponse(null, ErrCodeNet));
                }
                //校验是否是支持的币种
                if (!eth.isSupportedSymbol(tokenSymbol, net)) {
                    utils.getServerLog().error('txSuccess unsupported symbol, net = ', net, 'symbol = ', tokenSymbol);
                    return res.json(utils.buildErrorResponse(null, ErrCodeSymbol));
                }
                //获取基础配置
                const cfg = BIRDGE_CONFIG[net];  // 不可能失败，因为 前面已经判断了 net 了

                //TRON 和 ETH系列比起来，地址大小写敏感，地址大写是一个地址，小写是另一个地址
                //校验
                const toLower = to.toLowerCase();
                // const isSendUSDT2Bridge = toLower === cfg.contract.toLocaleLowerCase()
                //                           && contract.toLowerCase() === eth.getUSDTContract(net).toLowerCase();
                //0427需求：跨链桥收币由原本的合约地址变成财务资金归集地址，所以这里的判断改变
                const isSendUSDT2Bridge = contract.toLowerCase() === eth.getUSDTContract(net).toLowerCase();

                if (!isSendUSDT2Bridge) {
                    utils.getServerLog().info('txSuccess isSendUSDT2Bridge = false. net = ', net, 'toLower = ', toLower);
                    return res.json(utils.buildSuccessResponse({}));
                }

                //校验金额
                if (!amountHEX || !amountHEX.length) {
                    utils.getServerLog().error('txSuccess amountHEX is null.  net = ', net, 'amountHEX = ', amountHEX);
                    return res.json(utils.buildErrorResponse(null, ErrCodeLessThanMin))
                }

                const amoutBig = BigInt(amountHEX.startsWith('0x') || amountHEX.startsWith('0X') 
                                         ? amountHEX : ('0x' + amountHEX),
                                       16);
                //获取订单列表
                const orderList = await ChainOrder.getOpenRecordByAddress(from, true);

                if (!orderList || !orderList.length) {
                    // utils.getServerLog().info('txSuccess orderList is null. orderList = ', orderList);
                    const uo = new UnknowOrder();
                    uo.from_net = net;
                    uo.from_address = from;
                    uo.from_amount = amountHEX;
                    uo.to_net = net;
                    uo.to_address = to;
                    uo.to_amount = amountHEX;
                    uo.status = UnknowOrder.NORMAL;
                    uo.trade_time = new Date().toISOString().slice(0,19).replace("T"," ");
                    uo.create_time = Date.now();
                    uo.create_str = utils.UTCTimeString(uo.create_time, false);
                    //未知订单
                    UnknowOrder.insert(uo, true);
                    // 这里要记录一个无法匹配的交易，给后台人工处理。现在赶时间，没空做了。做管理后台的时候再来补。
                    // return res.json(utils.buildErrorResponse(null, ErrCodeNoData));
                    return res.json(utils.buildSuccessResponse({'message':'save UnknowOrder success'}));
                } 
                //校验并且匹配订单
                for (const order of orderList) {
                    //获取订单金额
                    const orderAmoutBig = utils.nolossPow10(order.fromAmount, eth.getUSDTDecimal(order.fromNet));
                    // utils.getServerLog().info('================ order = ', order);
                    utils.getServerLog().info('orderAmoutBig = ', orderAmoutBig.toString(),
                                              'amoutBig = ', amoutBig.toString());
                    
                    //amoutBig 是链上的金额， orderAmoutBig 是订单的金额
                    if (orderAmoutBig === amoutBig) {
                        // 订单匹配成功

                        utils.getServerLog().info('match order =', order);
                        order.fromHash = hash;
                        order.status = ChainOrder.StatusReceived;
                        await ChainOrder.updateTx(order);

                        const toAmountBig = order.toNet === 'TRON'? order.toAmount: utils.nolossPow10(order.toAmount, eth.getUSDTDecimal(order.toNet));
                        const toAmountStr = toAmountBig.toString();

                        // 检查合约里的币够不够。 不够就退币
                        const dataObj = {
                            toAddress: order.toAddress,
                            toNet: order.toNet,
                            hash:hash,
                            id:order.id,
                            amount:  toAmountStr
                        };
                        // 发送MQ 消息
                        utils.getServerLog().info('mq dataObj = ', dataObj);
                        //发送消息并且执行下单交易，或者退币操作
                        MQUtil.sendMessage(dataObj)
                        break;
                    }
                }

                utils.getServerLog().info('txSuccess return successfully ');
                return res.json(utils.buildSuccessResponse({'message': 'ok'}));
            }
            catch (e) {
                utils.getServerLog().error('sTxSuccess excepted. e = ', e);
                res.json(utils.buildErrorResponse(e.toString(), ErrCodeDefault));
            }
        });
    },



    bTxChainRefund: function(server) {
        server.post('/s/chainbridge/txChainRefund', async (req, res) => {
            try {
                utils.writeInterfaceLog(req, req.body);

                const orderId = req.body.id;

                const order = await ChainOrder.getById(orderId);
                if(null == order || undefined == order){
                    utils.getServerLog().error('ChainOrder is not exist');
                    return res.json(utils.buildErrorResponse('order is not exist', utils.ErrCodeDefault));
                }

                if(order.status !== ChainOrder.StatusSent){
                    utils.getServerLog().error('ChainOrder has refuned');
                    return res.json(utils.buildErrorResponse('order has refuned', utils.ErrCodeDefault));
                }
                
                // let hashObj = await eth.transferFrom(cfg.owner,order.from_address,order.from_address,cfg.pk,order.from_amount,order.from_net);
                let hashObj = await eth.refundTransferFrom(order.fromAddress,order.fromAmount,order.fromNet);
                if(!hashObj || null == hashObj.hash){
                    utils.getServerLog().error('txChainRefund excepted. ',hashObj.error);

                    const chainOrder = new ChainOrder();
                    chainOrder.id = order.id;
                    chainOrder.status = ChainOrder.StatusRefundFail;
                    chainOrder.fail_reason = hashObj.error;
                    chainOrder.refund_time =  new Date().toISOString().slice(0,19).replace("T"," ");
                    ChainOrder.updateStatus(chainOrder);
                    return res.json(utils.buildErrorResponse('txHash is null ,transaction failed', utils.ErrCodeDefault));
                }

                utils.getServerLog().info('ChainOrder txRefund success ,transactionHash:',hashObj.hash);

                const chainOrder = new ChainOrder();
                chainOrder.id = order.id;
                chainOrder.status = ChainOrder.StatusRefund;
                chainOrder.refund_hash = hashObj.hash;
                chainOrder.refund_time =  new Date().toISOString().slice(0,19).replace("T"," ");
                await ChainOrder.updateStatus(chainOrder);
                return res.json(utils.buildSuccessResponse({'message': 'ok'}));
            }
            catch (e) {
                utils.getServerLog().error('ChainOrder txRefund excepted. e = ', e);
                res.json(utils.buildErrorResponse(e.toString(), utils.ErrCodeDefault));
            }
        });
    },

    bTxUnknowRefund: function(server) {
        server.post('/s/chainbridge/txUnknowRefund', async (req, res) => {
            try {
                utils.writeInterfaceLog(req, req.body);

                const orderId = req.body.id;

                const order = await UnknowOrder.getById(orderId);
                utils.getServerLog().info('order:',order);
                if(null == order || undefined == order){
                    utils.getServerLog().error('order is not exist');
                    return res.json(utils.buildErrorResponse('order is not exist', utils.ErrCodeDefault));
                }

                if(order.status !== UnknowOrder.NORMAL){
                    return res.json(utils.buildErrorResponse('order has refuned', utils.ErrCodeDefault));
                }
                // let hashObj = await eth.transferFrom(cfg.owner,order.from_address,order.from_address,cfg.pk,order.from_amount,order.from_net);
                let hashObj = await eth.refundTransferFrom(order.from_address,order.from_amount,order.from_net);
                if(!hashObj || null == hashObj.hash){
                    utils.getServerLog().error('txRefund excepted. ',hashObj.error);

                    const newOrder = new UnknowOrder();
                    newOrder.id = order.id;
                    newOrder.status = UnknowOrder.REFUND_FAILED;
                    newOrder.fail_reason = hashObj.error;
                    UnknowOrder.update(newOrder);
                    return res.json(utils.buildErrorResponse('txHash is null ,transaction failed', utils.ErrCodeDefault));
                }

                utils.getServerLog().info('txRefund success ');

                const newOrder = new UnknowOrder();
                newOrder.id = order.id;
                newOrder.status = UnknowOrder.REFUNDED;
                await UnknowOrder.update(newOrder);
                return res.json(utils.buildSuccessResponse({'message': 'ok'}));
            }
            catch (e) {
                utils.getServerLog().error('txRefund excepted. e = ', e);
                res.json(utils.buildErrorResponse(e.toString(), utils.ErrCodeDefault));
            }
        });
    },

    cCreateAddress: function(server) {
        server.post('/chainbridge/c/create/addr', async (req, res) => {
            try {
                let myMnemonic = "later basket teach burger announce merit auto north eight expect nurse spawn";
                let mnemonic =myMnemonic.toString();
                let net = "ETH";
                const path =req.body.parameter;
                const formattedNumber = path.toString().replace(/(\d{2})(\d{2})(\d{2})/, '$1/$2/$3');
                // let mnemonic = myMnemonic.toString();

                if (typeof myMnemonic === 'string') {
                    try {
                        mnemonic = JSON.parse(myMnemonic).toString().replace(/,/g, ' ');
                    }
                    catch (e) {
                        // Nothing to do.
                    }
                } else {
                    mnemonic = mnemonic.replace(/,/g, ' ');
                }

                let wallet = hdAddress.HD(mnemonic, hdAddress.keyType.mnemonic);
                if (this.isETHFamily(net)) {
                    let kp = wallet.ETH.getAddressByPath(formattedNumber)
                    this._privateKey = kp.pri;
                    this._publicKey = kp.pub;
                    this._address = kp.address;
                    let detail = {
                        "address":kp.address,
                        "path":formattedNumber
                    }

                    return res.json(utils.buildSuccessResponse(detail));
                }
                else if ('TRX' === net) {
                    let kp = wallet.TRX.getCoinAddressKeyPair(0, 0, 0);
                    let priBuffer = Buffer.from(kp.pri.replace('0x', ''), 'hex');
                    let keyPair = new bitcoin.ECPair.fromPrivateKey(priBuffer);
                    this._privateKey = kp.pri;
                    this._publicKey = kp.pub;
                    this._address = kp.address;
                    this._WIFPrivateKey = keyPair.toWIF();

                    return;
                }
                else if ('BTC' === net) {
                    // ---- legacy bip44 ---- these addresses are used by Bit Keep
                    const bip44 = this.bitcoinAddressFromMnemonic(mnemonic, "m/44'/0'/0'/0/0");

                    this._address = bip44.legacyAddress;
                    this._privateKey = bip44.privateKeyHex;
                    this._publicKey = bip44.publicKey;
                    this._WIFPrivateKey = bip44.privateKey;

                    this.btc1 = {
                        'bc1': {
                            privateKey: this._WIFPrivateKey,
                            address: bip44.nativeAddress
                        },
                        '3': {
                            privateKey: this._WIFPrivateKey,
                            address: bip44.segWitAddress
                        }
                    }
                    console.log(this.btc1);
                    console.log(this._publicKey);
                    // ---- bip 84 ---- these addresses are used by Trust wallet and Bitpie
                    const bip84 = this.bitcoinAddressFromMnemonic(mnemonic, "m/84'/0'/0'/0/0");
                    const bip49 = this.bitcoinAddressFromMnemonic(mnemonic, "m/49'/0'/0'/0/0");

                    this.btc2 = {
                        'bc1': {
                            privateKey: bip84.privateKey,
                            address: bip84.nativeAddress
                        },
                        '3': {
                            privateKey: bip49.privateKey,
                            address: bip49.segWitAddress
                        }
                    }
                    console.log(this.btc2)
                    return;
                }
                else if ('APT' === net) {
                    const account = aptos.accountFromMnemonics(mnemonic);

                    this._privateKey = account.privateKey;
                    this._publicKey = account.publicKey;
                    this._address = account.address;
                    this._WIFPrivateKey = account.privateKey;

                    return;
                }
                else if ('SOL' === net) {
                    // const account = sol.accountFromMnemonics(mnemonic);

                    // this._privateKey = account.privateKey;
                    // this._publicKey = account.publicKey;
                    // this._address = account.address;
                    // this._WIFPrivateKey = account.privateKey;

                    return;
                }
                else {
                    throw `Unsupported chain:${net}`;
                }

            }catch (e) {
                utils.getServerLog().error('cCreateOrder excepted. e = ', e);
                res.json(utils.buildErrorResponse(e.toString(), ErrCodeDefault));
            }
        });
    },

    isETHFamily: function (net) {
        if (!net) {
            return false;
        }

        net = net.toUpperCase();

        return 'ETH' === net || 'BSC' === net || 'MATIC' === net || 'HECO' === net || 'AVAX' === net
            || 'OP' === net || 'FTM' === net || 'ARB' === net || 'CELO' === net || 'WOW' === net || 'BASE' === net || 'FLARE' === net || 'GNOSIS' === net || 'LINEA' === net || 'ROLLUX' === net || 'SCROLL' === net || 'SYSCOIN' === net || 'POLYGONZK' === net;
    },
    
    //跟单提款功能
    cTransferAmount: function(server) {
        server.post('/chainbridge/c/transfer', async (req, res) => {
            try {
            const toAddress = req.body.address;
            const toNet = req.body.net;
            const toAmount = req.body.amount;
            let hashObj = await eth.transferFromAddressAmount(toAddress,toAmount,toNet);

            if(!hashObj || null == hashObj.hash) {
                utils.getServerLog().error('txRefund excepted. ', hashObj.error);
                return res.json(utils.buildErrorResponse('txHash is null ,transaction failed', utils.ErrCodeDefault));
            }else{
                const detail ={
                    "hash":hashObj.hash
                }
                return res.json(utils.buildSuccessResponse(detail));
            }

            }catch (e) {
                utils.getServerLog().error('cCreateOrder excepted. e = ', e);
                res.json(utils.buildErrorResponse(e.toString(), ErrCodeDefault));
            }
        });
    },

    /* 调用合约 */
    sWriteContract: function(server) {
        // wrc means: write referral contract
        server.post('/s/chainbridge/wrc', async (req, res) => {
            try {
                utils.writeInterfaceLog(req, req.body);

                const method = req.body.method;
                const args = req.body.args;

                try {
                    const r = await Referral.write(method, !args ? [] : args);

                    if (!r) {
                        utils.getServerLog().error('Referral.write return null');
                        return res.json(utils.buildErrorResponse('', ErrCodeContract));
                    } else {
                        utils.getServerLog().info('Success');
                        return res.json(utils.buildSuccessResponse({'txHash': r}));
                    }
                } catch (e) {
                    utils.getServerLog().error('Referral.write exception. e = ', e);
                    return res.json(utils.buildErrorResponse('', ErrCodeContract));  
                }
            }
            catch (e) {
                utils.getServerLog().error('write referral contract excepted. e = ', e);
                res.json(utils.buildErrorResponse(e.toString(), utils.ErrCodeDefault));
            }
        });
    },

    sReadContract: function(server) {
        // wrc means: write referral contract
        server.post('/s/chainbridge/rrc', async (req, res) => {
            try {
                utils.writeInterfaceLog(req, req.body);

                const method = req.body.method;
                const args = req.body.args;

                const r = await Referral.read(method, !args ? [] : args);

                if (!r) {
                    utils.getServerLog().error('Referral.read return null');
                    return res.json(utils.buildErrorResponse('', ErrCodeContract));
                } else {
                    utils.getServerLog().info('Success');
                    return res.json(utils.buildSuccessResponse({'data': r}));
                }
                
            }
            catch (e) {
                utils.getServerLog().error('read referral contract excepted. e = ', e);
                res.json(utils.buildErrorResponse(e.toString(), utils.ErrCodeDefault));
            }
        });
    },

     //裂变提款功能
     cReferralTransfer: function(server) {
        server.post('/chainbridge/c/referral', async (req, res) => {
            try {
            const toAddress = req.body.address;
            const toNet = req.body.net;
            const toAmount = req.body.amount;
            let hashObj = await eth.referralTransferAmount(toAddress,toAmount,toNet);

            if(!hashObj || null == hashObj.hash) {
                utils.getServerLog().error('txRefund excepted. ', hashObj.error);
                return res.json(utils.buildErrorResponse('txHash is null ,transaction failed', utils.ErrCodeDefault));
            }else{
                const detail ={
                    "hash":hashObj.hash
                }
                return res.json(utils.buildSuccessResponse(detail));
            }

            }catch (e) {
                utils.getServerLog().error('cCreateOrder excepted. e = ', e);
                res.json(utils.buildErrorResponse(e.toString(), ErrCodeDefault));
            }
        });
    },

    //TRC合约兑换转账
    cTRCExchangeTransfer: function(server) {
        server.post('/chainbridge/c/exchange', async (req, res) => {
            try {
                const toAddress = req.body.address;
                const toAmount = req.body.amount;
                const txHash = req.body.txHash;
                let hashObj = await TrcContract.transfer(toAddress,toAmount,txHash);

                if(!hashObj || null == hashObj) {
                    utils.getServerLog().error('txRefund excepted. ', hashObj.error);
                    return res.json(utils.buildErrorResponse('txHash is null ,transaction failed', utils.ErrCodeDefault));
                }else{
                    const detail ={
                        "hash":hashObj
                    }
                    return res.json(utils.buildSuccessResponse(detail));
                }

            }catch (e) {
                utils.getServerLog().error('cCreateOrder excepted. e = ', e);
                res.json(utils.buildErrorResponse(e.toString(), ErrCodeDefault));
            }
        });
    },

    //TRC交易记录获取
    cTRC20Tranctions: function(server) {
        server.post('/chainbridge/c/tranctions', async (req, res) => {
            try {
                const address = req.body.address;

                let result = await TrcContract.getTRC20Transaction(address);

                return res.json(utils.buildSuccessResponse(result));
            }catch (e) {
                utils.getServerLog().error('cCreateOrder excepted. e = ', e);
                res.json(utils.buildErrorResponse(e.toString(), ErrCodeDefault));
            }
        });
    },

    //TRC合约兑换转账
    sTronRefundTransfer: function(server) {
        server.post('/s/chainbridge/refund', async (req, res) => {
            try {
                const address = req.body.address;
                const amount = req.body.amount;
                let hashObj = await TrcContract.tronRefund(address,amount);

                if(!hashObj || null == hashObj) {
                    utils.getServerLog().error('txRefund excepted. ', hashObj.error);
                    return res.json(utils.buildErrorResponse('txHash is null ,transaction failed', utils.ErrCodeDefault));
                }else{
                    const detail ={
                        "hash":hashObj
                    }
                    return res.json(utils.buildSuccessResponse(detail));
                }

            }catch (e) {
                utils.getServerLog().error('cCreateOrder excepted. e = ', e);
                res.json(utils.buildErrorResponse(e.toString(), ErrCodeDefault));
            }
        });
    },

    //裂变提款功能
    cSendBridgeTokenr: function(server) {
        server.post('/chainbridge/c/bridgeToker', async (req, res) => {
            try {
                const address = req.body.address;
                const hash = req.body.hash;
                const amount = req.body.amount;
                const net = req.body.net;

                const resultHash = await eth.sendBridgeToken(
                    address,
                    hash,
                    amount,
                    net
                );

            }catch (e) {
                utils.getServerLog().error('cCreateOrder excepted. e = ', e);
                res.json(utils.buildErrorResponse(e.toString(), ErrCodeDefault));
            }
        });
    },

    //获取WOW链USDT余额
    cGetUSDTBalance: function(server) {
        server.post('/chainbridge/c/getUsdtBalance', async (req, res) => {
            try {
                const address = req.body.address;
                const balance = await eth.getBalance(address);
                return res.json(utils.buildSuccessResponse(balance));
            }catch (e) {
                utils.getServerLog().error('cCreateOrder excepted. e = ', e);
                res.json(utils.buildErrorResponse(e.toString(), ErrCodeDefault));
            }
        });
    },

    /*调用DEX公测活动合约写入方法 */
    sWriteBetaContract: function(server) {
        // wrc means: write referral contract
        server.post('/s/chainbridge/beta/write', async (req, res) => {
            try {
                utils.writeInterfaceLog(req, req.body);

                const method = req.body.method;
                const args = req.body.args;

                try {
                    const r = await Beta.BetaWrite(method, !args ? [] : args);

                    if (!r) {
                        utils.getServerLog().error('Beta.write return null');
                        return res.json(utils.buildErrorResponse('', ErrCodeContract));
                    } else {
                        utils.getServerLog().info('Success');
                        return res.json(utils.buildSuccessResponse({'txHash': r}));
                    }
                } catch (e) {
                    utils.getServerLog().error('Beta.write exception. e = ', e);
                    return res.json(utils.buildErrorResponse('', ErrCodeContract));
                }
            }
            catch (e) {
                utils.getServerLog().error('write beta contract excepted. e = ', e);
                res.json(utils.buildErrorResponse(e.toString(), utils.ErrCodeDefault));
            }
        });
    },

    //TRC合约兑换转账
    cWOWTransfer: function(server) {
        server.post('/chainbridge/c/wow/transfer', async (req, res) => {
            try {
                const toAddress = req.body.address;
                const toAmount = req.body.amount;
                let hashObj = await WOWTransfer.transaction(toAddress,toAmount);

                if(!hashObj || null == hashObj) {
                    utils.getServerLog().error('txRefund excepted. ', hashObj.error);
                    return res.json(utils.buildErrorResponse('txHash is null ,transaction failed', utils.ErrCodeDefault));
                }else{
                    const detail ={
                        "hash":hashObj
                    }
                    return res.json(utils.buildSuccessResponse(detail));
                }

            }catch (e) {
                utils.getServerLog().error('cCreateOrder excepted. e = ', e);
                res.json(utils.buildErrorResponse(e.toString(), ErrCodeDefault));
            }
        });
    },



    register: function (server) {
        this.tempTemp(server);

        // c端接口
        this.cCreateOrder(server);
        this.cUserOrder(server);
        this.cCreateAddress(server);
        this.cTransferAmount(server);
        this.cReferralTransfer(server);
        this.cTRCExchangeTransfer(server);
        this.cTRC20Tranctions(server);
        this.cSendBridgeTokenr(server);
        this.cGetUSDTBalance(server);
        this.cWOWTransfer(server);



        
        // b端接口
        this.bTxUnknowRefund(server);
        this.bTxChainRefund(server);

        // s端接口
        this.sTxSuccess(server);
        this.sTronRefundTransfer(server);


        // 裂变合约接口.  
        this.sWriteContract(server);
        this.sReadContract(server);


        //DEX公测活动合约接口
        this.sWriteBetaContract(server);
    }
}