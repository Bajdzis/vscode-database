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
    
    connect (host, user, password, menager){
        this.name = host + " (mysql)";
        var hostAndPort = host.split(":");
        this.host = hostAndPort[0];
        this.port = hostAndPort[1] || "3306";
        this.user = user;
        this.password = password;
        this.connection = mysql.createConnection({
            'host'     : this.host,
            'port'     : this.port,
            'user'     : user,
            'password' : password
        });
        var _this = this;
        this.connection.connect(function(err) {
            if(err){
                var errMsg = 'MySQL Error: ' + err.stack;
                vscode.window.showErrorMessage(errMsg);
                _this.outputMsg(errMsg);
                return;
            }
            menager.registerNewServer(_this);
            if(_this.onConnectSetDB !== null){
                _this.query("USE " + _this.onConnectSetDB, null);
                menager.currentDatabase = _this.onConnectSetDB;
                vscode.window.showInformationMessage('Database changed');
                menager.showStatus();
            }
        });

    };

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
                    reject(err);
                } else {
                    resolve();
                }
            });
        });
    };

    
    query (sql, func){
        var _this = this;
        this.connection.query(sql,function(err,rows){
            if(err){
                var errMsg = 'MySQL Error: ' + err.stack;
                vscode.window.showErrorMessage(errMsg);
                _this.outputMsg(errMsg);
                return;
            }
            if(func !== null){
                func(rows);
            }
        });
    };

    getShowDatabaseSql (){
        return `SHOW DATABASES`;
    };

    changeDatabase (name){
        this.query("USE " + name, null);
    };

    refrestStructureDataBase (currentStructure, currentDatabase){
        const that = this;
        this.query("SHOW tables ", function(results){
            for (var i = 0; i < results.length; i++) {
                var key = Object.keys(results[i])[0];
                var tableName = results[i][key];
                that.query("SHOW COLUMNS FROM " + tableName, (function (tableName) { return function (columnStructure) {
                    currentStructure[tableName] = columnStructure;
                }})(tableName) );
            }
        });
    }

}