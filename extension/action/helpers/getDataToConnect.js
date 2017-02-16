var vscode = require('vscode');

module.exports = function getDataToConnect() {
    var host, user;
    return new Promise( (resolve, reject) => {
        vscode.window.showInputBox({ value: "localhost", prompt: "e.g host, 127.0.0.1", placeHolder: "Host", password: false }).then( (output) => {
            if (output === undefined) {
                resolve(undefined);
                return Promise.reject();
            }
            host = output;
            return vscode.window.showInputBox({ value: "root", prompt: "e.g root/user", placeHolder: "Username", password: false });

        }).then( (output) => {
            if (output === undefined) {
                resolve(undefined);
                return Promise.reject();
            }
            user = output;
            return vscode.window.showInputBox({ value: "", prompt: "e.g password", placeHolder: "Password", password: true });

        }).then((password) => {
            if (password === undefined) {
                resolve(undefined);
                return;
            }
            resolve({
                host: host,
                user: user,
                password: password
            });

        })
    });
}