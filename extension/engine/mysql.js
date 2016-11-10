var mysql = require('mysql');
var vscode = require('vscode');

module.exports = function MySQLType()
{
    this.connection = null;
    this.name = "Noname";
    this.type = "mysql";
    this.host = "Empty";
    this.port = "3306";
    this.user = "Empty";
    this.password = "Empty";
    this.OutputChannel = null;
    this.onConnectSetDB = null;

    this.connect = function(host, user, password, menager){
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
        var instancja = this;
        this.connection.connect(function(err) {
            if(err){
                var errMsg = 'MySQL Error: ' + err.stack;
                vscode.window.showErrorMessage(errMsg);
                instancja.outputMsg(errMsg);
                return;
            }
            menager.registerNewServer(instancja);
            if(instancja.onConnectSetDB !== null){
                instancja.query("USE " + instancja.onConnectSetDB, null);
                menager.currentDatabase = instancja.onConnectSetDB;
                vscode.window.showInformationMessage('Database changed');
                menager.showStatus();
            }
        });

    };
    
    this.setOutput = function(OutputChannel){
        this.OutputChannel = OutputChannel;
    };
    
    this.outputMsg = function(msg){
        if(this.OutputChannel !== null){
            this.OutputChannel.appendLine(msg);
        }
    };
    
    this.query = function(sql, func){
        var instancja = this;
        this.connection.query(sql,function(err,rows){
            if(err){
                var errMsg = 'MySQL Error: ' + err.stack;
                vscode.window.showErrorMessage(errMsg);
                instancja.outputMsg(errMsg);
                return;
            }
            if(func !== null){
                func(rows);
            }
        });
    };

    this.getShowDatabaseSql = function(){
        return `SHOW DATABASES`;
    };

    this.changeDatabase = function(name){
        this.query("USE " + name, null);
    };

    this.refrestStructureDataBase = function(currentStructure){
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