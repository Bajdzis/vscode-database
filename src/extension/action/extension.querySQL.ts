import * as vscode from 'vscode';
import { AbstractAction } from './AbstractAction.js';

export class QuerySQL extends AbstractAction
{
    
    execution(textEditor: vscode.TextEditor, edit: vscode.TextEditorEdit, query?: string) {

        if(typeof query === 'string'){
            this.runQuery(query);
            return;
        }

        vscode.window.showInputBox({
            value:'', 
            prompt: 'e.g SELECT * FROM table', 
            placeHolder: 'Query', 
            password: false
        }).then(this.runQuery);
    }

    runQuery(query?: string) {
        if(typeof query === 'undefined'){
            return;
        }
        this.sqlMenager.runAsQuery(query);
    }

}
