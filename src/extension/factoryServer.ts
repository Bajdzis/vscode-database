import {MySQLType} from './engine/mysql-pass';
import {MySQLSSLType} from './engine/mysql-ssl';
import {PostgreSQLType} from './engine/postgresql';
import {PostgreSSLSQLType} from './engine/postgresslsql';
import { AbstractServer } from './engine/AbstractServer';

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
