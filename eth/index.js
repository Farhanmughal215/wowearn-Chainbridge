
import Web3 from "web3";
import utils from "../utils.js";
import {WOW_USDT, BIRDGE_CONFIG, REFUND_BIRDGE_CONFIG, DRAW_MONEY_CONFIG,REFERRAL_MONEY_CONFIG} from "../env.js";
import BigNumber from "bignumber.js";

const ERC20_ABI = [
    {
        "constant": true,
        "inputs": [

        ],
        "name": "name",
        "outputs": [
            {
                "name": "",
                "type": "string"
            }
        ],
        "payable": false,
        "stateMutability": "view",
        "type": "function"
    },
    {
        "constant": false,
        "inputs": [
            {
                "name": "_spender",
                "type": "address"
            },
            {
                "name": "_value",
                "type": "uint256"
            }
        ],
        "name": "approve",
        "outputs": [
            {
                "name": "",
                "type": "bool"
            }
        ],
        "payable": false,
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "constant": true,
        "inputs": [

        ],
        "name": "totalSupply",
        "outputs": [
            {
                "name": "",
                "type": "uint256"
            }
        ],
        "payable": false,
        "stateMutability": "view",
        "type": "function"
    },
    {
        "constant": false,
        "inputs": [
            {
                "name": "_from",
                "type": "address"
            },
            {
                "name": "_to",
                "type": "address"
            },
            {
                "name": "_value",
                "type": "uint256"
            }
        ],
        "name": "transferFrom",
        "outputs": [
            {
                "name": "",
                "type": "bool"
            }
        ],
        "payable": false,
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "constant": true,
        "inputs": [

        ],
        "name": "decimals",
        "outputs": [
            {
                "name": "",
                "type": "uint8"
            }
        ],
        "payable": false,
        "stateMutability": "view",
        "type": "function"
    },
    {
        "constant": true,
        "inputs": [
            {
                "name": "_owner",
                "type": "address"
            }
        ],
        "name": "balanceOf",
        "outputs": [
            {
                "name": "",
                "type": "uint256"
            }
        ],
        "payable": false,
        "stateMutability": "view",
        "type": "function"
    },
    {
        "constant": true,
        "inputs": [

        ],
        "name": "symbol",
        "outputs": [
            {
                "name": "",
                "type": "string"
            }
        ],
        "payable": false,
        "stateMutability": "view",
        "type": "function"
    },
    {
        "constant": false,
        "inputs": [
            {
                "name": "_to",
                "type": "address"
            },
            {
                "name": "_value",
                "type": "uint256"
            }
        ],
        "name": "transfer",
        "outputs": [
            {
                "name": "",
                "type": "bool"
            }
        ],
        "payable": false,
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "constant": true,
        "inputs": [
            {
                "name": "_owner",
                "type": "address"
            },
            {
                "name": "_spender",
                "type": "address"
            }
        ],
        "name": "allowance",
        "outputs": [
            {
                "name": "",
                "type": "uint256"
            }
        ],
        "payable": false,
        "stateMutability": "view",
        "type": "function"
    }
];

const BRIDGE_ABI = [
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "addr",
				"type": "address"
			},
			{
				"internalType": "uint256",
				"name": "amount",
				"type": "uint256"
			},
			{
				"internalType": "string",
				"name": "txHash",
				"type": "string"
			}
		],
		"name": "transferoutToken",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	}
];

