var vscode = require('vscode');
var AbstractAction = require('./AbstractAction.js');
var { showWebview } = require('../webViews/webViewsRunner');
module.exports = class connectMySQL extends AbstractAction{

    execution(){
        showWebview('connect', 'Connect to SQL server').then((panel) => {
            panel.webview.onDidReceiveMessage((action) => {
                if (action.type === 'CONNECT_TO_SQL_SERVER') {
                    this.connectFactory(action.payload.type, action.payload)
                        .then(() => {
                            panel.dispose();
                        })
                        .catch((error) => {
                            panel.webview.postMessage({ 
                                type: 'CONNECTION_ERROR', 
                                payload : { error } 
                            });
                        });
                }
            });
        });
    }
	
    connectFactory(type, data){
        if(type === 'postgres'){
            return this.connectToPostgres(data);
        }

        if(type === 'mysql'){
            return this.connectToMySQL(data);
        }

        return Promise.reject(`Unknow type ${type}`);
    }
	
    connectToMySQL(data) {
        return this.sqlMenager.connectPromise('mysql', data.host, data.username, data.password).then(() => {
            vscode.commands.executeCommand('extension.changeDB');
        });
    }

    connectToPostgres(data) {
        return vscode.window.showInputBox({ value: 'postgres', prompt: 'e.g database', placeHolder: 'Database', password: false })
            .then((databaseName) => {
                if (databaseName === undefined) {
                    return Promise.reject('Cancel choose database');
                }
                return this.sqlMenager.connectPromise('postgres', data.host, data.username, data.password, databaseName);
            });
    }

};
