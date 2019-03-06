var fs = require('fs');
var mysql = require('mysql');
var MySQLType = require('./mysql.js');

class MySQLSSLType extends MySQLType {

    constructor() {
        super();
        this.type = 'mysqlssl';
        this.host = 'Empty';
        this.port = '3306';
        this.user = 'Empty';
        this.password = 'Empty';
        this.onConnectSetDB = null;
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
    connectPromise({host, username, password, socket, key, cert, ca}) {
        const [hostName, port = '3306'] = host.split(':');
        this.host = hostName;
        this.port = port;
        this.username = username;
        this.password = password;
        this.ca = ca;
        this.key = key;
        this.cert = cert;
        const setting = {
            'host': this.host,
            'port': this.port,
            'user': username,
            'password': password,
            'ssl' : {
                rejectUnauthorized : false,
                ca   : fs.readFileSync(ca).toString(),
                key  : fs.readFileSync(key).toString(),
                cert : fs.readFileSync(cert).toString(),
            }
        }
        if (socket) {
            setting.socketPath = this.host;
            delete setting.host;
            delete setting.port;
        }
        this.connection = mysql.createConnection(setting);
        return new Promise((resolve, reject) => {
            this.connection.connect((err) => {
                if (err) {
                    reject(err.message);
                } else {
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
    restoreConnection(fields){
        return this.connectPromise(fields);
    } 
}

MySQLSSLType.prototype.typeName = 'MySql (SSL)';

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

module.exports = MySQLSSLType;
