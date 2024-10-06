import {BIRDGE_CONFIG, REFUND_BIRDGE_CONFIG} from "../env.js";
import TronWeb from 'tronweb';
import BigNumber from "bignumber.js";
import axios from 'axios';
import {accountsUrl} from './TRC20Config.js';


let request = axios.create({
	baseURL: '',
	timeout: 30 * 10000,
});

export const DeepNode = {
	// TRX: 'https://rpc.ankr.com/premium-http/tron/d013a6907500b5fd01e3fef7b4af816f3bac6ef5ad61aade96370e91b8a58ec8',
	// TRX: 'http://tron.formal.local',
	// TRX: 'http://47.57.183.150:7092',  // HK IDC node
	// TRX: 'https://trx.wpf.cc',
	TRX: 'https://nile.trongrid.io', //TRON nile测试链
	// TRX: 'http://bsccdn.wowearn.com',
	ETH: 'https://eth.wpf.cc',
	// ETH: 'http://bsccdn.wowearn.com',
	// ETH: 'https://rpc.ankr.com/eth/d013a6907500b5fd01e3fef7b4af816f3bac6ef5ad61aade96370e91b8a58ec8',
	// ETH: 'http://eth.wpf.cc',
	// BSC: 'https://rpc.ankr.com/bsc/d013a6907500b5fd01e3fef7b4af816f3bac6ef5ad61aade96370e91b8a58ec8',
	BSC: 'https://bsc.wpf.cc',
	// BSC: 'http://bsccdn.wowearn.com',
	// BSC: 'http://bsccdn.wowearn.com',
	MATIC: 'https://matic.wpf.cc',
	// MATIC: 'http://matic.nownodes.io/3c687930-855a-45de-a5dc-c87bb0c7ac0d',
	// MATIC: 'https://rpc.ankr.com/polygon/d013a6907500b5fd01e3fef7b4af816f3bac6ef5ad61aade96370e91b8a58ec8',
	// MATIC: 'http://polygon.formal.local',
	HECO: 'https://heco.wpf.cc',
	// HECO: 'https://rpc.ankr.com/heco/d013a6907500b5fd01e3fef7b4af816f3bac6ef5ad61aade96370e91b8a58ec8',
	// HECO: 'http://heco.wpf.cc',
	BTC: 'https://btc.wpf.cc/node',
	// BTC: 'http://btc.formal.local',
	FTM: 'https://ftm.wpf.cc',
	// FTM: 'https://rpc.ankr.com/fantom/d013a6907500b5fd01e3fef7b4af816f3bac6ef5ad61aade96370e91b8a58ec8',
	ARBITRUM: 'https://arb.wpf.cc',
	// ARBITRUM: 'https://rpc.ankr.com/arbitrum/d013a6907500b5fd01e3fef7b4af816f3bac6ef5ad61aade96370e91b8a58ec8',
	OP: 'https://op.wpf.cc',
	// OP: 'https://rpc.ankr.com/optimism/d013a6907500b5fd01e3fef7b4af816f3bac6ef5ad61aade96370e91b8a58ec8',
	// AVAX: 'https://rpc.ankr.com/avalanche/d013a6907500b5fd01e3fef7b4af816f3bac6ef5ad61aade96370e91b8a58ec8',
	AVAX: 'https://avax.wpf.cc',
	CELO: 'https://celo.wpf.cc',
	// CELO: 'http://celo.formal.local',
	// CELO: 'https://rpc.ankr.com/celo/d013a6907500b5fd01e3fef7b4af816f3bac6ef5ad61aade96370e91b8a58ec8',
	Multichain: 'https://rpc.ankr.com/multichain/d013a6907500b5fd01e3fef7b4af816f3bac6ef5ad61aade96370e91b8a58ec8',

	BASE: 'https://base.wpf.cc',
	FLARE: 'https://flare.wpf.cc',
	GNOSIS: 'https://gnosis.wpf.cc',
	LINEA: 'https://linea.wpf.cc',
	ROLLUX: 'https://rollux.wpf.cc',
	SCROLL: 'https://scroll.wpf.cc',
	SYSCOIN: 'https://syscoin.wpf.cc',
	"POLYGONZK": 'https://polygonzkevm.wpf.cc',
	VIC: 'https://rpc.viction.xyz'
}

