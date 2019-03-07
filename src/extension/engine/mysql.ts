var mysql = require('mysql');
var vscode = require('vscode');
var AbstractServer = require('./AbstractServer.js');

class MySQLType extends AbstractServer
{
    constructor() {
        super();
        this.type = 'mysql';
        this.host = 'Empty';
        this.port = '3306';
        this.user = 'Empty';
        this.password = 'Empty';
        this.onConnectSetDB = null;
    }
    
    /**
     * @param {object} fields
     * @return {Promise}
     */
    connectPromise({host, username, password, socket}) {
        const [hostName, port = '3306'] = host.split(':');
        this.host = hostName;
        this.port = port;
        this.username = username;
        this.password = password;
        const setting = {
            'host': this.host,
            'port': this.port,
            'user': username,
            'password': password
        }
        if(socket){
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
     * @deprecated new implement is queryPromise
     * @param {string} sql
     * @param {function} func - callback
     */
    query (sql, func){
        this.queryPromise(sql).then(func).catch(errMsg => {
            vscode.window.showErrorMessage(errMsg);
            this.outputMsg(errMsg);
        });
    }

    /**
     * @param {string} sql
     * @return {Promise}
     */
    queryPromise(sql){
        return new Promise((resolve, reject) => {
            this.connection.query(sql, (err, rows) => {
                if(err){
                    reject(err.message);
                    return;
                }
                resolve(rows);
            });
        });
    }

    /**
     * @return {Promise<string[], Error>}
     */
    getDatabase(){
        return new Promise((resolve, reject) => {
            this.queryPromise('SHOW DATABASES').then(function(results){
                var allDatabase = [];
                for (var i = 0; i < results.length; i++) {
                    allDatabase.push(results[i].Database);
                }
                resolve(allDatabase);
            }).catch(reject);
        });
    }

    /**
     * @param {string} name - name Database
     * @return {Promise}
     */
    changeDatabase (name){
        return new Promise((resolve, reject) => {
            this.queryPromise('USE `' + name + '`').then(() => {
                this.currentDatabase = name;
                resolve();
            }).catch((err) => {
                this.currentDatabase = null;
                reject(err);
            });
        });
    }

    /**
     * @return {Promise}
     */
    refrestStructureDataBase (){
        var currentStructure = {};
        var tablePromise = [];
        return new Promise((resolve, reject) => {
            this.queryPromise('SHOW tables').then(results => {
                for (let i = 0; i < results.length; i++) {
                    let key = Object.keys(results[i])[0];
                    let tableName = results[i][key];
                    let promise = new Promise((resolve, reject) => {
                        this.queryPromise('SHOW COLUMNS FROM ' + tableName).then((column) => {
                            resolve({
                                column : column,
                                tableName : tableName
                            });
                        }).catch(reject);
                    });
                    tablePromise.push(promise);
                }
                Promise.all(tablePromise).then(data => {
                    for (var i = 0; i < data.length; i++) {
                        var columnStructure = data[i].column;
                        var tableName = data[i].tableName;
                        currentStructure[tableName] = columnStructure;
                    }
                    resolve(currentStructure);
                }).catch(reject);
            }).catch(reject);
        });
    }

    /**
     * @param {string} tableName
     * @return {string} a quoted identifier table name
     */
    getIdentifiedTableName(tableName){
        return `\`${tableName}\``;
    }

    /**
     * @param {string} tableName
     * @return {string} a SQL SELECT statement
     */
    getSelectTableSql(tableName){
        return `SELECT * FROM ${this.getIdentifiedTableName(tableName)}`;
    }

}

MySQLType.prototype.typeName = 'MySql';

MySQLType.prototype.fieldsToConnect = [
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
        defaultValue: 'root',
        name: 'username',
        title: 'Username',
        info: '(e.g root/user)'
    },
    {
        type: 'password',
        name: 'password',
        defaultValue: '',
        title: 'Password',
        info: ''
    }
];

module.exports = MySQLType;
