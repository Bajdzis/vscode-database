import * as vscode from 'vscode';
import { Manager } from '../Manager';

export type CommandCallback = (textEditor: vscode.TextEditor, edit: vscode.TextEditorEdit, ...args: any[]) => void;

export interface Action {
    sqlMenager: Manager;
    execution: CommandCallback;
}
export class AbstractAction implements Action
{
    sqlMenager: Manager;

    constructor(sqlMenager: Manager) {
        this.sqlMenager = sqlMenager;
        this.execution = this.execution.bind(this);
    }

    
    execution(textEditor: vscode.TextEditor, edit: vscode.TextEditorEdit, ...args: any[]): void {

    }
    
}
