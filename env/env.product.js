
export const env = 'product';
export const SERVER_PORT = 7021;



export const MYSQL_HOST = '192.168.1.11';
export const MYSQL_PORT = '3306';
export const MYSQL_USER = 'root';
export const MYSQL_PWD = 'adm#inY33';
export const MYSQL_DEFAULT_DB = 'chainbridge';

export const CALL_TOKEN = 'LK*^NBFR*KMNMKJGFRttujbgfuasiksdfIKNtu*67^*(omhgt%GFFJKI*yh';

export const BIRDGE_CONFIG = {
    ETH: {
        contract: '0x1C25D26462f4430Eb3d7f01d250E954A52D9C307',
        owner: '0xd2be2D83f3ed12200C64b769df3AeB4322D750DF',
        pk: '0x6e35af39db67c008d316cbdd7ad238b9181b534ff7e827e29c40033b1ba94090'
    },
    BSC: {
        contract: '0x1C25D26462f4430Eb3d7f01d250E954A52D9C307',
        owner: '0xd2be2D83f3ed12200C64b769df3AeB4322D750DF',
        pk: '0x6e35af39db67c008d316cbdd7ad238b9181b534ff7e827e29c40033b1ba94090'
    }, 
    ARB: {
        contract: '0x1C25D26462f4430Eb3d7f01d250E954A52D9C307',
        owner: '0xd2be2D83f3ed12200C64b769df3AeB4322D750DF',
        pk: '0x6e35af39db67c008d316cbdd7ad238b9181b534ff7e827e29c40033b1ba94090'
    }, 
    WOW: {
        contract: '0xd05222c399D7b61c4d079040c29caDe293e52a37',
        owner: '0xE62Abc97F331727B04A08EF5Ca068D858bD138A3',
        pk: '0xd17318bbc5b85f88be4fc71908fe31d73b588c19bd4c30b61884d8dc4360a329'
    }
};

export const REFUND_BIRDGE_CONFIG = {
    // ETH: {
    //     contract: '0x1C25D26462f4430Eb3d7f01d250E954A52D9C307',
    //     owner: '0xd2be2D83f3ed12200C64b769df3AeB4322D750DF',
    //     pk: '0x6e35af39db67c008d316cbdd7ad238b9181b534ff7e827e29c40033b1ba94090'
    // },
    // BSC: {
    //     contract: '0x1C25D26462f4430Eb3d7f01d250E954A52D9C307',
    //     owner: '0xd2be2D83f3ed12200C64b769df3AeB4322D750DF',
    //     pk: '0x6e35af39db67c008d316cbdd7ad238b9181b534ff7e827e29c40033b1ba94090'
    // }, 
    // ARB: {
    //     contract: '0x1C25D26462f4430Eb3d7f01d250E954A52D9C307',
    //     owner: '0xd2be2D83f3ed12200C64b769df3AeB4322D750DF',
    //     pk: '0x6e35af39db67c008d316cbdd7ad238b9181b534ff7e827e29c40033b1ba94090'
    // }, 
    WOW: {
        address: '0xE62Abc97F331727B04A08EF5Ca068D858bD138A3',
        pk: '0xd17318bbc5b85f88be4fc71908fe31d73b588c19bd4c30b61884d8dc4360a329'
    }
};

export const WOW_USDT = '0x5ACF4a178641d8A74e670A146b789ADccd3FCb24';

// export const PENDING_EXPIRE = (15 * 60 * 1000);
export const PENDING_EXPIRE = (2 * 60 * 1000);
export const MIN_BRIDGE_USDT = 0.01;
export const MAX_BRIDGE_USDT = 10000;

export const MQ_ENABLE = true;

export const MQ_PROTOCOL = 'amqp';
export const MQ_HOST = '192.168.1.11';
export const MQ_PORT = 5672;
export const MQ_USER = 'guest';
export const MQ_PWD = 'guest';


export const MQ_BRIDGE_EXCHANGE = 'bridge-exchange';
export const MQ_BRIDGE_QUEUE = 'bridge-queue';
export const MQ_BRIDGE_ROUTING_KEY = '';

// export const MQ_TX_EXCHANGE = 'xbit-exchange';
// export const MQ_TX_QUEUE = 'debit';
// export const MQ_TX_ROUTING_KEY = '';

// export const MQ_USER_EXCHANGE = 'xbit-user';
// export const MQ_USER_QUEUE = 'user-mine';
// export const MQ_USER_ROUTING_KEY = '';


// 裂变合约配置
export const REFERRAL_OWNER = '0xE62Abc97F331727B04A08EF5Ca068D858bD138A3';
export const REFERRAL_CONTRACT = '0x7171Ac57C5097761c02E50F5DCF271fEEDCd4370';
export const REFERRAL_OWNER_PK = 'd17318bbc5b85f88be4fc71908fe31d73b588c19bd4c30b61884d8dc4360a329';
