var vscode = require('vscode');
var AbstractAction = require('./AbstractAction.js');

module.exports = class querySQL extends AbstractAction
{
    
    execution() {
        console.log("querySQL",this);
        vscode.window.showInputBox({
            value:"", 
            prompt: "e.g SELECT * FROM table", 
            placeHolder: "Query", 
            password: false
        }).then((output) => {
            

            if(typeof output === 'undefined'){
                return;
            }
            this.sqlMenager.query(output, (data) => {
                this.sqlMenager.queryOutput(data);
            });

        });
    };


}