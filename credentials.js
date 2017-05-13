module.exports = {
cookieSecret: ' 把你的cookie 秘钥放在这里',
mongo: {
        development: {
        //connectionString: 'mongodb://user:pass@localhost:port/database',
        connectionString: 'mongodb://127.0.0.1:27017/rebatedb',
        },
        production: {
        connectionString: 'mongodb://localhost:27017/rebatedb',
        },
    },
};