//跨链桥合约ABI
const TRCContract_ABI = [
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "tokenAddress",
				"type": "address"
			}
		],
		"stateMutability": "nonpayable",
		"type": "constructor"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": true,
				"internalType": "address",
				"name": "addr",
				"type": "address"
			},
			{
				"indexed": false,
				"internalType": "uint256",
				"name": "amount",
				"type": "uint256"
			},
			{
				"indexed": true,
				"internalType": "bytes32",
				"name": "txHash",
				"type": "bytes32"
			}
		],
		"name": "TransferOutTokenLog",
		"type": "event"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": true,
				"internalType": "address",
				"name": "from",
				"type": "address"
			},
			{
				"indexed": true,
				"internalType": "address",
				"name": "to",
				"type": "address"
			},
			{
				"indexed": false,
				"internalType": "uint256",
				"name": "amount",
				"type": "uint256"
			}
		],
		"name": "TransferTokenLog",
		"type": "event"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "",
				"type": "address"
			}
		],
		"name": "balances",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "deposit",
		"outputs": [],
		"stateMutability": "payable",
		"type": "function"
	},
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
				"internalType": "bytes32",
				"name": "txHash",
				"type": "bytes32"
			}
		],
		"name": "transferOutToken",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "amount",
				"type": "uint256"
			}
		],
		"name": "transferToken",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	}
];

const TRC20_ABI =[
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
	}, {
		"constant": true,
		"inputs": [],
		"name": "decimals",
		"outputs": [{ "name": "", "type": "uint8" }],
		"payable": false,
		"stateMutability": "view",
		"type": "function"
	}, {
		"constant": true,
		"inputs": [],
		"name": "symbol",
		"outputs": [{ "name": "", "type": "string" }],
		"payable": false,
		"stateMutability": "view",
		"type": "function"
	}, {
		"constant": true,
		"inputs": [],
		"name": "name",
		"outputs": [{ "name": "", "type": "string" }],
		"payable": false,
		"stateMutability": "view",
		"type": "function"
	}
];


