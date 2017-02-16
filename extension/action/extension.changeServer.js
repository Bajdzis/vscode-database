var vscode = require('vscode');
var AbstractAction = require('./AbstractAction.js');

module.exports = class connectPostgreSQL extends AbstractAction
{
    
    execution() {
        vscode.window.showQuickPick(this.getAllServerName(), {
            matchOnDescription:false,
            placeHolder:"Choice connected server"
        }).then((object) => {
            if(typeof object !== 'undefined'){
                var stop = object.label.indexOf(")");
                var index = object.label.substring(0, stop);
                this.sqlMenager.changeServer(this.sqlMenager.server[index]);
            }
        });
    };

    getAllServerName(){
        var allServerName = [];
        for (var i = 0; i < this.sqlMenager.server.length; i++) {
            allServerName.push({
                label:i + ") " + this.sqlMenager.server[i].name,
                description:this.sqlMenager.server[i].host + " " + this.sqlMenager.server[i].user + " " + ("*".repeat(this.sqlMenager.server[i].password.length))
            });
        }
        return allServerName;
    }


}