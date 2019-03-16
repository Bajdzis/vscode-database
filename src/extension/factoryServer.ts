import {MySQLType} from './engine/mysql.js';
import {MySQLSSLType} from './engine/mysql-ssl.js';
import {PostgreSQLType} from './engine/postgresql.js';
import {PostgreSSLSQLType} from './engine/postgresslsql.js';
import { AbstractServer } from './engine/AbstractServer.js';

export const allServerType: {
    [key: string]: typeof AbstractServer;
} = {
    mysql: MySQLType,
    mysqlssl: MySQLSSLType,
    postgres: PostgreSQLType,
    postgresSSL: PostgreSSLSQLType,
};

export type ServerTypeName = keyof typeof allServerType;

export const factoryServer = (type: ServerTypeName): AbstractServer => {
    if (allServerType[type]) {
        const constructor = allServerType[type];
        return new constructor();
    } else {
        throw new Error(`Unsuport type: ${type}`);
    }
};
