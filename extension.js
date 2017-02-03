
var vscode = require('vscode');
var fs = require('fs');
var Menager = require('./extension/Menager.js');
var menager = new Menager();

function getBuildQueryDocument(){
    const root = vscode.workspace.rootPath;
    if(typeof root === 'undefined'){
        vscode.window.showInformationMessage("Open folder before Query Advancer Build");
        return;
    }
    const existsDIR = fs.existsSync(root + '/.vscode/');
    if(existsDIR === false){
        fs.mkdirSync(root + '/.vscode/');
    }

    var pathTempFile = vscode.workspace.rootPath + '/.vscode/temp.sql';
    var pathLastSQLFile = vscode.workspace.rootPath + '/.vscode/last.sql';

    if(fs.existsSync(pathTempFile) === false){
        fs.writeFileSync(pathTempFile, "");
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
            })
        });
    });

}
function buildQuery() {
    getBuildQueryDocument().then((textDocumentTemp) => {
        vscode.window.showTextDocument(textDocumentTemp, vscode.ViewColumn.One, false);

        const confFiles = vscode.workspace.getConfiguration("files");
        const autoSave = confFiles.get("autoSave", "off");
        if (autoSave === "off") {
            vscode.workspace.onDidSaveTextDocument( (document) => {
                if(textDocumentTemp === document){
                    execQuery(document.getText());
                }
            }, this);
        }
    });
}

function runBuildQuery() {
    getBuildQueryDocument().then((document) => {
        execQuery(document.getText());
    });
}

function execQuery(query) {
    if (!query) {
        return;
    }

    menager.queryPromiseMulti(query).then(allResult => {
        allResult.forEach(result => {
            menager.queryOutput(result);
        });
    });
}

function getDataToConnect() {
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
function activate(context) {


    var keyWords = vscode.languages.registerCompletionItemProvider('sql',{
        
        provideCompletionItems(document, position, token) {
            return menager.getCompletionItem();
        },
        resolveCompletionItem(item, token) {
            return item;
        }
        
    },' ');

    context.subscriptions.push(keyWords);

    var root = vscode.workspace.rootPath;
    if(typeof root !== 'undefined'){
        var exists = fs.existsSync(root + '/.vscode/database.json');
        if(exists !== false){
            fs.readFile(root + '/.vscode/database.json', function(err, data) {
                if (err) {
                    vscode.window.showErrorMessage('Failed read file /.vscode/database.json');
                    return;
                }
                var json = data.toString('ascii');
                var config =  eval('(' + json + ')');
                if(typeof config['extension.databases'] === "undefined"){
                    return;
                }
                var databases = config['extension.databases'];
                for(let index in databases){

                    menager.connectPromise(databases[index].type, databases[index].host, databases[index].user, databases[index].password, databases[index].database).then((server) => {
                        server.name = databases[index].name;
                        menager.showStatus();
                    }).catch(function(err){
                        vscode.window.showErrorMessage(err);
                        console.log(err);
                    });
                }
            });

        }
    }

    addCommand(context, 'extension.queryBuild', buildQuery);

    addCommand(context, 'extension.runQueryBuild', runBuildQuery);

    addCommand(context, 'extension.saveConfig', function () {
        if(menager.currentServer === null){
            vscode.window.showInformationMessage("You are currently not connected to the server");
            return;
        }
        var root = vscode.workspace.rootPath;
        if(typeof root === 'undefined'){
            vscode.window.showInformationMessage("Open folder before saving configurations");
            return;
        }
        var existsDIR = fs.existsSync(root + '/.vscode/');
        if(existsDIR === false){
            fs.mkdirSync(root + '/.vscode/');
        }
        var exists = fs.existsSync(root + '/.vscode/database.json');
        if(exists === false){

            fs.writeFileSync(root + '/.vscode/database.json', "{}");
        }

        fs.readFile(root + '/.vscode/database.json', function(err, data) {
            if (err) {
                vscode.window.showErrorMessage('Failed read file /.vscode/database.json');
                return;
            }

            var json = data.toString('ascii');
            var config =  eval('(' + json + ')');
            
            if(typeof config['extension.databases'] === "undefined"){
                config['extension.databases'] = [];
            }
            config['extension.databases'].push({
                type:menager.currentServer.type,
                name:menager.currentServer.name,
                host:menager.currentServer.host + ":" + menager.currentServer.port,
                user:menager.currentServer.user,
                password:menager.currentServer.password,
                database:menager.currentDatabase
            }); 
            var jsonStr = JSON.stringify(config, null, "\t");
            
            fs.writeFile(root + '/.vscode/database.json', jsonStr, function(err) {
                if (err) {
                    vscode.window.showErrorMessage('Failed save file /.vscode/database.json');
                    return;
                }
                vscode.window.showInformationMessage("Saved configurations");
            });
            
        });
        
	});
    

    function changeDB() {

        menager.getDatabase().then((databaseList) => {
            vscode.window.showQuickPick(databaseList ,{matchOnDescription:false, placeHolder:"Choice database"}).then(function(object){
                if(typeof object !== 'undefined'){
                    menager.changeDatabase(object);
                }
            });
        })

	}

    addCommand(context, 'extension.changeDB', changeDB);
    
    addCommand(context, 'extension.changeServer', function () {
        var allServerName = [];
        for (var i = 0; i < menager.server.length; i++) {
            allServerName.push({
                label:i + ") " + menager.server[i].name,
                description:menager.server[i].host + " " + menager.server[i].user + " " + ("*".repeat(menager.server[i].password.length))
            });
        }
        vscode.window.showQuickPick(allServerName,{matchOnDescription:false, placeHolder:"Choice connected server"}).then(
            function(object){
                if(typeof object !== 'undefined'){
                    var stop = object.label.indexOf(")");
                    var index = object.label.substring(0, stop);

                    menager.changeServer(menager.server[index]);
                }
            }
            
        );

        
	});
    
    addCommand(context, 'extension.connectMySQL', function () {
        getDataToConnect().then((data) => {
            if (data === undefined) {
                return;
            }
            menager.connectPromise('mysql', data.host, data.user, data.password).then(() => {
                changeDB();
            }).catch((err) => {
                vscode.window.showErrorMessage(err);
            });
        });
    });

    addCommand(context, 'extension.connectPostgreSQL', function () {
        getDataToConnect().then((data) => {
            vscode.window.showInputBox({ value: "postgres", prompt: "e.g database", placeHolder: "Database", password: false }).then(function (databaseName) {
                if (typeof databaseName === 'undefined') {
                    return;
                }
                menager.connectPromise('postgres', data.host, data.user, data.password, databaseName).catch((err) => {
                    vscode.window.showErrorMessage(err);
                });
            });
        });
    });
    addCommand(context,'extension.querySQL', function () {

        vscode.window.showInputBox({value:"", prompt: "e.g SELECT * FROM table", placeHolder: "Query", password: false}).then(function(output){
            

            if(typeof output === 'undefined'){
                return;
            }
            menager.query(output, function(data){
                menager.queryOutput(data);
            });

        });

	});

}
exports.activate = activate;

function addCommand(context, name, func){
    context.subscriptions.push(vscode.commands.registerCommand(name, func));
}

// this method is called when your extension is deactivated
function deactivate() {
}
exports.deactivate = deactivate;