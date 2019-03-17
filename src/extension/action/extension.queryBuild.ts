import getBuildQueryDocument from './helpers/getBuildQueryDocument';
import * as vscode from 'vscode';
import { AbstractAction } from './AbstractAction';

export class QueryBuild extends AbstractAction
{
    
    execution() {

        getBuildQueryDocument().then((textDocumentTemp) => {
            vscode.window.showTextDocument(textDocumentTemp, vscode.ViewColumn.One, false);

            const confFiles = vscode.workspace.getConfiguration('files');
            const autoSave = confFiles.get('autoSave', 'off');
            if (autoSave === 'off') {
                vscode.workspace.onDidSaveTextDocument( (document) => {
                    if(textDocumentTemp === document){
                        this.execQuery(document.getText());
                    }
                }, this);
            }
        });

    }

    execQuery(query?: string) {
        if (!query) {
            return;
        }

        this.sqlMenager.runAsQuery(query);
    }
}
