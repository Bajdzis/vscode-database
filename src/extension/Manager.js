
var vscode = require('vscode');
var asciiTable = require('./AsciiTable.js');
var StatusBar = require('./StatusBar.js');

var { factoryServer } = require('./factoryServer');

var structureProvider = require('./StructureProvider');
var connectionsProvider = require('./ConnectionsProvider');

var csv = require('fast-csv');

class Manager {

    constructor() {
        this.server = [];
        this.currentServer = null;
        this.statusBar = new StatusBar();
        this.OutputChannel = null;
    }

    showStatus(){
        var databaseName = this.getCurrentDatabase();

        this.statusBar.setServer(this.currentServer.getName() || null);
        this.statusBar.setDatabase(databaseName);

        if(databaseName !== null){
            this.refreshStructureDataBase();
        }

        connectionsProvider.refreshList(this.server, this.currentServer);
    }

    outputMsg (msg){
        if(this.OutputChannel === null){
            this.OutputChannel = vscode.window.createOutputChannel('database');
        }
        this.OutputChannel.appendLine(msg);
    }

    connectPromise (type, fields){
        var newServer = factoryServer(type);
        var _this = this;
        newServer.setOutput(this.OutputChannel);
        return new Promise((resolve, reject) => {
            newServer.connectPromise(fields).then(() => {
                _this.registerNewServer(newServer);
                _this.showStatus();
                resolve(newServer);
            }).catch(reject);
        });

    }

    restoreConnections(databases){
        return databases.forEach((fields) => {
            const newServer = factoryServer(fields.type);
            newServer.setOutput(this.OutputChannel);
            newServer.restoreConnection(fields).then(() => {
                newServer.name = fields.name;
                this.registerNewServer(newServer);
                this.showStatus();
            }).catch((err) => {
                vscode.window.showErrorMessage(err);
            }); 
        });
    }
    
    query (sql, func, params){
        this.outputMsg(sql);
        if(this.currentServer === null){
            vscode.window.showErrorMessage('Server not selected');
        }else{
            this.currentServer.query(sql, func, params);
        }
    }

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
                this.queryOutput(result.data, result.sql);
            });
        }).catch(function(errMsg){
            vscode.window.showErrorMessage(errMsg);
            this.outputMsg(errMsg);
        });
    }

    runAsQueryToCSV(sqlMulti){
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
                this.queryToCSV(result.data);
            });
        }).catch(function(errMsg){
            vscode.window.showErrorMessage(errMsg);
            this.outputMsg(errMsg);
        });
    }
    
    getDatabase (){
        return this.currentServer.getDatabase();
    }

    changeDatabase (name){
        this.currentServer.changeDatabase(name).then(() => {

            const msg = `-- Database changed : ${name} --`;
            this.outputMsg('-'.repeat(msg.length));
            this.outputMsg(msg);
            this.outputMsg('-'.repeat(msg.length));
            this.showStatus();
        });
    }

    getCurrentDatabase () {
        if(this.currentServer === null){
            return null;
        }
        return this.currentServer.currentDatabase;
    }

    refreshStructureDataBase (){
        this.currentServer.refrestStructureDataBase().then((structure) => {
            this.currentStructure = structure;
            structureProvider.setStructure(structure, this.currentServer);
        }).catch(() => {
            structureProvider.setStructure({}, this.currentServer);
        });
    }

    getStructure (){
        return this.currentStructure;
    }

    getCompletionItem (){
        var completionItems = [];
        var databaseScructure = this.getStructure();

        for( var tableName in databaseScructure ) {
            var tableItem = new vscode.CompletionItem(tableName);
            tableItem.insertText = this.currentServer.getIdentifiedTableName(tableName);
            tableItem.kind = vscode.CompletionItemKind.Class;
            tableItem.detail = 'Table';
            tableItem.documentation = databaseScructure[tableName].length + ' columns :';
            
            for( var columnName in databaseScructure[tableName] ) {
                var element = databaseScructure[tableName][columnName];
                var item = new vscode.CompletionItem(tableName + '.' + element.Field);
                
                item.kind = vscode.CompletionItemKind.Property;
                item.detail = 'Column from ' + tableName;
                item.documentation = 'Type :' + element.Type + '\n Table :' + tableName + '\n Default :' + element.Default + '\n Key :' + element.Key + '\n Extra :' + element.Extra ;
                item.insertText = element.Field;

                completionItems.push(item);

                tableItem.documentation += '\n ' + element.Field + ' (' + element.Type  + ')';

            }
            completionItems.push(tableItem);
        }
        return completionItems;
    }
    
    changeServer (server){
        this.currentServer = server;
        this.currentStructure = {};
        const msg = `-- Start use server : ${server.name} --`;
        this.outputMsg('-'.repeat(msg.length));
        this.outputMsg(msg);
        this.outputMsg('-'.repeat(msg.length));

        this.showStatus();
        
    }
    
    registerNewServer (obj){
        this.server.push(obj);
        this.changeServer(obj);
    }

    queryOutput(data, sql){
        this.queryOutputAscii(data, sql);
        this.queryOutputMarkdown(data, sql);
    }
    
    queryOutputAscii (data){
        if(typeof data.message !== 'undefined'){
            let table = asciiTable([{
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
                this.outputMsg('Query result 0 rows!');
            } else {
                let table = asciiTable(data);
                const lines = table.split('\n');
                lines.forEach((line) => {
                    this.outputMsg(line);
                });
            }
        }else{
            this.outputMsg('ok');
        }
        // if(this.OutputChannel !== null){
        //     this.OutputChannel.show();
        // }
    }

    queryOutputMarkdown (data, sql){
        if(typeof data.message !== 'undefined'){
            this.showQueryResult({
                message: data.message,
                sql,
                data: [{
                    fieldCount: data.fieldCount,
                    affectedRows: data.affectedRows,
                    insertId: data.insertId,
                    serverStatus: data.serverStatus,
                    warningCount: data.warningCount,
                    changedRows: data.changedRows
                }]
            });
        }else if(typeof data === 'object'){
            this.showQueryResult({
                message: `Query result ${data.length} rows!`,
                sql,
                data
            });
        }else{
            this.showQueryResult({
                message: 'OK',
                sql
            });
        }

    }

    showQueryResult(data){
        const dataJson = encodeURI(JSON.stringify(data));
        const uri = vscode.Uri.parse(`bajdzis-database-markdown://queryResult?${dataJson}`);

        vscode.commands.executeCommand('markdown.showPreview', uri);
        vscode.commands.executeCommand('markdown.preview.refresh', uri);
    }

    queryToCSV (data){
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
                this.outputMsg('Query result 0 rows!');
            } else {
                csv.writeToString(
                    data,
                    {headers: true},
                    function(err, dataCSV){
                        vscode.workspace.openTextDocument().then(doc => {
                            vscode.window.showTextDocument(doc, 2, false).then(e => {
                                e.edit(edit => {
                                    edit.insert(new vscode.Position(0, 0), dataCSV);
                                });
                            });
                        }, (error) => {
                            vscode.window.showErrorMessage(error);
                        });
                    }
                );
            }
        }else{
            this.outputMsg('ok');
        }
        if(this.OutputChannel !== null){
            this.OutputChannel.show();
        }
    }
    
    changeServerAlias (newName){
        if(this.currentServer === null){
            return false;
        }
        this.currentServer.name = newName;
        this.showStatus();
        
    }
}

const manager = new Manager();

module.exports = manager;
