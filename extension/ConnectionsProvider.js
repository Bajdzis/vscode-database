var vscode = require('vscode');


class ConnectionsProvider{

	constructor() { 
		this._onDidChangeTreeData = new vscode.EventEmitter();
		this.onDidChangeTreeData = this._onDidChangeTreeData.event;
		this.items = [];
    }

	getTreeItem(element) {
		return element;
	}

	getChildren(element){
		return Promise.resolve(this.items);
	}
	
	refreshList(connections, activeConnection){

		this.items = connections.map(connection => {
			var databaseName = connection.currentDatabase || "no DB selected";
			const item = new vscode.TreeItem(connection.name + ":" + databaseName + (connection === activeConnection ? ' - active' : '' ));
			item.contextValue = "databaseItem";//for menus
			item.command = {
				arguments: [connection],
				command: "extension.changeServer"
			}
			return item;
		});


		vscode.commands.executeCommand('setContext', 'MinimumOneConnectionIsOnline', this.items.length > 0);

		this._onDidChangeTreeData.fire();
	}
}


module.exports = ConnectionsProvider;