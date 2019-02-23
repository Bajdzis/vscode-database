var vscode = require('vscode');
var AbstractAction = require('./AbstractAction.js');
var manager = require('../Manager');


module.exports = class queryFileSQLToCSV extends AbstractAction
{
    
    execution() {
        if(vscode.window.activeTextEditor === undefined){
            return;
        }

        const queries = vscode.window.activeTextEditor.document.getText();

        manager.runAsQueryToCSV(queries);
    };
}