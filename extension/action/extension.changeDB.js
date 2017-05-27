var vscode = require('vscode');
var AbstractAction = require('./AbstractAction.js');

module.exports = class connectPostgreSQL extends AbstractAction {

    execution() {
        this.sqlMenager.getDatabase().then((databaseList) => {
            //sqlite returns it's connection that has a property file name
            if (!databaseList.filename) {
                vscode.window.showQuickPick(databaseList, {
                    matchOnDescription: false,
                    placeHolder: "Choice database"
                }).then((object) => {
                    if (typeof object !== 'undefined') {
                        this.sqlMenager.changeDatabase(object);
                    }
                });
            }
        }).catch((err) => {
            vscode.window.showErrorMessage(err);
        });
    };


}