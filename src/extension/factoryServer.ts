import { AbstractServer } from './engine/AbstractServer';

export const allServerType: {
    [key: string]: () => Promise<{ default: typeof AbstractServer}>;
} = {
    mysql: () => import('./engine/mysql-pass'),
    mysqlssl: () => import('./engine/mysql-ssl'),
    mysqlxdev: () => import('./engine/mysql-xdev'),
    postgres: () => import('./engine/postgresql'),
    postgresSSL: () => import('./engine/postgresslsql'),
};

export type ServerTypeName = keyof typeof allServerType;

export const factoryServer = async (type: ServerTypeName): Promise<AbstractServer> => {
    if (allServerType[type]) {
        const serverModule = await allServerType[type]();
        const constructor =  serverModule.default;
        return new constructor();
    } else {
        return Promise.reject(`Not support type: ${type}`);
    }
};
