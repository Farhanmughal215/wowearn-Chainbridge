import utils from "../utils.js";
import eth from '../eth/index.js'
import { BETA_CONTRACT, BETA_OWNER, BETA_OWNER_PK } from "../env.js";
import Referral from "./referral.js";

const Beta_ABI = [
    {
        "inputs": [
            {
                "internalType": "string",
                "name": "name_",
                "type": "string"
            },
            {
                "internalType": "string",
                "name": "symbol_",
                "type": "string"
            },
            {
                "internalType": "uint8",
                "name": "decimals_",
                "type": "uint8"
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
                "name": "owner",
                "type": "address"
            },
            {
                "indexed": true,
                "internalType": "address",
                "name": "spender",
                "type": "address"
            },
            {
                "indexed": false,
                "internalType": "uint256",
                "name": "value",
                "type": "uint256"
            }
        ],
        "name": "Approval",
        "type": "event"
    },
    {
        "anonymous": false,
        "inputs": [
            {
                "indexed": false,
                "internalType": "address",
                "name": "bridge",
                "type": "address"
            },
            {
                "indexed": false,
                "internalType": "uint256",
                "name": "supplyCap",
                "type": "uint256"
            }
        ],
        "name": "BridgeSupplyCapUpdated",
        "type": "event"
    },
    {
        "anonymous": false,
        "inputs": [
            {
                "indexed": true,
                "internalType": "address",
                "name": "previousOwner",
                "type": "address"
            },
            {
                "indexed": true,
                "internalType": "address",
                "name": "newOwner",
                "type": "address"
            }
        ],
        "name": "OwnershipTransferred",
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
                "name": "value",
                "type": "uint256"
            }
        ],
        "name": "Transfer",
        "type": "event"
    },
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "owner",
                "type": "address"
            },
            {
                "internalType": "address",
                "name": "spender",
                "type": "address"
            }
        ],
        "name": "allowance",
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
        "inputs": [
            {
                "internalType": "address",
                "name": "spender",
                "type": "address"
            },
            {
                "internalType": "uint256",
                "name": "amount",
                "type": "uint256"
            }
        ],
        "name": "approve",
        "outputs": [
            {
                "internalType": "bool",
                "name": "",
                "type": "bool"
            }
        ],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "account",
                "type": "address"
            }
        ],
        "name": "balanceOf",
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
        "inputs": [
            {
                "internalType": "address",
                "name": "",
                "type": "address"
            }
        ],
        "name": "bridges",
        "outputs": [
            {
                "internalType": "uint256",
                "name": "cap",
                "type": "uint256"
            },
            {
                "internalType": "uint256",
                "name": "total",
                "type": "uint256"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "uint256",
                "name": "_amount",
                "type": "uint256"
            }
        ],
        "name": "burn",
        "outputs": [
            {
                "internalType": "bool",
                "name": "",
                "type": "bool"
            }
        ],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "_from",
                "type": "address"
            },
            {
                "internalType": "uint256",
                "name": "_amount",
                "type": "uint256"
            }
        ],
        "name": "burn",
        "outputs": [
            {
                "internalType": "bool",
                "name": "",
                "type": "bool"
            }
        ],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "_from",
                "type": "address"
            },
            {
                "internalType": "uint256",
                "name": "_amount",
                "type": "uint256"
            }
        ],
        "name": "burnFrom",
        "outputs": [
            {
                "internalType": "bool",
                "name": "",
                "type": "bool"
            }
        ],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "decimals",
        "outputs": [
            {
                "internalType": "uint8",
                "name": "",
                "type": "uint8"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "spender",
                "type": "address"
            },
            {
                "internalType": "uint256",
                "name": "subtractedValue",
                "type": "uint256"
            }
        ],
        "name": "decreaseAllowance",
        "outputs": [
            {
                "internalType": "bool",
                "name": "",
                "type": "bool"
            }
        ],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "getOwner",
        "outputs": [
            {
                "internalType": "address",
                "name": "",
                "type": "address"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "spender",
                "type": "address"
            },
            {
                "internalType": "uint256",
                "name": "addedValue",
                "type": "uint256"
            }
        ],
        "name": "increaseAllowance",
        "outputs": [
            {
                "internalType": "bool",
                "name": "",
                "type": "bool"
            }
        ],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "_to",
                "type": "address"
            },
            {
                "internalType": "uint256",
                "name": "_amount",
                "type": "uint256"
            }
        ],
        "name": "mint",
        "outputs": [
            {
                "internalType": "bool",
                "name": "",
                "type": "bool"
            }
        ],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "_to",
                "type": "address"
            },
            {
                "internalType": "uint256",
                "name": "_value",
                "type": "uint256"
            },
            {
                "internalType": "address",
                "name": "_spender",
                "type": "address"
            }
        ],
        "name": "mintAndApprove",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "name",
        "outputs": [
            {
                "internalType": "string",
                "name": "",
                "type": "string"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "owner",
        "outputs": [
            {
                "internalType": "address",
                "name": "",
                "type": "address"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "symbol",
        "outputs": [
            {
                "internalType": "string",
                "name": "",
                "type": "string"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "totalSupply",
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
        "inputs": [
            {
                "internalType": "address",
                "name": "to",
                "type": "address"
            },
            {
                "internalType": "uint256",
                "name": "amount",
                "type": "uint256"
            }
        ],
        "name": "transfer",
        "outputs": [
            {
                "internalType": "bool",
                "name": "",
                "type": "bool"
            }
        ],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "from",
                "type": "address"
            },
            {
                "internalType": "address",
                "name": "to",
                "type": "address"
            },
            {
                "internalType": "uint256",
                "name": "amount",
                "type": "uint256"
            }
        ],
        "name": "transferFrom",
        "outputs": [
            {
                "internalType": "bool",
                "name": "",
                "type": "bool"
            }
        ],
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
    },
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "_bridge",
                "type": "address"
            },
            {
                "internalType": "uint256",
                "name": "_cap",
                "type": "uint256"
            }
        ],
        "name": "updateBridgeSupplyCap",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    }
];



