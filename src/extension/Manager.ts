
import * as vscode from 'vscode';
import {asciiTable} from './AsciiTable';
import { AbstractServer } from './engine/AbstractServer';
import { StatusBar } from './StatusBar';

import { factoryServer, ServerTypeName } from './factoryServer';

import structureProvider from './StructureProvider';
import connectionsProvider from './ConnectionsProvider';

import * as csv from 'fast-csv';
import { AnyObject } from '../typeing/common';


export class Manager {
    server: AbstractServer[];
    currentServer: AbstractServer | null;
    statusBar: StatusBar;
    OutputChannel: vscode.OutputChannel | null;
    currentStructure: AnyObject | null;

    constructor() {
        this.server = [];
        this.currentServer = null;
        this.statusBar = new StatusBar();
        this.OutputChannel = null;
        this.currentStructure = null;
        this.outputMsg = this.outputMsg.bind(this);
    }

    showStatus(){
        const databaseName = this.getCurrentDatabase();

        if (this.currentServer) {
            this.statusBar.setServer(this.currentServer.getName());
        } else {
            this.statusBar.setServer(null);
        }
        this.statusBar.setDatabase(databaseName);

        if(databaseName !== null){
            this.refreshStructureDataBase();
        }

        connectionsProvider.refreshList(this.server, this.currentServer);
    }

    outputMsg (msg: string){
        this.getOutputChannel().appendLine(msg);
    }

    getOutputChannel(): vscode.OutputChannel {
        if (this.OutputChannel === null) {
            this.OutputChannel = vscode.window.createOutputChannel('database');
        }
        return this.OutputChannel;
    }

    async connectPromise (type: ServerTypeName, fields: AnyObject){
        const newServer = await factoryServer(type);
        const _this = this;
        newServer.setOutput(this.OutputChannel);
        return new Promise((resolve, reject) => {
            newServer.connectPromise(fields).then(() => {
                _this.registerNewServer(newServer);
                _this.showStatus();
                resolve(newServer);
            }).catch(reject);
        });

    }

