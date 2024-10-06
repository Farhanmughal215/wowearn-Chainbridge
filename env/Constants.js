
export const RetCodeSuccess = 0;
export const ErrCodeDefault = 1001;
export const ErrCodeInvalidArgs = 1002;
export const ErrCodeConfig = 1003;
export const ErrCodeHTTP = 1004;
export const ErrCodeToken = 1005;
export const ErrCodeContract = 1007;
export const ErrCodeAddress = 1008;
export const ErrCodeSymbol = 1009;
export const ErrCodeNet = 1010;
export const ErrCodeOrderExisted = 1011;
// export const ErrCodeNoUser = 1100;
export const ErrCodeNoData = 1101;
// export const ErrCodeIsMining = 1102;
// export const ErrCodeMinginCleaning = 1103;
// export const ErrCodeMinginPool = 1104;
// export const ErrCodeInsufficientApproval = 1105;
// export const ErrCodeInsufficientBalance = 1106;
// export const ErrCodeInsufficientETH = 1110;
// export const ErrCodeNoETHPRice = 1111;
// export const ErrCodeDays = 1108;
// export const ErrCodeInsufficientUSDT = 1109;
// export const ErrCodeInsufficientAllowance = 1113;
export const ErrCodeWriteDB = 1200;
export const ErrCodeLessThanMin = 1201;
export const ErrCodeOverMax = 1202;
// export const ErrCodeTransaction = 1203;

export const CodeMessageMap = new Map();

CodeMessageMap.set(RetCodeSuccess,	'Success');
CodeMessageMap.set(ErrCodeDefault,	'Unknown error');
CodeMessageMap.set(ErrCodeInvalidArgs,	'Arguments error');
CodeMessageMap.set(ErrCodeConfig,	'Failed to obtain the system configuration');
CodeMessageMap.set(ErrCodeHTTP,	'Http error');
CodeMessageMap.set(ErrCodeToken, 'Invalid token');
CodeMessageMap.set(ErrCodeSymbol, 'Invalid Symbol');
CodeMessageMap.set(ErrCodeNet, 'Invalid Net');

CodeMessageMap.set(ErrCodeContract, 'Invalid Contract');

CodeMessageMap.set(ErrCodeAddress, 'Invalid Address');
CodeMessageMap.set(ErrCodeWriteDB, 'Database write failure');
CodeMessageMap.set(ErrCodeLessThanMin, 'Below minimum value');
CodeMessageMap.set(ErrCodeOverMax, 'Exceeded maximum value');

CodeMessageMap.set(ErrCodeOrderExisted, 'Order existed');


// CodeMessageMap.set(-10,	'Unsupported chain');
// CodeMessageMap.set(-100,	'User not found');
CodeMessageMap.set(ErrCodeNoData,	'No relevant data');
// CodeMessageMap.set(-102,	'User is mining');
// CodeMessageMap.set(-103,	'User is settling mining earnings');
// CodeMessageMap.set(-104,	'Unsupported mining pool');
// CodeMessageMap.set(-105,	'Insufficient authorization limit');
// CodeMessageMap.set(-106,	'Insufficient balance');
// CodeMessageMap.set(-107,	'Must be a multiple of 100');
// CodeMessageMap.set(-108,	'Not supported for this number of days');
// CodeMessageMap.set(-109,	'Insufficient USDT balance');
// CodeMessageMap.set(-110,	'Insufficient ETH balance');
// CodeMessageMap.set(-111,	'Unable to get the ETH price');
// CodeMessageMap.set(-112,	'The account has been frozen');
// CodeMessageMap.set(-113,	'Insufficient USDT allowance');
// CodeMessageMap.set(-150,	'Outstanding loan');
// CodeMessageMap.set(-200,	'Database write failure');
// CodeMessageMap.set(ErrCodeTransaction,	'Send transaction failed');

export function getErrCodeMsg(errCode) {
    const msg = CodeMessageMap.get(errCode);

    return !msg ? 'Unknown error' : msg;
}