class Beta {
    constructor () {

    }
}

// Beta.BetaWrite = async function (method, argList) {
//     for (const abi of Beta_ABI) {
//         if (method === abi.name) {
//             try {
//                 const web3 = eth.httpsWeb3('WOW');
//                 const gasPriceStr = await web3.eth.getGasPrice();
//                 const gasPrice = parseInt(gasPriceStr);
//
//                 // const fixedGasPrice = web3.utils.toWei('2.2', 'gwei');  // 1.3 GWei 转换为 Wei
//                 const increasedGasPrice = Math.floor(gasPrice * 1.1);
//
//                 if (!gasPrice) {
//                     return null;
//                 }
//
//                 const owner = BETA_OWNER;
//                 const contractAddress = BETA_CONTRACT;
//                 const pk = BETA_OWNER_PK.startsWith('0x') || BETA_OWNER_PK.startsWith('0X')
//                     ? BETA_OWNER_PK
//                     : ('0x' + BETA_OWNER_PK);
//
//                 const token = new web3.eth.Contract(Beta_ABI, contractAddress, { from: owner });
//                 const nonce = await web3.eth.getTransactionCount(owner, 'latest');
//                 const gasLimit = 400000;
//
//                 const abiMethod = token.methods[abi.name];
//                 let methodData = '';
//
//                 switch(argList.length) {
//                     case 0: {
//                         methodData = abiMethod().encodeABI();
//                         break;
//                     }
//                     case 1: {
//                         methodData = abiMethod(argList[0]).encodeABI();
//                         break;
//                     }
//                     case 2: {
//                         methodData = abiMethod(argList[0], argList[1]).encodeABI();
//                         break;
//                     }
//                     case 3: {
//                         methodData = abiMethod(argList[0], argList[1], argList[2]).encodeABI();
//                         break;
//                     }
//                     case 4: {
//                         methodData = abiMethod(argList[0], argList[1], argList[2], argList[3]).encodeABI();
//                         break;
//                     }
//                     case 5: {
//                         methodData = abiMethod(argList[0], argList[1], argList[2], argList[3], argList[4]).encodeABI();
//                         break;
//                     }
//                     default: {
//                         utils.getServerLog().error('Unsupported arg number. max is 5, args length = ', argList.length);
//                         return null;
//                     }
//                 }
//
//                 let tx = {
//                     'from': owner,
//                     'gasPrice': increasedGasPrice,
//                     'gasLimit': gasLimit,
//                     'to': contractAddress,
//                     'value': 0x0,
//                     'data': methodData,
//                     'nonce': nonce
//                 };
//
//                 utils.getServerLog().info('Referral.write tx = ', tx);
//
//                 const signedTx = await web3.eth.accounts.signTransaction(tx, pk);
//                 const receipt = await web3.eth.sendSignedTransaction(signedTx.rawTransaction);
//
//                 if (!receipt || !receipt.status) {
//                     utils.getServerLog().error('Referral.write send tx failed. receipt = ', receipt);
//
//                     return null;
//                 } else {
//                     utils.getServerLog().info('Referral.write send tx successfully. receipt = ', receipt);
//                     return receipt.transactionHash;
//                 }
//             } catch (e) {
//                 utils.getServerLog().error('sendBridgeToken excepted. e = ', e);
//                 return null;
//             }
//         }
//     }
//
//     utils.getServerLog().error('Referral.write no method. method = ', method);
//     return null;
// }


