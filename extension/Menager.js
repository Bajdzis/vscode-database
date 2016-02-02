
var vscode = require('vscode');
var asciiTable = require('./AsciiTable.js');

var MySQLType = require('./engine/mysql.js');
module.exports = function Menager()
{
    this.server = [];
    this.currentServer = null;
    this.currentDatabase = null;
    this.statusBarItem = null;
    this.OutputChannel = null;
    
    this.showStatus = function(){
        var msg = '$(database) ';
        if(this.statusBarItem === null){
            this.statusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left);
        }
        if(this.currentServer === null){
            msg += 'Server not selected';
            this.statusBarItem.text = msg;
            this.statusBarItem.show();
            return;
        }else{
            msg += this.currentServer.name  + ' > ';
        }
        if(this.currentDatabase === null){
            msg += 'Database not selected';
        }else{
            msg += this.currentDatabase;
        }
        this.statusBarItem.text = msg;
        this.statusBarItem.show();
        
    };
    
    this.outputMsg = function(msg){
        if(this.OutputChannel === null){
            this.OutputChannel = vscode.window.createOutputChannel("database");
        }
        this.OutputChannel.appendLine(msg);
    };
    
    this.connect = function(type, host, user, password, onConnectSetDB){
        if(type == 'mysql'){
            var newServer = new MySQLType();
            newServer.setOutput(this.OutputChannel);
            newServer.onConnectSetDB = onConnectSetDB;
            newServer.connect(host, user, password, this);
            this.showStatus();
            return newServer;
        }
        
    };
    
    this.query = function(sql, func){
        this.outputMsg(sql);
        if(this.currentServer === null){
            vscode.window.showErrorMessage('Server not selected');
        }else{
            this.currentServer.query(sql, func);
        }
    };
    
    this.changeDatabase = function(name){
        this.query("USE " + name, null);
        this.currentDatabase = name;
        vscode.window.showInformationMessage('Database changed');
        this.showStatus();
    };
    
    this.changeServer = function(server){
        this.currentDatabase = null;
        this.currentServer = server;
        vscode.window.showInformationMessage('Server changed');
        this.showStatus();
        
    };
    
    this.registerNewServer = function(obj){
        this.server.push(obj);
        this.changeServer(obj);
    };
    
    this.queryOutput = function(data){
        if(typeof data.message !== 'undefined'){
            var table = asciiTable([{
                fieldCount: data.fieldCount,
                affectedRows: data.affectedRows,
                insertId: data.insertId,
                serverStatus: data.serverStatus,
                warningCount: data.warningCount,
                changedRows: data.changedRows
            }]);
            this.outputMsg(data.message);
            this.outputMsg(table);
        }else if(typeof data === 'object'){
            var table = asciiTable(data);
            this.outputMsg(table);
        }else{
            this.outputMsg("ok");
        }
        if(this.OutputChannel !== null){
            this.OutputChannel.show();
        }
    };
    
    this.changeServerAlias = function(server){
        if(this.currentServer === null){
            return false;
        }
        this.currentServer.name = server;
        this.showStatus();
        
    };
}