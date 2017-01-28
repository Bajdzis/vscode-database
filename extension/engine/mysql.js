var mysql = require('mysql');
var vscode = require('vscode');
var AbstractServer = require('./AbstractServer.js');

module.exports = class MySQLType extends AbstractServer
{
    constructor() {
        super();
        this.type = "mysql";
        this.host = "Empty";
        this.port = "3306";
        this.user = "Empty";
        this.password = "Empty";
        this.onConnectSetDB = null;
    }
    
    /**
     * @todo delete and change start connect from JSON in extension.js
     * @deprecated new implement is connectPromise
     * @param {string} host
     * @param {string} user
     * @param {string} password
     * @param {Menager} menager
     */
    connect (host, user, password, menager){
        this.connectPromise(host, user, password).then(() => {
            menager.registerNewServer(this);
            if(this.onConnectSetDB !== null){
                this.changeDatabase(this.onConnectSetDB).then(()=>{
                    menager.currentDatabase = this.onConnectSetDB;
                    vscode.window.showInformationMessage('Database changed');
                    menager.showStatus();
                });
            }
        }).catch(errMsg => {
            vscode.window.showErrorMessage(errMsg);
            this.outputMsg(errMsg);
        })
    };

    /**
     * @param {string} host
     * @param {string} user
     * @param {string} password
     * @return {Promise}
     */
    connectPromise(host, user, password) {
        this.name = host + " (mysql)";
        var hostAndPort = host.split(":");
        this.host = hostAndPort[0];
        this.port = hostAndPort[1] || "3306";
        this.user = user;
        this.password = password;
        this.connection = mysql.createConnection({
            'host': this.host,
            'port': this.port,
            'user': user,
            'password': password
        });
        return new Promise((resolve, reject) => {
            this.connection.connect(function (err) {
                if (err) {
                    reject('MySQL Error: ' + err.stack);
                } else {
                    resolve();
                }
            });
        });
    };

    /**
     * @deprecated new implement is queryPromise
     * @param {string} sql
     * @param {function} func - callback
     */
    query (sql, func){
        this.queryPromise(sql).then(func).catch(function(errMsg){
            vscode.window.showErrorMessage(errMsg);
            _this.outputMsg(errMsg);
        })
    };

    /**
     * @param {string} sql
     * @return {Promise}
     */
    queryPromise(sql){
        return new Promise((resolve, reject) => {
            this.connection.query(sql, (err, rows) => {
                if(err){
                    reject('MySQL Error: ' + err.stack);
                    return;
                }
                resolve(rows);
            });
        });
    }

    /**
     * @return {string}
     */
    getShowDatabaseSql (){
        return `SHOW DATABASES`;
    };

    /**
     * @param {string} name - name Database
     * @return {Promise}
     */
    changeDatabase (name){
        return new Promise((resolve, reject) => {
            this.queryPromise("USE " + name).then(() => {
                this.currentDatabase = name;
                resolve();
            }).catch(() => {
                this.currentDatabase = null;
                reject();
            });
        });
    };

    /**
     * @param {object} currentStructure - save new structure to this params
     */
    refrestStructureDataBase (currentStructure){
        this.queryPromise("SHOW tables").then(results => {
            for (let i = 0; i < results.length; i++) {
                let key = Object.keys(results[i])[0];
                let tableName = results[i][key];
                this.queryPromise("SHOW COLUMNS FROM " + tableName).then(columnStructure => {
                    currentStructure[tableName] = columnStructure;
                });
            }
        });
    }

}