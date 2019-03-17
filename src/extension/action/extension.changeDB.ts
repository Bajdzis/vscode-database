import * as vscode from 'vscode';
import { AbstractAction } from './AbstractAction';

export class ChangeDB extends AbstractAction
{
    
    execution() {

        this.sqlMenager.getDatabase().then((databaseList) => {
            vscode.window.showQuickPick(databaseList ,{matchOnDescription:false, placeHolder:'Choice database'}).then((object) => {
                if(typeof object !== 'undefined'){
                    this.sqlMenager.changeDatabase(object);
                }
            });
        });
    }


}
