import * as vscode from 'vscode';
import { AbstractAction } from './AbstractAction.js';

export class QueryFileSQL extends AbstractAction
{
    
    execution() {
        if(vscode.window.activeTextEditor === undefined){
            return;
        }

        const queries = vscode.window.activeTextEditor.document.getText();

        this.sqlMenager.runAsQuery(queries);
    }
}
