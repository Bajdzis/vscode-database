var vscode = require('vscode');
var fs = require('fs');
var AbstractAction = require('./AbstractAction.js');
var getBuildQueryDocument = require('./helpers/getBuildQueryDocument.js');

module.exports = class queryBuild extends AbstractAction
{
    
    execution() {

        getBuildQueryDocument().then((textDocumentTemp) => {
            vscode.window.showTextDocument(textDocumentTemp, vscode.ViewColumn.One, false);

            const confFiles = vscode.workspace.getConfiguration("files");
            const autoSave = confFiles.get("autoSave", "off");
            if (autoSave === "off") {
                vscode.workspace.onDidSaveTextDocument( (document) => {
                    if(textDocumentTemp === document){
                        this.execQuery(document.getText());
                    }
                }, this);
            }
        });

    };

    execQuery(query) {
        if (!query) {
            return;
        }

        this.sqlMenager.runAsQuery(query);
    }
}