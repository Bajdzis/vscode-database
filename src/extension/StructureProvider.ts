import * as vscode from 'vscode';
import { AbstractServer } from './engine/AbstractServer';
import { AnyObject } from '../typeing/common';

class StructureProvider{
    private _onDidChangeTreeData: vscode.EventEmitter<any>;
    onDidChangeTreeData: any;
    private items: vscode.TreeItem[];

    constructor() { 
        this._onDidChangeTreeData = new vscode.EventEmitter();
        this.onDidChangeTreeData = this._onDidChangeTreeData.event;
        this.items = [];
    }

    getTreeItem(element: vscode.TreeItem): vscode.TreeItem {
        return element;
    }

    getChildren(){
        return Promise.resolve(this.items);
    }
	
    setStructure(structure: AnyObject, currentServer: AbstractServer){
        const tablesName = Object.keys(structure);

        this.items = tablesName.map(tableName => {
            const item: vscode.TreeItem = new vscode.TreeItem(tableName);
            item.contextValue = 'tableItem';//for menus
            item.command = {
                title: '',
                arguments: [null, null, currentServer.getSelectTableSql(tableName)],
                command: 'extension.querySQL'
            };
            return item;
        });

        vscode.commands.executeCommand('setContext', 'MinimumOneTableInStructure', tablesName.length > 0);

        this._onDidChangeTreeData.fire();
    }
}

const structureProvider = new StructureProvider();

export default structureProvider;
