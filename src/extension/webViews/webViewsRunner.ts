import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs';

let extensionPath = '';

export const setExtensionPath = (newExtensionPath: string) => {
    extensionPath = newExtensionPath;
};

const getPath = (piecesOfPath: string[] = []) => path.join(extensionPath, 'webViews', ...piecesOfPath);

export const getSetting = () => ({
    enableScripts: true,
});

export const createWebviewPanel = (type: string, title: string): vscode.WebviewPanel => vscode.window.createWebviewPanel(
    type, title, vscode.ViewColumn.One, getSetting()
);

export const showWebview = (viewName: string, title: string): Promise<vscode.WebviewPanel> => {

    return new Promise((resolve, reject): void => {
        fs.readFile(getPath(['views', `${viewName}.html`]), 'utf8', (err, html): void => {
            if (err) {
                reject(err);
            }
            const panel = createWebviewPanel(viewName, title);
            const cssUri = panel.webview.asWebviewUri(vscode.Uri.file(getPath(['style.css'])));
            panel.webview.html = html.replace(/\{\{mainCssPath\}\}/gi, cssUri.toString());

            resolve(panel);
        });
    // eslint-disable-next-line no-console
    });//.catch(err => {console.error(err);});
};
