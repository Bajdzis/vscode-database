var vscode = require('vscode');
var fs = require('fs');

module.exports = function getBuildQueryDocument(){
    const root = vscode.workspace.rootPath;
    if(typeof root === 'undefined'){
        vscode.window.showInformationMessage('Open folder before Query Advancer Build');
        return;
    }
    const existsDIR = fs.existsSync(root + '/.vscode/');
    if(existsDIR === false){
        fs.mkdirSync(root + '/.vscode/');
    }

    var pathTempFile = vscode.workspace.rootPath + '/.vscode/temp.sql';
    var pathLastSQLFile = vscode.workspace.rootPath + '/.vscode/last.sql';

    if(fs.existsSync(pathTempFile) === false){
        fs.writeFileSync(pathTempFile, '');
    }

    return new Promise((resolve, reject) => {
        vscode.workspace.openTextDocument(vscode.Uri.file(pathTempFile)).then(function(document){
            resolve(document);
            vscode.workspace.onDidCloseTextDocument( closeDocument => {
                if(closeDocument === document){
                    if(fs.existsSync(pathLastSQLFile) === true){
                        fs.unlinkSync(pathLastSQLFile);
                    }
                    fs.rename(pathTempFile, pathLastSQLFile);
                }
            });
        }).catch(reject);
    });

};
