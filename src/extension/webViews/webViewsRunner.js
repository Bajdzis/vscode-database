const vscode = require('vscode');
const path = require('path');
const fs = require('fs');

let extensionPath = '';

const setExtensionPath = (newExtensionPath) => {
    extensionPath = newExtensionPath;
};

const getPath = (piecesOfPath = []) => path.join(extensionPath, 'extension', 'webViews', ...piecesOfPath);

const getSetting = () => ({
    enableScripts: true,
});

const createWebviewPanel = (type, title) => vscode.window.createWebviewPanel(
    type, title, vscode.ViewColumn.One, getSetting()
);

const showWebview = (viewName, title) => {

    return new Promise((resolve, reject) => {
        fs.readFile(getPath(['views', `${viewName}.html`]), 'utf8', (err, html) => {
            if (err) {
                reject(err);
            }
            const panel = createWebviewPanel(viewName, title);
            panel.webview.html = html.replace(/\{\{basePath\}\}/gi,vscode.Uri.file(getPath()).with({
                scheme: 'vscode-resource'
            }));

            resolve(panel);
        });
    // eslint-disable-next-line no-console
    }).catch(err => console.error(err));
};

module.exports = {
    setExtensionPath,
    getSetting,
    createWebviewPanel,
    showWebview
};