    restoreConnections(databases: AnyObject[]){
        return databases.forEach(async (fields) => {
            const newServer = await factoryServer(fields.type);
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

    runAsQuery(sqlMulti: string){
        if(this.currentServer === null){
            vscode.window.showErrorMessage('Server not selected');
            return;
        }
        const currentServer = this.currentServer;
        sqlMulti=currentServer.removeComments(sqlMulti);
        const queries = currentServer.splitQueries(sqlMulti)
            .map((sql) => currentServer.queryPromise(sql).then((data) => Promise.resolve({data, sql})));

        Promise.all(queries).then(allResult => {
            allResult.forEach(result => {
                this.outputMsg(result.sql);
                this.queryOutput(result.data, result.sql);
            });
        }).catch((errMsg: string) => {
            vscode.window.showErrorMessage(errMsg);
            this.outputMsg(errMsg);
        });
    }

    runAsQueryToCSV(sqlMulti: string){
        if(this.currentServer === null){
            vscode.window.showErrorMessage('Server not selected');
            return;
        }
        const currentServer = this.currentServer;
        sqlMulti=currentServer.removeComments(sqlMulti);
        const queries = currentServer.splitQueries(sqlMulti)
            .map((sql) => currentServer.queryPromise(sql).then((data) => Promise.resolve({data, sql})));

        Promise.all(queries).then(allResult => {
            allResult.forEach(result => {
                this.outputMsg(result.sql);
                this.queryToCSV(result.data);
            });
        }).catch((errMsg: string) => {
            vscode.window.showErrorMessage(errMsg);
            this.outputMsg(errMsg);
        });
    }
    
    getDatabase (){
        if(!this.currentServer){
            return Promise.resolve([]);
        }
        return this.currentServer.getDatabase();
    }

    changeDatabase (name: string){
        if(!this.currentServer){
            return;
        }
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
        if(!this.currentServer){
            return;
        }
        const currentServer = this.currentServer;
        currentServer.refrestStructureDataBase().then((structure) => {
            this.currentStructure = structure;
            structureProvider.setStructure(structure, currentServer);
        }).catch(() => {
            structureProvider.setStructure({}, currentServer);
        });
    }

    getStructure (){
        return this.currentStructure;
    }

    getCompletionItem (): vscode.CompletionItem[]{
        const completionItems: vscode.CompletionItem[] = [];
        const databaseScructure = this.getStructure();

        if(!this.currentServer){
            return completionItems;
        }

        for( const tableName in databaseScructure ) {
            const tableItem = new vscode.CompletionItem(tableName);
            tableItem.insertText = this.currentServer.getIdentifiedTableName(tableName);
            tableItem.kind = vscode.CompletionItemKind.Class;
            tableItem.detail = 'Table';
            tableItem.documentation = databaseScructure[tableName].length + ' columns :';
            
            for( const columnName in databaseScructure[tableName] ) {
                const element = databaseScructure[tableName][columnName];
                const item = new vscode.CompletionItem(tableName + '.' + element.Field);
                
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
    
    changeServer (server: AbstractServer){
        this.currentServer = server;
        this.currentStructure = {};
        const msg = `-- Start use server : ${server.name} --`;
        this.outputMsg('-'.repeat(msg.length));
        this.outputMsg(msg);
        this.outputMsg('-'.repeat(msg.length));

        this.showStatus();
        
    }
    
    registerNewServer (obj: AbstractServer){
        this.server.push(obj);
        this.changeServer(obj);
    }

    queryOutput(data: AnyObject, sql: string){
        this.queryOutputAscii(data);
        this.queryOutputMarkdown(data, sql);
    }
    
    queryOutputAscii (data: AnyObject){
        if(typeof data.message !== 'undefined'){
            this.outputMsg(data.message);
            asciiTable([{
                fieldCount: data.fieldCount,
                affectedRows: data.affectedRows,
                insertId: data.insertId,
                serverStatus: data.serverStatus,
                warningCount: data.warningCount,
                changedRows: data.changedRows
            }], this.outputMsg);
        }else if(typeof data === 'object' && Array.isArray(data)){
            const noResult = data.length === 0;
            if (noResult) {
                this.outputMsg('Query result 0 rows!');
            } else {
                asciiTable(data, this.outputMsg);
            }
        }else{
            this.outputMsg('ok');
        }
        // if(this.OutputChannel !== null){
        //     this.OutputChannel.show();
        // }
    }

    queryOutputMarkdown (data: AnyObject, sql: string){
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

    showQueryResult(data: AnyObject){
        const dataJson = encodeURI(JSON.stringify(data));
        const uri = vscode.Uri.parse(`bajdzis-database-markdown://queryResult?${dataJson}`);

        vscode.commands.executeCommand('markdown.showPreview', uri);
        vscode.commands.executeCommand('markdown.preview.refresh', uri);
    }

    queryToCSV (data: any){
        if(typeof data.message !== 'undefined'){
            this.outputMsg(data.message);
            asciiTable([{
                fieldCount: data.fieldCount,
                affectedRows: data.affectedRows,
                insertId: data.insertId,
                serverStatus: data.serverStatus,
                warningCount: data.warningCount,
                changedRows: data.changedRows
            }], this.outputMsg);
        }else if(typeof data === 'object'){
            const noResult = data.length === 0;
            if (noResult) {
                this.outputMsg('Query result 0 rows!');
            } else {
                csv.writeToString(
                    data,
                    {headers: true},
                    (err: Error, dataCSV: string) => {
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
    
    changeServerAlias (newName: string){
        if(this.currentServer === null){
            return;
        }
        this.currentServer.name = newName;
        this.showStatus();
    }
}

export const manager = new Manager();

