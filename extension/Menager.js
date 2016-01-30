var mysql = require('mysql');
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
    
    this.connect = function(type, host, user, password){
        if(type == 'mysql'){
            this.currentDatabase = null;
            this.currentServer = new MySQLType();
            this.currentServer.setOutput(this.OutputChannel);
            this.currentServer.connect(host, user, password);
            this.server.push(this.currentServer);
        }else{
            
        }
        this.showStatus();
    };
    
    this.query = function(sql, func){
        this.outputMsg(sql);
        this.currentServer.query(sql, func);
    };
    
    this.changeDatabase = function(name){
        this.query("USE " + name, null);
        this.currentDatabase = name;
        vscode.window.showInformationMessage('Database changed');
        this.showStatus();
    };
    
    this.queryOutput = function(data){
        if(typeof data === 'object'){
            var table = asciiTable(data);
            this.outputMsg(table);
        }else{
            this.outputMsg(String(data));
        }
        if(this.OutputChannel !== null){
            this.OutputChannel.show();
        }
    };
}