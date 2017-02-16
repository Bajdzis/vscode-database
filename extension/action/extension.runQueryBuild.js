var vscode = require('vscode');
var AbstractAction = require('./AbstractAction.js');
var getBuildQueryDocument = require('./helpers/getBuildQueryDocument.js');

module.exports = class runQueryBuild extends AbstractAction
{
    
    execution() {
        getBuildQueryDocument().then((document) => {
            this.execQuery(document.getText());
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