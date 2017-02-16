var vscode = require('vscode');
var AbstractAction = require('./AbstractAction.js');
var Config = require('./helpers/Config.js');
var config = new Config();

module.exports = class saveConfig extends AbstractAction
{
    
    execution() {
        if(this.sqlMenager.currentServer === null){
            vscode.window.showInformationMessage("You are currently not connected to the server");
            return;
        }

        config.pushDatabase({
            type:this.sqlMenager.currentServer.type,
            name:this.sqlMenager.currentServer.name,
            host:this.sqlMenager.currentServer.host + ":" + this.sqlMenager.currentServer.port,
            user:this.sqlMenager.currentServer.user,
            password:this.sqlMenager.currentServer.password,
            database:this.sqlMenager.currentServer.currentDatabase
        });
    };
}