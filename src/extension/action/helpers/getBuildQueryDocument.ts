import * as vscode from 'vscode';
import * as fs from 'fs';

export default function getBuildQueryDocument(): Promise<vscode.TextDocument>{
    const root = vscode.workspace.rootPath;
    if(typeof root === 'undefined'){
        vscode.window.showInformationMessage('Open folder before Query Advancer Build');
        return Promise.reject(new Error('Open folder before Query Advancer Build'));
    }
    const existsDIR = fs.existsSync(root + '/.vscode/');
    if(existsDIR === false){
        fs.mkdirSync(root + '/.vscode/');
    }

    const pathTempFile = vscode.workspace.rootPath + '/.vscode/temp.sql';
    const pathLastSQLFile = vscode.workspace.rootPath + '/.vscode/last.sql';

    if(fs.existsSync(pathTempFile) === false){
        fs.writeFileSync(pathTempFile, '');
    }

    return new Promise((resolve, reject) => {
        vscode.workspace.openTextDocument(vscode.Uri.file(pathTempFile)).then((document) => {
            resolve(document);
            vscode.workspace.onDidCloseTextDocument( closeDocument => {
                if(closeDocument === document){
                    if(fs.existsSync(pathLastSQLFile) === true){
                        fs.unlinkSync(pathLastSQLFile);
                    }
                    fs.rename(pathTempFile, pathLastSQLFile, () => {});
                }
            });
        });
    });

}
