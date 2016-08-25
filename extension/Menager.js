
var vscode = require('vscode');
var asciiTable = require('./AsciiTable.js');

var MySQLType = require('./engine/mysql.js');
module.exports = function Menager()
{
    var _this = this;
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
            this.refrestStructureDataBase();
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

    this.refrestStructureDataBase = function(){
        _this.currentStructure = {};
        _this.query("SHOW tables ", function(results){
            for (var i = 0; i < results.length; i++) {
                var key = Object.keys(results[i])[0];
                var tableName = results[i][key];
                _this.query("SHOW COLUMNS FROM " + tableName, (function (tableName) { return function (columnStructure) {
                    _this.currentStructure[tableName] = columnStructure;
                }})(tableName) );
            }
        });
        
    }

    this.getStructure = function(){
        return _this.currentStructure;
    }

    this.getCompletionItem = function(){
        var completionItems = [];
        var databaseScructure = _this.getStructure();
        for( var tableName in databaseScructure ) {
            var tableItem = new vscode.CompletionItem(tableName);
            tableItem.insertText = "`" + tableName + "`";
            tableItem.kind = vscode.CompletionItemKind.Class;
            tableItem.detail = "Table";
            tableItem.documentation = databaseScructure[tableName].length + " columns :";
            
            for( var columnName in databaseScructure[tableName] ) {
                var element = databaseScructure[tableName][columnName];
                var item = new vscode.CompletionItem(tableName + '.' + element.Field);
                
                item.kind = vscode.CompletionItemKind.Property;
                item.detail = "Column from " + tableName;
                item.documentation = "Type :" + element.Type + "\n Table :" + tableName + "\n Default :" + element.Default + "\n Key :" + element.Key + "\n Extra :" + element.Extra ;
                item.insertText = element.Field;

                completionItems.push(item);

                tableItem.documentation += "\n " + element.Field + " (" + element.Type  + ")";

            }
            completionItems.push(tableItem);
        }
        return completionItems;
    }
    
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