export default {
	// 创建TronWeb实例
	createTronWeb(privateKey) {
		// const privateKey = BIRDGE_CONFIG.TRON.pk;
		if (privateKey && privateKey.length !== 64) {
			throw new Error("Invalid private key length");
		}
		const url = DeepNode.TRX;
		const HttpProvider = TronWeb.providers.HttpProvider;
		const fullNode = new HttpProvider(url);
		const solidityNode = new HttpProvider(url);
		const eventServer = new HttpProvider(url);

		let tronWeb = null;
		if (!privateKey || 0 === privateKey.length) {
			tronWeb = new TronWeb(fullNode, solidityNode, eventServer);
		} else {
			tronWeb = new TronWeb(fullNode, solidityNode, eventServer, privateKey);
		}
		return tronWeb;
	},

	isValidTrxAddress(addr){
		let result = false;
		// 创建TronWeb实例
		const tronWeb = this.createTronWeb(BIRDGE_CONFIG.TRON.pk);
		// 验证目标地址和转移金额的格式和有效性
		if (!tronWeb.isAddress(addr)) {
			return false;
		}

		//校验地址有效性
		const isValidAddress = tronWeb.trx.getAccount(addr);
		if (!isValidAddress) {
			return false;
		}
		result = true;
		return result;
	},

	//执行合约转账方法
	async transfer(toAddr, amount, cleanedTxHash) {
		// 创建TronWeb实例
		const tronWeb = this.createTronWeb(BIRDGE_CONFIG.TRON.pk);
		// 验证目标地址和转移金额的格式和有效性
		if (!tronWeb.isAddress(toAddr)) {
			throw new Error("Invalid to address");
		}

		//校验地址有效性
		const isValidAddress = await tronWeb.trx.getAccount(toAddr);
		if (!isValidAddress) {
			console.log("Attempting to transfer to address:", toAddr);
			throw new Error("Account does not exist or is not activated");
		}

		// //校验金额有效性和hash有效性
		// if (typeof amount !== 'number' || amount <= 0) {
		// 	throw new Error("Invalid transfer amount");
		// }

		let txHash = cleanedTxHash;
		if (txHash.startsWith("0x")) {
			// 去掉 txHash 中的 "0x" 前缀
			txHash = cleanedTxHash.substring(2);
		}
		if (typeof txHash !== 'string' || txHash.length !== 64 || !txHash.match(/^[a-fA-F0-9]+$/)) {
			throw new Error("Invalid transaction hash");
		}

		//根据合约ABI和合约地址创建合约实例
		const contract = tronWeb.contract(TRCContract_ABI, BIRDGE_CONFIG.TRON.contract);
        //将金额转换为上链数值
		const transValue = BigNumber(amount).times(BigNumber(Math.pow(10, 18))).toString(10);
		//校验合约是否存在
		if (!contract) {
			throw new Error("Failed to load contract");
		}
		//执行转账操作
		try {
			//gasLimit设置为0，表示使用默认值
			const gasLimit = 0;
			//设置转账选项
			const options = {
				from: BIRDGE_CONFIG.TRON.owner,
				gasPrice: '',
				gas: gasLimit,
			};
			//获取预估手续费
			let result =await this.estimateFee(contract)
			if (result.success == 1) {
				options.gasPrice = result.data.suggestBasePrice;
				options.gasFee = Number(result.data.suggestGasFee)
				if (!gasLimit || gasLimit == 0) {
					options.gas = Number(result.data.gasLimit)
				}
			}
			//将交易哈希转换为字节数组
			const arrayifiedTxHash = tronWeb.utils.code.hexStr2byteArray(txHash);
			console.log("to address=", toAddr);
            //执行上链操作
            const response = await contract.methods.transferOutToken(toAddr, transValue, arrayifiedTxHash).send(options);
			console.log("response ==" + response);
			// 处理响应，例如返回交易哈希或其他相关信息
			return response;
		} catch (error) {
			console.error("Error TRC20 transferring token:", error.message);
			// 处理错误，例如返回错误响应给客户端
			throw error; // 或者返回null或其他错误处理方法
		}
	},



	//TRON退款功能
	async tronRefund(toAddr, amount,net) {
		// 创建TronWeb实例
		const tronWeb = this.createTronWeb(REFUND_BIRDGE_CONFIG.TRON.pk);
		// 验证目标地址和转移金额的格式和有效性
		if (!tronWeb.isAddress(toAddr)) {
			throw new Error("Invalid to address");
		}

		//校验地址有效性
		const isValidAddress = await tronWeb.trx.getAccount(toAddr);
		if (!isValidAddress) {
			console.log("Attempting to transfer to address:", toAddr);
			throw new Error("Account does not exist or is not activated");
		}

		//校验金额有效性和hash有效性
		if (typeof amount !== 'number' || amount <= 0) {
			throw new Error("Invalid transfer amount");
		}

		//根据合约ABI和合约地址创建合约实例
		const contract = tronWeb.contract(TRC20_ABI, REFUND_BIRDGE_CONFIG.TRON.contract);
		//将金额转换为上链数值
		const transValue = BigNumber(amount).times(BigNumber(Math.pow(10, 18))).toString(10);
		//校验合约是否存在
		if (!contract) {
			throw new Error("Failed to load contract");
		}
		//执行转账操作
		try {
			//gasLimit设置为0，表示使用默认值
			const gasLimit = 0;
			//设置转账选项
			const options = {
				from: REFUND_BIRDGE_CONFIG.TRON.address,
				gasPrice: '',
				gas: gasLimit,
			};
			//获取预估手续费
			let result =await this.estimateFee(contract)
			if (result.success == 1) {
				options.gasPrice = result.data.suggestBasePrice;
				options.gasFee = Number(result.data.suggestGasFee)
				if (!gasLimit || gasLimit == 0) {
					options.gas = Number(result.data.gasLimit)
				}
			}
			//执行转账操作
			const response = await contract.methods.transfer(toAddr, transValue).send(options);
			// 处理响应，例如返回交易哈希或其他相关信息
			return response;
		} catch (error) {
			console.error("Error TRC20 transferring token:", error.message);
			// 处理错误，例如返回错误响应给客户端
			throw error; // 或者返回null或其他错误处理方法
		}
	},


	async estimateFee(contract = null) {
		// gas fee unit: TRX
		// let tronWeb = this.createTronWeb()
		const baseGas = !contract ? 1 : 4.5;
		let gasFee = 0
		if (contract) {
			gasFee = 25.2
		} else {
			gasFee = 1.5
		}
		let estimateResult = {
			'SafeGasPrice': (baseGas * 0.8).toFixed(0),
			'suggestBasePrice': (baseGas).toFixed(0),
			'FastGasPrice': (baseGas * 1.3).toFixed(0),
			// 'SafeGasFee': SUNtoTRXtoStr(baseGas * 0.8),
			// 'suggestGasFee': SUNtoTRXtoStr(baseGas),
			// 'FastGasFee': SUNtoTRXtoStr(baseGas * 1.3),
			'SafeGasFee': gasFee,
			'suggestGasFee': gasFee,
			'FastGasFee': gasFee
		};

		estimateResult['FastText'] = '30 seconds';
		estimateResult['suggestText'] = '60 seconds';
		estimateResult['SafeText'] = '90 seconds';

		estimateResult['gasLimit'] = '0';

		return { success: 1, data: estimateResult };
	},

	TokenMetaMap: new Map(),
	async getTokenMetaData(contractAddress) {
		if (!TronWeb.isAddress(contractAddress)) {
			return null;
		}

		if (!this.isBase58Address(contractAddress)) {
			contractAddress = TronWeb.address.fromHex(contractAddress);
		}

		const cache = this.TokenMetaMap.get(contractAddress);

		if (!!cache) {
			return cache;
		}

		const tronWeb = this.createTronWeb(BIRDGE_CONFIG.TRON.pk);
		const contract = tronWeb.contract(TRC20_ABI, contractAddress);

		if (!contract) {
			return null;
		}

		tronWeb.setAddress(contractAddress);

		const meta = {
			symbol: '',
			decimal: '',
			name: '',
			address: contractAddress
		}

		try {
			meta.symbol = await contract.methods.symbol().call();
		} catch (e) {
			meta.symbol = await contract.methods.symbol().call();
		}

		try {
			meta.decimal = await contract.methods.decimals().call();
		} catch (e) {
			meta.decimal = await contract.methods.decimals().call();

			// console.log('getTokenMetaData decimal excepted', e.toString());
		}

		try {
			meta.name = await contract.methods.name().call();
		} catch (e) {
			meta.name = await contract.methods.name().call();
			// console.log('getTokenMetaData name excepted', e.toString());
		}

		// const promises = [contract.methods.symbol().call(), contract.methods.decimals().call(), contract.methods.name().call()]

		// await Promise.allSettled(promises).then(res => {
		// 	if (res[0].value) meta.symbol = res[0].value
		// 	if (res[1].value) meta.decimal = res[1].value
		// 	if (res[2].value) meta.name = res[2].value
		// })

		this.TokenMetaMap.set(contractAddress, meta);

		return meta;
	},

	isAddress(address) {
		return TronWeb.isAddress(address);
	},

	isBase58Address(address) {
		return TronWeb.utils.crypto.isAddressValid(address);
	},

	async  getRequest(url, query) {
		//构建请求头：
		let headers = {
			'Content-Type': 'application/json',
			'TRON-PRO-API-KEY': '773462c8-e6d3-47ec-8c8a-cc0e36772e19'
		};
		let res = await request({
			method: "get",
			url: url,
			params: query,
			headers: headers,
		});
		// let res = await axios.get(url, {
		//   params: query,
		//   headers
		// })

		return res;
	},
	async getTRC20Transaction(addr) {
		const result  = this.isValidTrxAddress(addr);
		try {
			const url = accountsUrl + addr +"/transactions/trc20?limit=50&only_unconfirmed=false";
			let res = await this.getRequest(url, null);
			let resultList =[];
			const trxData = res.data.data;
			for (let trc of trxData) {
				const txHash = trc.transaction_id;
				const contractAddress = trc.token_info.address;
				const blockTimestamp = trc.block_timestamp;
				const symbol = trc.token_info.symbol;
				const decimal = trc.token_info.decimals;
				const name = trc.token_info.name;
				const from = trc.from;
				const to = trc.to;
				//除以decimal
				const value = trc.value;
				const actualAmount = BigNumber(value).div(Math.pow(10, decimal)).toString(10);

				let transaction = {
					"txHash": txHash,
					"contractAddress": contractAddress,
					"symbol": symbol,
					"decimal": decimal,
					"name": name,
					"from": from,
					"to": to,
					"value": actualAmount,
					"blockTimestamp": blockTimestamp
				}
				resultList.push(transaction);
			}
          return resultList;
		} catch (error) {
			console.error("Error getTRC20Transaction:", error.message);
			// 处理错误，例如返回错误响应给客户端
			throw error; // 或者返回null或其他错误处理方法
		}
	},
}
