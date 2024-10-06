import utils from "../utils.js";
import eth from '../eth/index.js'
import { REFERRAL_CONTRACT, REFERRAL_OWNER, REFERRAL_OWNER_PK } from "../env.js";

const REFERRAL_AIB = [
	{
		"inputs": [],
		"stateMutability": "nonpayable",
		"type": "constructor"
	},
	{
		"inputs": [
			{
				"internalType": "string",
				"name": "code",
				"type": "string"
			},
			{
				"internalType": "address",
				"name": "invitee",
				"type": "address"
			}
		],
		"name": "addInvitation",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "inviter",
				"type": "address"
			},
			{
				"internalType": "string",
				"name": "code",
				"type": "string"
			}
		],
		"name": "addInviteCode",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "string",
				"name": "code",
				"type": "string"
			}
		],
		"name": "getCodeInvitees",
		"outputs": [
			{
				"internalType": "address[]",
				"name": "",
				"type": "address[]"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "user",
				"type": "address"
			}
		],
		"name": "getInviteCodes",
		"outputs": [
			{
				"internalType": "string[]",
				"name": "",
				"type": "string[]"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "string",
				"name": "code",
				"type": "string"
			},
			{
				"internalType": "address",
				"name": "user",
				"type": "address"
			}
		],
		"name": "isUserInvited",
		"outputs": [
			{
				"internalType": "bool",
				"name": "",
				"type": "bool"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "string",
				"name": "code",
				"type": "string"
			},
			{
				"internalType": "address",
				"name": "invitee",
				"type": "address"
			}
		],
		"name": "removeInvitation",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "inviter",
				"type": "address"
			},
			{
				"internalType": "string",
				"name": "code",
				"type": "string"
			}
		],
		"name": "removeInviteCode",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "newOwner",
				"type": "address"
			}
		],
		"name": "transferOwnership",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	}
];

class Referral {
	constructor () {

	}
}

Referral.write = async function (method, argList) {
	for (const abi of REFERRAL_AIB) {
		if (method === abi.name) {
			try {
				const web3 = eth.httpsWeb3('WOW');
				const gasPriceStr = await web3.eth.getGasPrice();
				const gasPrice = parseInt(gasPriceStr);
	
				if (!gasPrice) {
					return null;
				}
	
				const owner = REFERRAL_OWNER;
				const contractAddress = REFERRAL_CONTRACT;
				const pk = REFERRAL_OWNER_PK.startsWith('0x') || REFERRAL_OWNER_PK.startsWith('0X') 
						  ? REFERRAL_OWNER_PK 
						  : ('0x' + REFERRAL_OWNER_PK);

				const token = new web3.eth.Contract(REFERRAL_AIB, contractAddress, { from: owner });
				const nonce = await web3.eth.getTransactionCount(owner, 'latest');
				const gasLimit = 400000;
	
				const abiMethod = token.methods[abi.name];
				let methodData = '';

				switch(argList.length) {
					case 0: {
						methodData = abiMethod().encodeABI();
						break;
					}
					case 1: {
						methodData = abiMethod(argList[0]).encodeABI();
						break;
					}
					case 2: {
						methodData = abiMethod(argList[0], argList[1]).encodeABI();
						break;
					}
					case 3: {
						methodData = abiMethod(argList[0], argList[1], argList[2]).encodeABI();
						break;
					}
					case 4: {
						methodData = abiMethod(argList[0], argList[1], argList[2], argList[3]).encodeABI();
						break;
					}
					case 5: {
						methodData = abiMethod(argList[0], argList[1], argList[2], argList[3], argList[4]).encodeABI();
						break;
					}
					default: {
						utils.getServerLog().error('Unsupported arg number. max is 5, args length = ', argList.length);
						return null;
					}
				}

				let tx = {
					'from': owner,
					'gasPrice': gasPrice + 1000000,
					'gasLimit': gasLimit,
					'to': contractAddress,
					'value': 0x0,
					'data': methodData,
					'nonce': nonce
				};
	
				utils.getServerLog().info('Referral.write tx = ', tx);
	
				const signedTx = await web3.eth.accounts.signTransaction(tx, pk);
				const receipt = await web3.eth.sendSignedTransaction(signedTx.rawTransaction);
	
				if (!receipt || !receipt.status) {
					utils.getServerLog().error('Referral.write send tx failed. receipt = ', receipt);
	
					return null;
				} else {
					utils.getServerLog().info('Referral.write send tx successfully. receipt = ', receipt);
					return receipt.transactionHash;
				}
			} catch (e) {
				utils.getServerLog().error('sendBridgeToken excepted. e = ', e);
				return null;
			}
		}
	}

	utils.getServerLog().error('Referral.write no method. method = ', method);
	return null;
}

Referral.read = async function (method, argList) {
	try {
		const web3 = eth.httpsWeb3('WOW');
		const owner = REFERRAL_OWNER;
		const contractAddress = REFERRAL_CONTRACT;
		const token = new web3.eth.Contract(REFERRAL_AIB, contractAddress, { from: owner });

		const abiMethod = token.methods[method];
		
		let r = null;

		switch(argList.length) {
			case 0: {
				r = await abiMethod().call();
				break;
			}
			case 1: {
				r = abiMethod(argList[0]).call();
				break;
			}
			case 2: {
				r = abiMethod(argList[0], argList[1]).call();
				break;
			}
			case 3: {
				r = abiMethod(argList[0], argList[1], argList[2]).call();
				break;
			}
			case 4: {
				r = abiMethod(argList[0], argList[1], argList[2], argList[3]).call();
				break;
			}
			case 5: {
				r = abiMethod(argList[0], argList[1], argList[2], argList[3], argList[4]).call();
				break;
			}
			default: {
				utils.getServerLog().error('Unsupported arg number. max is 5, args length = ', argList.length);
				return null;
			}
		}
	
		return r;		
	} catch (e) {
		utils.getServerLog().error('Referral.read excepted. e = ', e);
		return null;
	}
}


export default Referral;

