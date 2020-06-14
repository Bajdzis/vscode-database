import * as vscode from 'vscode';
import { AbstractServer } from './engine/AbstractServer';


class ConnectionsProvider{
    items: vscode.TreeItem[];
    _onDidChangeTreeData: vscode.EventEmitter<any>;
    onDidChangeTreeData: any;
    
    constructor() { 
        this._onDidChangeTreeData = new vscode.EventEmitter();
        this.onDidChangeTreeData = this._onDidChangeTreeData.event;
        this.items = [];
    }

    getTreeItem(element: vscode.TreeItem) {
        return element;
    }

    getChildren(){
        return Promise.resolve(this.items);
    }
	
    refreshList(connections: AbstractServer[], activeConnection: AbstractServer | null): void{

        this.items = connections.map((connection): vscode.TreeItem => {
            const databaseName = connection.currentDatabase || 'no DB selected';
            const item = new vscode.TreeItem(connection.getName() + ':' + databaseName + (connection === activeConnection ? ' - active' : '' ));
            item.contextValue = 'databaseItem';//for menus
            item.command = {
                title: 'change server',
                arguments: [null, null, connection],
                command: 'extension.changeServer'
            };
            return item;
        });


        vscode.commands.executeCommand('setContext', 'MinimumOneConnectionIsOnline', this.items.length > 0);

        this._onDidChangeTreeData.fire(undefined);
    }
}

const connectionsProvider = new ConnectionsProvider();

export default connectionsProvider;
