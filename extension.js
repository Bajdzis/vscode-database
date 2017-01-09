
var vscode = require('vscode');
var fs = require('fs');
var Menager = require('./extension/Menager.js');
var menager = new Menager();
var buildQueryFirstRun = true;
function buildQuery() {

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
    var textDocumentTemp = null;

    if(fs.existsSync(pathTempFile) === false){
        fs.writeFileSync(pathTempFile, "");
    }

    vscode.workspace.openTextDocument(vscode.Uri.file(pathTempFile)).then(function(document){
        textDocumentTemp = document;
        vscode.window.showTextDocument(document, vscode.ViewColumn.One, false);
    });

    if(buildQueryFirstRun === false){
        return;
    }
    buildQueryFirstRun = false;

    const confFiles = vscode.workspace.getConfiguration("files");
    const autoSave = confFiles.get("autoSave", "off");
    if (autoSave === "off") {
        vscode.workspace.onDidSaveTextDocument( function (document) {
            if(textDocumentTemp === document){
                execQuery(document.getText());
            }
        }, this);
    }
}

function runBuildQuery() {
    const pathTempFile = vscode.workspace.rootPath + '/.vscode/temp.sql';
    let textDocumentTemp = null;

    if(fs.existsSync(pathTempFile) === false){
        return buildQuery();
    }

    vscode.workspace.openTextDocument(vscode.Uri.file(pathTempFile)).then(function(document){
        textDocumentTemp = document;
        vscode.window.showTextDocument(document, vscode.ViewColumn.One, false);
    });

    execQuery(textDocumentTemp.getText());
}

function execQuery(query) {
    if (!query) {
        return;
    }

    query.split(";").forEach(sql => {
        if (sql) {
            const notEmpty = (sql.trim().replace(/(\r\n|\n|\r)/gm, "") !== "");
            if (notEmpty) {
                menager.query(sql, function(data){
                    menager.queryOutput(data);
                });
            }
        }
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
                for(var index in databases){
                    var database = null;
                    if(typeof databases[index].database !== "undefined"){
                        database = databases[index].database;
                    }
                    var server = menager.connect(databases[index].type, databases[index].host, databases[index].user, databases[index].password, database);
                    server.name = databases[index].name;
                    menager.showStatus();
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
        menager.query(menager.getShowDatabaseSql(), function(results){
            var allDatabase = [];
            
            for (var i = 0; i < results.length; i++) {
                allDatabase.push(results[i].Database);
            }
            vscode.window.showQuickPick(allDatabase,{matchOnDescription:false, placeHolder:"Choice database"}).then(function(object){
                if(typeof object !== 'undefined'){
                    menager.changeDatabase(object);
                }
            });

        });
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
                vscode.window.showErrorMessage('MySQL Error: ' + err.stack);
            });
        });
    });

    addCommand(context, 'extension.connectPostgreSQL', function () {
        var onConnectSetDB;
        getDataToConnect().then((data) => {
            vscode.window.showInputBox({ value: "postgres", prompt: "e.g database", placeHolder: "Database", password: false }).then(function (output) {
                onConnectSetDB = output;
                if (typeof onConnectSetDB === 'undefined') {
                    return;
                }
                menager.connect('postgres', data.host, data.user, data.password, onConnectSetDB);
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