// const INCREASE_PERCENTAGE = 0.1; // 10% 增长
// const MAX_RETRIES = 2; // 最大重试次数
//
// Beta.BetaWrite = async function (method, argList) {
//     const sendTransaction = async (retryCount = 0, lastGasPrice = null) => {
//         let gasPrice; // 在函数的开始部分定义 gasPrice 变量
//
//         try {
//             const web3 = eth.httpsWeb3('WOW');
//
//             if (retryCount === 0) {
//                 const gasPriceStr = await web3.eth.getGasPrice();
//                 const gasPriceInt = parseInt(gasPriceStr);
//                 gasPrice = Math.floor(gasPriceInt * 1.1);
//             } else {
//                 gasPrice = Math.floor(lastGasPrice * (1 + INCREASE_PERCENTAGE));
//             }
//
//             if (!gasPrice) {
//                 utils.getServerLog().error('Failed to get gas price.');
//                 return null;
//             }
//
//             const owner = BETA_OWNER;
//             const contractAddress = BETA_CONTRACT;
//             const pk = BETA_OWNER_PK.startsWith('0x') || BETA_OWNER_PK.startsWith('0X') ? BETA_OWNER_PK : ('0x' + BETA_OWNER_PK);
//
//             const token = new web3.eth.Contract(Beta_ABI, contractAddress, { from: owner });
//             const nonce = await web3.eth.getTransactionCount(owner, 'latest');
//             const gasLimit = 400000;
//
//             const abiMethod = token.methods[method];
//             let methodData = '';
//
//             switch (argList.length) {
//                 case 0:
//                     methodData = abiMethod().encodeABI();
//                     break;
//                 case 1:
//                     methodData = abiMethod(argList[0]).encodeABI();
//                     break;
//                 case 2:
//                     methodData = abiMethod(argList[0], argList[1]).encodeABI();
//                     break;
//                 case 3:
//                     methodData = abiMethod(argList[0], argList[1], argList[2]).encodeABI();
//                     break;
//                 case 4:
//                     methodData = abiMethod(argList[0], argList[1], argList[2], argList[3]).encodeABI();
//                     break;
//                 case 5:
//                     methodData = abiMethod(argList[0], argList[1], argList[2], argList[3], argList[4]).encodeABI();
//                     break;
//                 default:
//                     utils.getServerLog().error('Unsupported arg number. max is 5, args length = ', argList.length);
//                     return null;
//             }
//
//             const tx = {
//                 'from': owner,
//                 'gasPrice': gasPrice,
//                 'gasLimit': gasLimit,
//                 'to': contractAddress,
//                 'value': 0x0,
//                 'data': methodData,
//                 'nonce': nonce
//             };
//
//             utils.getServerLog().info('Referral.write tx = ', tx);
//
//             const signedTx = await web3.eth.accounts.signTransaction(tx, pk);
//             const receipt = await web3.eth.sendSignedTransaction(signedTx.rawTransaction);
//
//             if (!receipt || !receipt.status) {
//                 utils.getServerLog().error('Referral.write send tx failed. receipt = ', receipt);
//                 return null;
//             } else {
//                 utils.getServerLog().info('Referral.write send tx successfully. receipt = ', receipt);
//                 return receipt.transactionHash;
//             }
//         } catch (e) {
//             if (e.message.includes('replacement transaction underpriced') && retryCount < MAX_RETRIES) {
//                 utils.getServerLog().warn(`Retry ${retryCount + 1}: Increasing gas price and retrying...`);
//                 return sendTransaction(retryCount + 1, gasPrice); // 使用当前的 gasPrice 进行递归调用
//             } else {
//                 utils.getServerLog().error('sendBridgeToken exception. e = ', e);
//                 return null;
//             }
//         }
//     };
//
//     for (const abi of Beta_ABI) {
//         if (method === abi.name) {
//             return sendTransaction(); // 初次调用不传递 gasPrice
//         }
//     }
//
//     utils.getServerLog().error('Referral.write no method. method = ', method);
//     return null;
// };


