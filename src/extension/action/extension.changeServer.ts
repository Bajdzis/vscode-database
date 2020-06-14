import * as vscode from 'vscode';
import { AbstractAction } from './AbstractAction';
import { AbstractServer } from '../engine/AbstractServer';

export class ChangeServer extends AbstractAction
{
    
    execution(textEditor: vscode.TextEditor, edit: vscode.TextEditorEdit, server?: AbstractServer) {
        if(server !== undefined){
            this.sqlMenager.changeServer(server);
            return;
        }

        vscode.window.showQuickPick(this.getAllServerName(), {
            matchOnDescription:false,
            placeHolder:'Choice connected server or create new connection'
        }).then((object) => {
            if(typeof object !== 'undefined'){
                const index = object.number;
                if (index !== undefined){
                    this.sqlMenager.changeServer(this.sqlMenager.server[index]);
                }else{
                    vscode.commands.executeCommand('extension.connectToSQLServer');
                }
                
            }
        });
    }

    getAllServerName(){
        const allServerName = [];

        allServerName.push({
            label:'New connection',
            description:'create new connection'
        });

        for (let i = 0; i < this.sqlMenager.server.length; i++) {
            const server = this.sqlMenager.server[i];
            allServerName.push({
                number: i,
                label: `${i+1}) ${server.getName()}`,
                description: ''
            });
        }
        return allServerName;
    }


}
