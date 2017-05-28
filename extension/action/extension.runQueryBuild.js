var vscode = require('vscode');
var AbstractAction = require('./AbstractAction.js');
var getBuildQueryDocument = require('./helpers/getBuildQueryDocument.js');

module.exports = class runQueryBuild extends AbstractAction
{
    
    execution() {
        getBuildQueryDocument().then((document) => {
            var selection = vscode.window.activeTextEditor.selection;
            var sql = "";
            if (selection) {
                sql = document.getText(new vscode.Range(selection.start, selection.end));
            }

            if (sql.length == 0) {
                this.execQuery(document.getText()); 
            } else {
                this.execQuery(sql);
            }
        });
    };


    execQuery(query) {
        if (!query) {
            return;
        }

         this.sqlMenager.queryPromiseMulti(query).then(allResult => {
            allResult.forEach(result => {
                 this.sqlMenager.queryOutput(result);
            });
        });
    }
}