const INCREASE_PERCENTAGE = 0.1; // 10% 增长
const MAX_RETRIES = 3; // 最大重试次数 // 改动点：将 MAX_RETRIES 的值从 2 改为 3

Beta.BetaWrite = async function (method, argList) {
    const sendTransaction = async (retryCount = 0, lastGasPrice = null) => {
        let gasPrice; // 在函数的开始部分定义 gasPrice 变量

        try {
            const web3 = eth.httpsWeb3('WOW');

            if (retryCount === 0) {
                const gasPriceStr = await web3.eth.getGasPrice();
                const gasPriceInt = parseInt(gasPriceStr);
                gasPrice = Math.floor(gasPriceInt * (1 + INCREASE_PERCENTAGE));
            } else {
                // 改动点：动态调整增长率
                const dynamicIncrease = 1 + (INCREASE_PERCENTAGE + retryCount * 0.05);
                gasPrice = Math.floor(lastGasPrice * dynamicIncrease); // 动态调整增长率
            }

            if (!gasPrice) {
                utils.getServerLog().error('Failed to get gas price.');
                return null;
            }

            const owner = BETA_OWNER;
            const contractAddress = BETA_CONTRACT;
            const pk = BETA_OWNER_PK.startsWith('0x') || BETA_OWNER_PK.startsWith('0X') ? BETA_OWNER_PK : ('0x' + BETA_OWNER_PK);

            const token = new web3.eth.Contract(Beta_ABI, contractAddress, { from: owner });
            const nonce = await web3.eth.getTransactionCount(owner, 'latest');
            const gasLimit = 400000;

            const abiMethod = token.methods[method];
            let methodData = '';

            switch (argList.length) {
                case 0:
                    methodData = abiMethod().encodeABI();
                    break;
                case 1:
                    methodData = abiMethod(argList[0]).encodeABI();
                    break;
                case 2:
                    methodData = abiMethod(argList[0], argList[1]).encodeABI();
                    break;
                case 3:
                    methodData = abiMethod(argList[0], argList[1], argList[2]).encodeABI();
                    break;
                case 4:
                    methodData = abiMethod(argList[0], argList[1], argList[2], argList[3]).encodeABI();
                    break;
                case 5:
                    methodData = abiMethod(argList[0], argList[1], argList[2], argList[3], argList[4]).encodeABI();
                    break;
                default:
                    utils.getServerLog().error('Unsupported arg number. max is 5, args length = ', argList.length);
                    return null;
            }

            const tx = {
                'from': owner,
                'gasPrice': gasPrice,
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
            if (e.message.includes('replacement transaction underpriced') && retryCount < MAX_RETRIES) {
                utils.getServerLog().warn(`Retry ${retryCount + 1}: Increasing gas price and retrying...`);
                return sendTransaction(retryCount + 1, gasPrice); // 使用当前的 gasPrice 进行递归调用
            } else {
                utils.getServerLog().error('sendBridgeToken exception. e = ', e);
                return null;
            }
        }
    };

    for (const abi of Beta_ABI) {
        if (method === abi.name) {
            return sendTransaction(); // 初次调用不传递 gasPrice
        }
    }

    utils.getServerLog().error('Referral.write no method. method = ', method);
    return null;
};



export default Beta;