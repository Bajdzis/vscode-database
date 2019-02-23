var vscode = require('vscode');
var AbstractAction = require('./AbstractAction.js');
var config = require('./helpers/Config');

module.exports = class saveConfig extends AbstractAction
{
    
    execution() {
        const server = this.sqlMenager.currentServer;
        if(server === null){
            vscode.window.showInformationMessage('You are currently not connected to the server');
            return;
        }

        config.pushDatabase({
            type:server.type,
            name:server.name,
            host:server.host + ':' + server.port,
            user:server.user,
            password:server.password,
            database:server.currentDatabase
        });
    }
};