export default {
    httpsWeb3(net) {
        let url = '';
        
        switch (net) {
            case 'ETH': {
                url = 'https://rpc.ankr.com/eth/d013a6907500b5fd01e3fef7b4af816f3bac6ef5ad61aade96370e91b8a58ec8';
                break;
            }
            case 'BSC': {
                url = 'https://rpc.ankr.com/bsc/d013a6907500b5fd01e3fef7b4af816f3bac6ef5ad61aade96370e91b8a58ec8';
                break;
            }
            case 'ARB': {
                url = 'https://rpc.ankr.com/arbitrum/d013a6907500b5fd01e3fef7b4af816f3bac6ef5ad61aade96370e91b8a58ec8'
                break;
            }
            case 'WOW': {
                url = ' https://rpc.wowearn.io';
                break;
            }
            default: {
                return null;
            }
        }
        
        return new Web3(new Web3.providers.HttpProvider(url));
    },

    isSupportedSymbol(symbol, net) {
        if ('WOW' === net) {
            return symbol.toUpperCase() === 'WUSDT';
        } else {
            return  symbol.toUpperCase() === 'USDT';
        }
    },

    isSupportedNet(net) {
        return 'WOW' === net || 'ETH' === net ||  'TRON' === net  ||  'ARB' === net || 'BSC' === net;
    },

    isValidAddress(address) {
        return Web3.utils.isAddress(address, 1);
    },

    getUSDTContract(net) {
        switch (net) {
            case 'ETH': {
                return '0xdac17f958d2ee523a2206206994597c13d831ec7';
            } case 'BSC': {
                return '0x55d398326f99059fF775485246999027B3197955';
            } case 'ARB': {
                return '0xfd086bc7cd5c481dcc9c85ebe478a1c0b69fcbb9';
            } case 'TRON': {
                return 'TDNUnX36xM3jC7ENfAacRHht5m5YXxQFGD';
            } case 'WOW':{
                return WOW_USDT;
            } default : {
                return null;
            }
        }
    },

    getUSDTDecimal(net) {
        switch (net) {
            case 'BSC': {
                return 18;
            }
            default : {
                return 6;
            }
        }
    },

    async getUSDTAllowance(owner, sender, net) {
        if (!owner || !owner.length || !sender || !sender.length) {
            return 0;
        }
        
        try {
            const contract =  this.getUSDTContract(net);
            const web3 = this.httpsWeb3(net);
            const token = new web3.eth.Contract(ERC20_ABI, contract, { from: owner });
            const allowanceStr = await token.methods.allowance(owner, sender).call();
            const allowance = parseInt(allowanceStr);
        
            return !allowance ? 0 : allowance;
        } catch (e) {
            utils.getServerLog().error('getUSDTAllowance excepted. owner = ', owner, 
                                       'sender = ', sender, 'net = ', net, 'e = ', e);
            return 0;
        }
    },

    async getUSDTBalance(owner, net) {
        if (!owner || !owner.length) {
            return 0;
        }
        
        try {
            const contract = this.getUSDTContract(net);
            const web3 = this.httpsWeb3(net);
            const token = new web3.eth.Contract(ERC20_ABI, contract, { from: owner });
            const balanceStr = await token.methods.balanceOf(owner).call();
            const balance = parseInt(balanceStr);
        
            return !balance ? 0 : balance;
        } catch (e) {
            utils.getServerLog().error('getUSDTBalance excepted. e = ', e);
            return 0;
        }
    },

    async getBalance(address) {
        const  net = 'WOW';
        const  owner =BIRDGE_CONFIG.WOW.owner;
        if (!owner || !owner.length) {
            return 0;
        }

        try {
            const contract = this.getUSDTContract(net);
            const web3 = this.httpsWeb3(net);
            const token = new web3.eth.Contract(ERC20_ABI, contract, { from: owner });
            const balanceStr = await token.methods.balanceOf(address).call();
            let balance = parseInt(balanceStr);
            balance = BigNumber(balance).div(Math.pow(10, 6)).toString(10);

            // balance = Math.floor(utils.decimalUSDT(balance,net));
            return !balance ? 0 : balance;
        } catch (e) {
            utils.getServerLog().error('getBalance excepted. e = ', e);
            return 0;
        }
    },

    //from 转出地址
    //to 转入地址
    //authorizedAddress 授权地址
    async transferFrom(from, to, authorizedAddress, authorizedPK, amount, net) {
        const contract = this.getUSDTContract(net);

        utils.getServerLog().info('transferFrom, args = ', from, to, authorizedAddress, amount, net);

        try {
			const web3 = this.httpsWeb3(net);
			const gasPriceStr = await web3.eth.getGasPrice();
            const gasPrice = parseInt(gasPriceStr) * 1.1;  // // gas price 提高20%. 以求能第一时间上链，抢跑
            // const gasPrice = parseInt(gasPriceStr);

            // utils.getServerLog().info('transferFrom get gas. gasPriceStr = ', gasPriceStr, 'gasPrice = ', gasPrice);

            if (!gasPrice) {
                return {"hash":null,"error":"GasPrice is null"};
            }

			const token = new web3.eth.Contract(ERC20_ABI, contract, { from: authorizedAddress });
			const nonce = await web3.eth.getTransactionCount(from, 'latest');
            const gasLimit = 70000;
            utils.getServerLog().info('nonce:', nonce);
			let tx = {
				'from': authorizedAddress,
				'gasPrice': gasPrice,
				'gasLimit': gasLimit,
				'to': contract,
				'value': 0x0,
				'data': token.methods.transferFrom(from, to, amount.toString()).encodeABI(),
				'nonce': nonce
			};
			
            if (!authorizedPK.startsWith('0x')) {
				authorizedPK = '0x' + authorizedPK;
			}

            utils.getServerLog().info('transferFrom tx = ', tx);

			const signedTx = await web3.eth.accounts.signTransaction(tx, authorizedPK);
			const receipt = await web3.eth.sendSignedTransaction(signedTx.rawTransaction);

            utils.getServerLog().info('transferFrom receipt = ', receipt);

			if (!receipt || !receipt.status) {
                utils.getServerLog().error('transferFrom no receipt', receipt, '\ntx = ', tx, '\nsignedTx = ', signedTx);
                return {"hash":null,"error":"GasPrice is null"};
            } else {
                return {"hash":receipt.transactionHash,"error":null};
            }
		} catch (e) {
            utils.getServerLog().error('transferFrom excepted. from = ', from, '\ne = ', e);
			return {"hash":receipt.transactionHash,"error":e.toString()};
		}
    },

    //处理退款转账操作
    async refundTransferFrom(to, amount, net) {
        const rcfg = REFUND_BIRDGE_CONFIG[net];
        const authorizedAddress = rcfg.address;
        let authorizedPK = rcfg.pk;
        const contract = this.getUSDTContract(net);
        const decimalAmount = utils.decimalUSDT(amount,net);


        utils.getServerLog().info('transferFrom, args = ',to, authorizedAddress, amount,decimalAmount, net);

        try {
			const web3 = this.httpsWeb3(net);
			const gasPriceStr = await web3.eth.getGasPrice();
            const gasPrice = parseInt(gasPriceStr) * 1.1;  // // gas price 提高20%. 以求能第一时间上链，抢跑
            // const gasPrice = parseInt(gasPriceStr);

            // utils.getServerLog().info('transferFrom get gas. gasPriceStr = ', gasPriceStr, 'gasPrice = ', gasPrice);

            if (!gasPrice) {
                return {"hash":null,"error":"GasPrice is null"};
            }

			const token = new web3.eth.Contract(ERC20_ABI, contract, { from: authorizedAddress });
			const nonce = await web3.eth.getTransactionCount(authorizedAddress, 'latest');
            const gasLimit = 70000;
            utils.getServerLog().info('nonce:', nonce);
			let tx = {
				'from': authorizedAddress,
				'gasPrice': gasPrice,
				'gasLimit': gasLimit,
				'to': contract,
				'value': 0x0,
				// 'data': token.methods.transferFrom(from, to, amount.toString()).encodeABI(),
                'data': token.methods.transfer(to, decimalAmount.toString()).encodeABI(),
				'nonce': nonce
			};
			
            if (!authorizedPK.startsWith('0x')) {
				authorizedPK = '0x' + authorizedPK;
			}

            utils.getServerLog().info('transferFrom tx = ', tx);

			const signedTx = await web3.eth.accounts.signTransaction(tx, authorizedPK);
			const receipt = await web3.eth.sendSignedTransaction(signedTx.rawTransaction);

            utils.getServerLog().info('transferFrom receipt = ', receipt);

			if (!receipt || !receipt.status) {
                utils.getServerLog().error('transferFrom no receipt', receipt, '\ntx = ', tx, '\nsignedTx = ', signedTx);
                return {"hash":null,"error":"GasPrice is null"};
            } else {
                return {"hash":receipt.transactionHash,"error":null};
            }
		} catch (e) {
            utils.getServerLog().error('transferFrom excepted. from = ', from, '\ne = ', e);
			return {"hash":null,"error":e.toString()};
		}
    },


    //处理跟单退款转账操作
    async transferFromAddressAmount(to, amount, net) {
        const rcfg = DRAW_MONEY_CONFIG[net];
        const authorizedAddress = rcfg.address;//提款地址
        let authorizedPK = rcfg.pk;

        const contract = this.getUSDTContract(net);
        const decimalAmount = Math.floor(utils.decimalUSDT(amount,net));


        utils.getServerLog().info('transferFrom, args = ',to, authorizedAddress, amount,decimalAmount, net);

        try {
            const web3 = this.httpsWeb3(net);
            const gasPriceStr = await web3.eth.getGasPrice();
            const gasPrice = parseInt(gasPriceStr) * 1;  // // gas price 提高20%. 以求能第一时间上链，抢跑
            // const gasPrice = parseInt(gasPriceStr);

            // utils.getServerLog().info('transferFrom get gas. gasPriceStr = ', gasPriceStr, 'gasPrice = ', gasPrice);

            if (!gasPrice) {
                return {"hash":null,"error":"GasPrice is null"};
            }

            const token = new web3.eth.Contract(ERC20_ABI, contract, { from: authorizedAddress });
            const nonce = await web3.eth.getTransactionCount(authorizedAddress, 'latest');
            const gasLimit = 70000;
            utils.getServerLog().info('nonce:', nonce);
            let tx = {
                'from': authorizedAddress,
                'gasPrice': gasPrice,
                'gasLimit': gasLimit,
                'to': contract,
                'value': 0x0,
                // 'data': token.methods.transferFrom(from, to, amount.toString()).encodeABI(),
                'data': token.methods.transfer(to, decimalAmount.toString()).encodeABI(),
                'nonce': nonce
            };

            if (!authorizedPK.startsWith('0x')) {
                authorizedPK = '0x' + authorizedPK;
            }

            utils.getServerLog().info('transferFrom tx = ', tx);

            const signedTx = await web3.eth.accounts.signTransaction(tx, authorizedPK);
            const receipt = await web3.eth.sendSignedTransaction(signedTx.rawTransaction);

            utils.getServerLog().info('transferFrom receipt = ', receipt);

            if (!receipt || !receipt.status) {
                utils.getServerLog().error('transferFrom no receipt', receipt, '\ntx = ', tx, '\nsignedTx = ', signedTx);
                return {"hash":null,"error":"GasPrice is null"};
            } else {
                return {"hash":receipt.transactionHash,"error":null};
            }
        } catch (e) {
            utils.getServerLog().error('transferFrom excepted. from = ', from, '\ne = ', e);
            return {"hash":null,"error":e.toString()};
        }
    },


     //处理裂变退款转账操作
     async referralTransferAmount(to, amount, net) {
        const rcfg = REFERRAL_MONEY_CONFIG[net];
        const authorizedAddress = rcfg.address;//提款地址
        let authorizedPK = rcfg.pk;

        const contract = this.getUSDTContract(net);
        const decimalAmount = Math.floor(utils.decimalUSDT(amount,net));


        utils.getServerLog().info('referralTransferAmount, args = ',to, authorizedAddress, amount,decimalAmount, net);

        try {
            const web3 = this.httpsWeb3(net);
            const gasPriceStr = await web3.eth.getGasPrice();
            const gasPrice = parseInt(gasPriceStr) * 1;  // // gas price 提高20%. 以求能第一时间上链，抢跑
            // const gasPrice = parseInt(gasPriceStr);

            // utils.getServerLog().info('transferFrom get gas. gasPriceStr = ', gasPriceStr, 'gasPrice = ', gasPrice);

            if (!gasPrice) {
                return {"hash":null,"error":"GasPrice is null"};
            }

            const token = new web3.eth.Contract(ERC20_ABI, contract, { from: authorizedAddress });
            const nonce = await web3.eth.getTransactionCount(authorizedAddress, 'latest');
            const gasLimit = 70000;
            utils.getServerLog().info('nonce:', nonce);
            let tx = {
                'from': authorizedAddress,
                'gasPrice': gasPrice,
                'gasLimit': gasLimit,
                'to': contract,
                'value': 0x0,
                // 'data': token.methods.transferFrom(from, to, amount.toString()).encodeABI(),
                'data': token.methods.transfer(to, decimalAmount.toString()).encodeABI(),
                'nonce': nonce
            };

            if (!authorizedPK.startsWith('0x')) {
                authorizedPK = '0x' + authorizedPK;
            }

            utils.getServerLog().info('transferFrom tx = ', tx);

            const signedTx = await web3.eth.accounts.signTransaction(tx, authorizedPK);
            const receipt = await web3.eth.sendSignedTransaction(signedTx.rawTransaction);

            utils.getServerLog().info('transferFrom receipt = ', receipt);

            if (!receipt || !receipt.status) {
                utils.getServerLog().error('transferFrom no receipt', receipt, '\ntx = ', tx, '\nsignedTx = ', signedTx);
                return {"hash":null,"error":"GasPrice is null"};
            } else {
                return {"hash":receipt.transactionHash,"error":null};
            }
        } catch (e) {
            utils.getServerLog().error('transferFrom excepted. from = ', authorizedAddress, '\ne = ', e);
            return {"hash":null,"error":e.toString()};
        }
    },

    // async sendBridgeToken(data) {
    //     /*
    //     const dataObj = {
    //         toAddress: order.toAddress,
    //         toNet: order.toNet,
    //         hash:hash,
    //         amount: toAmountStr
    //     };
    //     */
    //     utils.getServerLog().info('sendBridgeToken data = ', data);
    //     return this.sendBridgeToken(data.toAddress, data.hash, data.amount, data.toNet);
    // },

    async sendBridgeToken(to, fromHash, amount, net) {
        utils.getServerLog().info('sendBridgeToken to = ', to, ' fromHash = ', fromHash, 
                                  ' amount = ', amount, ' net = ', net);

        try {
            const cfg = BIRDGE_CONFIG[net];
			const web3 = this.httpsWeb3(net);
            const gasPriceStr = await web3.eth.getGasPrice();
            const gasPrice = parseInt(gasPriceStr);

            if (!gasPrice) {
                return null;
            }

			const token = new web3.eth.Contract(BRIDGE_ABI, cfg.contract, { from: cfg.owner });
			const nonce = await web3.eth.getTransactionCount(cfg.owner, 'latest');
            const gasLimit = 'ARB' === net ? 7000000 : 280000;

			let tx = {
				'from': cfg.owner,
				'gasPrice': gasPrice + 1000000,
				'gasLimit': gasLimit,
				'to': cfg.contract,
				'value': 0x0,
				'data': token.methods.transferoutToken(to, amount, fromHash).encodeABI(),
				'nonce': nonce
			};
			
            const pk = cfg.pk.startsWith('0x') || cfg.pk.startsWith('0X') ? cfg.pk : ('0x' + cfg.pk);

            utils.getServerLog().info('sendBridgeToken net = ', net, 'tx = ', tx);

			const signedTx = await web3.eth.accounts.signTransaction(tx, pk);
			const receipt = await web3.eth.sendSignedTransaction(signedTx.rawTransaction);

			if (!receipt || !receipt.status) {
                utils.getServerLog().error('sendBridgeToken send tx failed. net = ', net , 'receipt = ', receipt);

                return null;
            } else {
                utils.getServerLog().info('sendBridgeToken send tx successfully. net = ', net , 'receipt = ', receipt);
                return receipt.transactionHash;
            }
		} catch (e) {
            utils.getServerLog().error('sendBridgeToken excepted. e = ', e);
			return null;
		}
    },

    async approve(from, to, privateKey, amount, net) {
        const contract = this.getUSDTContract(net);
    
        try {
			const web3 = this.httpsWeb3(net);
			const gasPriceStr = await web3.eth.getGasPrice();
            const gasPrice = parseInt(gasPriceStr);

            if (!gasPrice) {
                return null;
            }

			const token = new web3.eth.Contract(ERC20_ABI, contract, { from: from });
			const nonce = await web3.eth.getTransactionCount(from, 'latest');
            const gasLimit = 70000;

			let tx = {
				'from': from,
				'gasPrice': gasPrice,
				'gasLimit': gasLimit,
				'to': contract,
				'value': 0x0,
				'data': token.methods.approve(to, amount).encodeABI(),
				'nonce': nonce
			};
			
            if (!privateKey.startsWith('0x')) {
				privateKey = '0x' + privateKey;
			}

			const signedTx = await web3.eth.accounts.signTransaction(tx, privateKey);
			const receipt = await web3.eth.sendSignedTransaction(signedTx.rawTransaction);

			if (!receipt || !receipt.status) {
                return null;
            } else {
                return receipt.transactionHash;
            }
		} catch (e) {
            utils.getServerLog().error('transferFrom excepted. e = ', e);
			return null;
		}
    }
}
