var vscode = require('vscode');
var getDataToConnect = require('./helpers/getDataToConnect.js');
var AbstractAction = require('./AbstractAction.js');

module.exports = class connectPostgreSQL extends AbstractAction
{
    
    execution() {
        getDataToConnect().then((data) => {
            vscode.window.showInputBox({ value: "postgres", prompt: "e.g database", placeHolder: "Database", password: false }).then((databaseName) => {
                if (typeof databaseName === 'undefined') {
                    return;
                }
                this.sqlMenager.connectPromise('postgres', data.host, data.user, data.password, databaseName).catch((err) => {
                    vscode.window.showErrorMessage(err);
                });
            });
        });
    };


}