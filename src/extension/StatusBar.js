var vscode = require('vscode');

module.exports = class StatusBar {
    constructor() {
        this.serverStatus = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left);
        this.serverStatus.command = 'extension.changeServer';
        this.serverStatus.show();
        
        this.databaseStatus = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left);
        this.databaseStatus.command = 'extension.changeDB';
        
        this.setDatabase(null);
        this.setServer(null);
    }

    setServer(name){
        this.serverStatus.text = '$(server) ' + (name || 'Server not selected');
        if(name){
            this.databaseStatus.show();
        }else{
            this.databaseStatus.hide();
        }
    }

    setDatabase(name){
        this.databaseStatus.text = ' $(database) ' + (name || 'Database not selected');
    }

};
