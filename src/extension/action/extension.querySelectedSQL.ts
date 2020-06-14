import * as vscode from 'vscode';
import { AbstractAction } from './AbstractAction';

export class QuerySelectedSQL extends AbstractAction {

    execution(editor: vscode.TextEditor) {
        if (!editor || !editor.document || editor.selection.isEmpty) {
            return;
        }

        const selection = editor.document.getText(editor.selection);
        if (selection) {
            this.sqlMenager.runAsQuery(selection);
        }
    }
}
