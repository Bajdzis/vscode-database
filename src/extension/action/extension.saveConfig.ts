import config from './helpers/Config';
import * as vscode from 'vscode';
import { AbstractAction } from './AbstractAction';

export class SaveConfig extends AbstractAction
{
    
    execution() {
        const server = this.sqlMenager.currentServer;
        if(server === null){
            vscode.window.showInformationMessage('You are currently not connected to the server');
            return;
        }
        server.getDataToRestore().then((database) => {
            config.pushDatabase(database);
        });
    }
}
