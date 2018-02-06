var vscode = require('vscode');
var AbstractAction = require('./AbstractAction.js');

module.exports = class querySQL extends AbstractAction
{
    
    execution(query = null) {

        const runQuery = (query) => {
            if(typeof query === 'undefined'){
                return;
            }
            this.sqlMenager.query(query, (data) => {
                this.sqlMenager.queryOutput(data);
            });
        }

        if(query !== null && typeof query === 'string'){
            runQuery(query);
            return;
        }

        vscode.window.showInputBox({
            value:"", 
            prompt: "e.g SELECT * FROM table", 
            placeHolder: "Query", 
            password: false
        }).then(runQuery);
    };




}