var vscode = require('vscode');


class StructureProvider{

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
	
	setStructure(structure, currentServer){
        const tablesName = Object.keys(structure);

        this.items = tablesName.map(tableName => {
			const item = new vscode.TreeItem(tableName);
			item.contextValue = "tableItem";//for menus
			item.command = {
				arguments: [currentServer.getSelectTableSql(tableName)],
				command: "extension.querySQL"
			}
			return item;
		});

		vscode.commands.executeCommand('setContext', 'MinimumOneTableInStructure', tablesName.length > 0);

		this._onDidChangeTreeData.fire();
	}
}

const structureProvider = new StructureProvider();

module.exports = structureProvider;