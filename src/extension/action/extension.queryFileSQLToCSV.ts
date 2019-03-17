import * as vscode from 'vscode';
import { AbstractAction } from './AbstractAction';

export class QueryFileSQLToCSV extends AbstractAction
{
    
    execution() {
        if(vscode.window.activeTextEditor === undefined){
            return;
        }

        const queries = vscode.window.activeTextEditor.document.getText();

        this.sqlMenager.runAsQueryToCSV(queries);
    }
}
