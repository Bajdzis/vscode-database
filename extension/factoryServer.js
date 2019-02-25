var MySQLType = require('./engine/mysql.js');
var PostgreSQLType = require('./engine/postgresql.js');
var PostgreSSLSQLType = require('./engine/postgresslsql.js');

const allServerType = {
    mysql: MySQLType,
    postgres: PostgreSQLType,
    postgresSSL: PostgreSSLSQLType,
};

const factoryServer = (type) => {
    if (allServerType[type]) {
        const constructor = allServerType[type];
        return new constructor();
    } else {
        throw new Error(`Unsuport type: ${type}`);
    }
};

module.exports = {
    factoryServer,
    allServerType
};
