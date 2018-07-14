
var vscode = require('vscode');
var asciiTable = require('./AsciiTable.js');
var StatusBar = require('./StatusBar.js');

var MySQLType = require('./engine/mysql.js');
var PostgreSQLType = require('./engine/postgresql.js');

var structureProvider = require('./StructureProvider');
var connectionsProvider = require('./ConnectionsProvider');

class Manager {

    constructor() {
        this.server = [];
        this.currentServer = null;
        this.statusBar = new StatusBar();
        this.OutputChannel = null;
    };

    showStatus(){
        var databaseName = this.getCurrentDatabase();

        this.statusBar.setServer(this.currentServer.name || null);
        this.statusBar.setDatabase(databaseName);

        if(databaseName !== null){
            this.refreshStructureDataBase();
        }

        connectionsProvider.refreshList(this.server, this.currentServer);
    };

    outputMsg (msg){
        if(this.OutputChannel === null){
            this.OutputChannel = vscode.window.createOutputChannel("database");
        }
        this.OutputChannel.appendLine(msg);
    };

    factoryServer (type){
        if(type == 'mysql'){
            return new MySQLType();
        }else if(type == 'postgres'){
            return new PostgreSQLType();
        }
    };
    
    connect (type, host, user, password, onConnectSetDB){
        var newServer = this.factoryServer(type);
        newServer.setOutput(this.OutputChannel);
        newServer.onConnectSetDB = onConnectSetDB;
        newServer.connect(host, user, password, this);
        this.showStatus();
        return newServer;
    };

    connectPromise (type, host, user, password, database){
        var newServer = this.factoryServer(type);
        var _this = this;
        newServer.setOutput(this.OutputChannel);
        return new Promise((resolve, reject) => {
            newServer.connectPromise(host, user, password, database).then(() => {
                _this.registerNewServer(newServer);
                _this.showStatus();
                resolve(newServer);
            }).catch(reject);
        });

    };
    
    query (sql, func, params){
        this.outputMsg(sql);
        if(this.currentServer === null){
            vscode.window.showErrorMessage('Server not selected');
        }else{
            this.currentServer.query(sql, func, params);
        }
    };

    runAsQuery(sqlMulti){
        if(this.currentServer === null){
           vscode.window.showErrorMessage('Server not selected');
           return;
        }
        
        const queries = this.currentServer.splitQueries(sqlMulti)
            .map((sql) => (this.currentServer.queryPromise(sql).then((data) => {
                    return Promise.resolve({data, sql});
                })
            ));

        Promise.all(queries).then(allResult => {
            allResult.forEach(result => {
                this.outputMsg(result.sql);
                this.queryOutput(result.data);
            });
        }).catch(function(errMsg){
            vscode.window.showErrorMessage(errMsg);
            this.outputMsg(errMsg);
        });
    };
    
    getDatabase (){
        return this.currentServer.getDatabase();
    };

    changeDatabase (name){
        this.currentServer.changeDatabase(name).then(() => {

            const msg = `-- Database changed : ${name} --`;
            this.outputMsg('-'.repeat(msg.length));
            this.outputMsg(msg);
            this.outputMsg('-'.repeat(msg.length));
            this.showStatus();
        });
    };

    getCurrentDatabase () {
        if(this.currentServer === null){
            return null;
        }
        return this.currentServer.currentDatabase;
    };

    refreshStructureDataBase (){
        this.currentServer.refrestStructureDataBase().then((structure) => {
            this.currentStructure = structure;
            structureProvider.setStructure(structure, this.currentServer);
        }).catch(function(err){
            structureProvider.setStructure({}, this.currentServer);
        });
    };

    getStructure (){
        return this.currentStructure;
    };

    getCompletionItem (){
        var completionItems = [];
        var databaseScructure = this.getStructure();

        for( var tableName in databaseScructure ) {
            var tableItem = new vscode.CompletionItem(tableName);
            tableItem.insertText = this.currentServer.getIdentifiedTableName(tableName);
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
    };
    
    changeServer (server){
        this.currentServer = server;
        this.currentStructure = {};
        const msg = `-- Start use server : ${server.name} --`;
        this.outputMsg('-'.repeat(msg.length));
        this.outputMsg(msg);
        this.outputMsg('-'.repeat(msg.length));

        this.showStatus();
        
    };
    
    registerNewServer (obj){
        this.server.push(obj);
        this.changeServer(obj);
    };
    
    queryOutput (data){
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
            const noResult = data.length === 0;
            if (noResult) {
                this.outputMsg("Query result 0 rows!");
            } else {
                var table = asciiTable(data);
                const lines = table.split("\n");
                lines.forEach((line) => {
                    this.outputMsg(line);
                })
            }
        }else{
            this.outputMsg("ok");
        }
        if(this.OutputChannel !== null){
            this.OutputChannel.show();
        }
    };
    
    changeServerAlias (newName){
        if(this.currentServer === null){
            return false;
        }
        this.currentServer.name = newName;
        this.showStatus();
        
    };
}

const manager = new Manager();

module.exports = manager;
