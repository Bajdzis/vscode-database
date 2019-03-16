import * as fs from 'fs';
import * as mysql from 'mysql';
import {MySQLType} from './mysql';
import { AnyObject } from '../../typeing/common';

export class MySQLSSLType extends MySQLType {

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
    connectPromise({host, username, password, socket, key, cert, ca}: AnyObject): Promise<undefined> {
        const [hostName, port = '3306'] = host.split(':');
        this.host = hostName;
        this.port = port;
        this.username = username;
        this.password = password;
        this.ca = ca;
        this.key = key;
        this.cert = cert;
        const setting: mysql.ConnectionConfig = {
            host: this.host,
            port: parseInt(port, 10),
            user: username,
            password: password,
            ssl: {
                rejectUnauthorized : false,
                ca   : fs.readFileSync(ca).toString(),
                key  : fs.readFileSync(key).toString(),
                cert : fs.readFileSync(cert).toString(),
            }
        };
        if (socket) {
            this.socket = hostName;
            setting.socketPath = hostName;
            delete setting.host;
            delete setting.port;
        }
        const connection = mysql.createConnection(setting);
        return new Promise((resolve, reject) => {
            connection.connect((err) => {
                if (err) {
                    reject(err.message);
                } else {
                    this.connection = connection;
                    resolve();
                }
            });
        });
    }

    /**
     * @return {object} - object with some data to save
     */
    getDataToRestore(){
        return Promise.resolve({
            type: this.type,
            name: this.name,
            host: this.host + ':' + this.port,
            socket: this.socket,
            ca: this.ca,
            key: this.key,
            cert: this.cert,
            database: this.currentDatabase,
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

MySQLSSLType.prototype.typeName= 'MySql (SSL)';

MySQLSSLType.prototype.fieldsToConnect = [
    {
        type: 'text',
        defaultValue: 'localhost',
        name: 'host',
        title: 'Host',
        info: '(e.g host, 127.0.0.1, with port 127.0.0.1:3333)'
    },
    {
        type: 'checkbox',
        defaultValue: false,
        name: 'socket',
        title: 'via socket',
        info: '(if you want to connect via socket, enter socketPath in the host field)'
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
