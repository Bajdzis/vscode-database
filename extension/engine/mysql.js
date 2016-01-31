var mysql = require('mysql');
var vscode = require('vscode');

module.exports = function MySQLType()
{
    this.connection = null;
    this.name = "Noname";
    this.type = "mysql";
    this.host = "Empty";
    this.user = "Empty";
    this.password = "Empty";
    this.OutputChannel = null;

    this.connect = function(host, user, password, menager){
        this.name = host + " (mysql)";
        this.host = host;
        this.user = user;
        this.password = password;
        this.connection = mysql.createConnection({
            'host'     : host,
            'user'     : user,
            'password' : password
        });
        var instancja = this;
        this.connection.connect(function(err) {
            if(err){
                var errMsg = 'MySQL Error: ' + err.stack;
                vscode.window.showErrorMessage(errMsg);
                menager.outputMsg(errMsg);
                return;
            }
            menager.registerNewServer(instancja);
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
    
    this.query = function(sql, func, vsOutput){
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
    
}