var mysql = require('mysql');
var vscode = require('vscode');

module.exports = function MySQLType()
{
    this.conection = null;
    this.name = "Noname";
    this.OutputChannel = null;
    this.connect = function(host, user, password){
        this.name = host;
        this.conection = mysql.createConnection({
            'host'     : host,
            'user'     : user,
            'password' : password
        });
    };
    
    this.setOutput = function(OutputChannel){
        this.OutputChannel = OutputChannel;
    };
    
    this.outputMsg = function(msg){
        this.OutputChannel.appendLine(msg);
    };
    
    this.query = function(sql, func, vsOutput){
        this.conection.query(sql,function(err,rows){
            if(err){
                vscode.window.showErrorMessage('MySQL Error: ' + err.stack);
                this.outputMsg('MySQL Error: ' + err.stack);
                return;
            }
            if(func !== null){
                func(rows);
            }
        });
    };
    
}