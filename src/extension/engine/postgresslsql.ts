import { AnyObject } from '../../typeing/common';
import { Pool } from 'pg';
import { readFileSync } from 'fs';
import { PostgreSQLType } from './postgresql';
import { AbstractServer } from './AbstractServer';

export class PostgreSSLSQLType extends PostgreSQLType {

    public ca: string;
    public key: string;
    public cert: string;


    constructor() {
        super();
        this.ca = '';
        this.key = '';
        this.cert = '';
    }

    getName() {
        if (this.name) {
            return this.name;
        }
        return  `${this.host}:${this.port} (${this.typeName})`;
    }

    /**
     * @param {object} fields
     * @return {Promise}
     */
    connectPromise({host, database, schema, key, cert, ca}: AnyObject): Promise<undefined> {
        const [hostName, port = '5432'] = host.split(':');
        this.host = hostName;
        this.port = port;
        this.database = database;
        this.schema = schema;
        this.ca = ca;
        this.key = key;
        this.cert = cert;
        const connection = new Pool({
            database: this.database,
            host: this.host,
            port: parseInt(port, 10),
            max: 10,
            idleTimeoutMillis: 30000,
            ssl : {
                rejectUnauthorized : false,
                ca   : readFileSync(ca).toString(),
                key  : readFileSync(key).toString(),
                cert : readFileSync(cert).toString(),
            }
        });
        return new Promise((resolve, reject) => {
            connection.connect((err, client, release) => {
                this.connection = connection;
                this.release = release;
                this.release();
                if (err) {
                    reject(err);
                    return;
                }
                resolve();
            });
            connection.on('error', reject);
        });
    }

    /**
     * @return {object} - object with some data to save
     */
    getDataToRestore(): Promise<AnyObject> {
        return Promise.resolve({
            type:this.type,
            name:this.name,
            host:this.host + ':' + this.port,
            ca: this.ca,
            key: this.key,
            cert: this.cert,
            database:this.currentDatabase,
        });
    }
 
       
    /**
     * @param {object} fields - result getDataToRestore() function
     * @return {Promise}
     */
    restoreConnection(fields: AnyObject): Promise<undefined>{
        return this.connectPromise(fields);
    } 
}

PostgreSSLSQLType.prototype.typeName = 'Postgre SQL (SSL)';

PostgreSSLSQLType.prototype.fieldsToConnect = [
    {
        type: 'text',
        defaultValue: 'localhost',
        name: 'host',
        title: 'Host',
        info: '(e.g host, 127.0.0.1, with port 127.0.0.1:3333)'
    },
    {
        type: 'text',
        defaultValue: 'postgres',
        name: 'database',
        title: 'Database',
        info: ''
    },
    {
        type: 'text',
        defaultValue: 'public',
        title: 'Schema',
        name: 'schema',
        info: ''
    },
    {
        type: 'text',
        defaultValue: '',
        name: 'ca',
        title: 'CA',
        info: '(Server certificates - path to `root.crt`)'
    },
    {
        type: 'text',
        defaultValue: '',
        title: 'KEY',
        name: 'key',
        info: '(Client key - path to `client.key`)'
    },
    {
        type: 'text',
        defaultValue: '',
        title: 'CERT',
        name: 'cert',
        info: '(Client certificates - path to `client.crt`)'
    }
];
