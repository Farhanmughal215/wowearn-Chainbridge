import eth from "../eth/index.js";

import BigNumber from "bignumber.js";

import { FISSION_OWNER, FISSION_OWNER_PK } from "../env.js";

function Wei2ETH(w) {
    return w / 1000000000 / 1000000000;
}

function GWei2ETH(g) {
    return g / 1000000000;
}

function GWei2ETHtoStr(g) {
    return BigNumber(g).dividedBy(1e9).toFormat()
}


export default {
    /**
     *
     * @param privateKey
     * @param fromAddress
     * @param toAddress
     * @param amount  The value will be transferred.
     * @param fee.  Came from getGasPrice, GWei.
     * @param gasLimit. Max gas fee, GWei, normally it equals 21000.
     * @param net
     * @returns
     */
    async transaction(toAddress, amount) {
        try {
            let privateKey = FISSION_OWNER_PK;
            let fromAddress = FISSION_OWNER;
            let net = "WOW";

            let estimatedValue = await this.estimateFee(null, net);
            let gasPrice = parseFloat(estimatedValue.data.suggestBasePrice);
            let gasLimit = parseInt(estimatedValue.data.gasLimit);

            // console.log(JSON.stringify({ privateKey, fromAddress, toAddress,
            // 	amount, gasPrice, gasLimit, net, chainRemark, type }));
            let  web3 = eth.httpsWeb3('WOW');

            console.log('获取balanceWei开始' + new Date());
            const balanceWei = await web3.eth.getBalance(fromAddress);
            console.log('获取balanceWei结束' + new Date());
            console.log('获取gasPriceWei开始' + new Date());
            const [gasPriceWei, currentPriceGWei] = await this.getAppropriateGasPriceWei(web3, gasPrice);
            console.log('获取gasPriceWei结束' + new Date());
            if (-1 == gasPriceWei) {
                const msg = 'The gas price: ' + (gasPriceWei / 1000000000) + ' is less than the current gas price: '
                    + currentPriceGWei;

                return global.requestError(msg, errCodeInvalidGasPrice,
                    {
                        'balance': Wei2ETH(balanceWei).toFixed(18),
                        'gasFee': GWei2ETH(gasPrice).toFixed(18),
                        'tokenBalance': '0'
                    });
            }

            const amountWei = amount * 1000000000000000000;
            console.log(balanceWei);
            console.log(amountWei);
            console.log(gasPriceWei);
            console.log(gasLimit);
            console.log(gasPriceWei * gasLimit);
            if (balanceWei < (amountWei + gasPriceWei * gasLimit)) {
                console.log('余额校验不足')
                return global.requestError('Insufficient balance', errCodeNotEnough,
                    {
                        'balance': Wei2ETH(balanceWei).toFixed(18),
                        'gasFee': GWei2ETH(gasPriceWei).toFixed(18),
                        'tokenBalance': '0'
                    });
            }
            console.log('余额校验通过')
            let num = BigNumber(amount).times(BigNumber(1000000000000000000)).toString(10)
            console.log('获取nonce开始' + new Date());
            const nonce = await web3.eth.getTransactionCount(fromAddress, 'latest');
            console.log('获取nonce结束' + new Date());
            if (!gasLimit && 'ARB' === net) {
                gasLimit = 10000000;
            }
            if ('ARB' === net) {
                gasLimit = 2000000;
            }
            const transaction = {
                'from': fromAddress,
                'to': toAddress,
                'value': num,
                'gasLimit': gasLimit,
                'gasPrice': gasPriceWei,
                'nonce': nonce,
                'data': "",
            };
            let res = await this.dealTransaction(web3, transaction, privateKey);
            let txHash = res.data
            if (!txHash || 0 == txHash.length) {
                return global.requestError('trading fail', '-102',
                    {
                        'balance': Wei2ETH(balanceWei).toFixed(18),
                        'gasFee': GWei2ETH(gasPriceWei).toFixed(18),
                        'tokenBalance': '0'
                    });
            }
            else {
                let r = {
                    txHash: txHash,
                    balance: Wei2ETH(balanceWei).toFixed(18),
                    gasFee: GWei2ETH(gasPriceWei).toFixed(18),
                    tokenBalance: '0',
                    symbol: 'WOW',
                    rawTx: '',
                    decimal: 18
                }

                return { success: 1, data: r };
            }
        } catch (e) {
            return { success: 0, errorMsg: e.toString() };
        }
    },

    async getAppropriateGasPriceWei(web3, gasPriceGWei) {
        const currentGasPrice = await web3.eth.getGasPrice();
        let gasPriceWei = Math.ceil(gasPriceGWei * 1000000000);
        if (gasPriceWei < currentGasPrice) {
            return [currentGasPrice, currentGasPrice / 1000000000];
        }

        return [gasPriceWei, currentGasPrice / 1000000000];
    },

    async dealTransaction(web3, tx, privateKey, net, type) {
        try {
            if (!web3) {
                web3 = eth.httpsWeb3('WOW');
            }
            if (!privateKey.startsWith('0x')) {
                privateKey = '0x' + privateKey
            }
            console.log('获取signedTx开始' + new Date());
            const signedTx = await web3.eth.accounts.signTransaction(tx, privateKey)
            console.log('获取signedTx结束' + new Date());
            if (type) return { success: 1, data: signedTx };

            console.log('rawTransaction开始' + new Date());
            let res
            await web3.eth.sendSignedTransaction(signedTx.rawTransaction, function (err, data) {
                console.log('rawTransaction结束' + new Date());
                if (err) {
                    res = { success: 0, errorMsg: err.toString() };
                }
                if (data) {
                    res = { success: 1, data };
                }
            })
            return res

        } catch (error) {
            console.log(error)
            return { success: 0, errorMsg: error.toString() };
        }
    },

    /**
     * This function could estimate all contracts and transactions fee.
     * @param language Speed comments language.
     * @param contractAddr The smart contract address.
     * @param net Net type.
     * @returns
     */
    async estimateFee(contractAddr = null, net) {
        try {
            /**
             * First of all we estimate the gas price.
             */
            let  web3 = eth.httpsWeb3('WOW');

            if (!web3) {
                return global.requestError('Unsupported chain', errCodeUnsupportedNet);
            }

                let gasPrice = await web3.eth.getGasPrice();

                // let feeHistory = await web3.eth.getFeeHistory(1, 'latest');
                let suggestionGWei = parseFloat(gasPrice.toString()) / 1000000000;
                if ('WOW' === net) {
                    suggestionGWei = suggestionGWei * 1.2;
                }
                // Coefficients are temporary.
                const safeGWei = suggestionGWei * 0.8;
                const fastGWei = suggestionGWei * 1.3;
                /**
                 * And then we estimate the gas limit.
                 */
                let gasLimit = 21000;  // For non-smart contract transfer gas limit.
                if ('ARB' === net) {
                    gasLimit = 10000000;
                } else if ('BSC' === net) {
                    if (contractAddr == '0xc748673057861a797275CD8A068AbB95A902e8de') {
                        gasLimit = 300000;
                    } else {
                        gasLimit = 100000;
                    }

                } else if ('MATIC' === net) {
                    gasLimit = 80000;
                }
                else {
                    if (!!contractAddr) {
                        // gasLimit = 500000;
                        const cfg = ContractConfig.findContract(contractAddr, net);
                        const detail = ContractConfig.findContractDetail(contractAddr, net);
                        console.log(detail);
                        gasLimit = !cfg ? 300000 : detail[1].name == 'USDC' ? 100000 : 65000;
                        // gasLimit = !cfg ? -1 : 100000;
                        let ifbusd = false;

                        for (let i = 0; !!cfg && !!cfg.contracts && i < cfg.contracts.length; i++) {
                            if (cfg.contracts[i].address.toLowerCase() == contractAddr.toLowerCase()
                                && cfg.contracts[i].name == 'BUSD') {
                                ifbusd = true;
                            }
                        }

                        if (ifbusd && net != 'MATIC') {
                            gasLimit = 100000;
                        }
                        if (net == 'CELO') {
                            gasLimit = 500000;
                        }
                        if (!!detail && detail.length > 1 && detail[1].name == 'WETH') {
                            gasLimit = 250000
                        }
                        if (!!detail && detail.length > 1 && detail[1].name == 'USDP') {
                            gasLimit = 100000
                        }
                        if (!!detail && detail.length > 1 && detail[1].name == 'PAXG') {
                            gasLimit = 100000
                        }
                        if (!!detail && detail.length > 1 && detail[1].name == 'FXS') {
                            gasLimit = 200000
                        }
                        if (!!detail && detail.length > 1 && detail[1].name == 'OCEAN') {
                            gasLimit = 800000
                        }
                        if (!!detail && detail.length > 1 && detail[1].name == 'DYDX') {
                            gasLimit = 300000
                        }
                        if (!!detail && detail.length > 1 && detail[1].name == 'LDO') {
                            gasLimit = 200000
                        }

                    }
                }
                gasLimit = gasLimit.toFixed(0);

                let estimateResult = {
                    'SafeGasPrice': safeGWei.toFixed(4),
                    'suggestBasePrice': suggestionGWei.toFixed(4),
                    'FastGasPrice': fastGWei.toFixed(4),
                    'FastGasFee': GWei2ETHtoStr(fastGWei * gasLimit),
                    'suggestGasFee': GWei2ETHtoStr(suggestionGWei * gasLimit),
                    'SafeGasFee': GWei2ETHtoStr(safeGWei * gasLimit),
                    'gasLimit': gasLimit
                };

                estimateResult['FastText'] = '30 seconds';
                estimateResult['suggestText'] = '60 seconds';
                estimateResult['SafeText'] = '90 seconds';
                return { success: 1, data: estimateResult };


        }
        catch (e) {
            return { success: 0, errorMsg: e.toString() };
        }
    }

}
