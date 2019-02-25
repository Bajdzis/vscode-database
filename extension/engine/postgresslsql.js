var pg = require('pg');
var fs = require('fs');
var PostgreSQLType = require('./postgresql.js');

class PostgreSSLSQLType extends PostgreSQLType {

    constructor() {
        super();
        this.type = 'postgresssl';
        this.host = 'Empty';
        this.port = '5432';
        this.user = 'Empty';
        this.password = 'Empty';
        this.database = undefined;
        this.schema = 'public';
        this.onConnectSetDB = null;
        this.release = null;
    }

    /**
     * @param {object} fields
     * @return {Promise}
     */
    connectPromise({host, database, schema, key, cert, ca}){
        this.name = host + ' (postgres SSL)';
        var hostAndPort = host.split(':');
        this.host = hostAndPort[0];
        this.port = hostAndPort[1] || '5432';
        this.database = database;
        this.schema = schema;
        this.ca = ca;
        this.key = key;
        this.cert = cert;
        this.connection = new pg.Pool({
            database: this.database,
            host: this.host,
            port: this.port,
            max: 10,
            idleTimeoutMillis: 30000,
            schema: this.schema,
            ssl : {
                rejectUnauthorized : false,
                ca   : fs.readFileSync(ca).toString(),
                key  : fs.readFileSync(key).toString(),
                cert : fs.readFileSync(cert).toString(),
            }
        });
        return new Promise((resolve, reject) => {
            this.connection.connect((err, client, release) => {
                this.release = release;
                this.release();
                if (err) {
                    reject(err);
                    return;
                }
                resolve();
            });
            this.connection.on('error', reject);
        });
    }

    /**
     * @return {object} - object with some data to save
     */
    getDataToRestore(){
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
    restoreConnection(fields){
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

module.exports = PostgreSSLSQLType;
