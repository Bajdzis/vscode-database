
var vscode = require('vscode');
var fs = require('fs');
var strip = require('strip-comments');
var Menager = require('./extension/Menager.js');
var menager = new Menager();

function activate(context) {
    
    var root = vscode.workspace.rootPath;
    if(typeof root !== 'undefined'){
        var exists = fs.existsSync(root + '/.vscode/database.json');
        if(exists !== false){
            fs.readFile(root + '/.vscode/database.json', function(err, data) {
                if (err) {
                    vscode.window.showErrorMessage('Failed read file /.vscode/database.json');
                    return;
                }

                var json = strip(data.toString('ascii'));
                var config =  JSON.parse(json);
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
            //menager.connect('mysql', 'localhost', 'root', '');
            //menager.connect('mysql', '127.0.0.1', 'root', '');

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

            var json = strip(data.toString('ascii'));
            var config =  JSON.parse(json);
            
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
    
    addCommand(context, 'extension.changeDB', function () {

        menager.query('SHOW DATABASES', function(results){
            var allDatabase = [];
            
            for (var i = 0; i < results.length; i++) {
                allDatabase.push(results[i].Database);
            }
            vscode.window.showQuickPick(allDatabase,{matchOnDescription:false, placeHolder:"Choice database"}).then(
                function(object){

                    if(typeof object !== 'undefined'){
                        menager.changeDatabase(object);
                    }
                }
                
            );

        });

        
	});
    
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
    
    addCommand(context,'extension.connectMySQL', function () {
        var host, user, password;
        vscode.window.showInputBox({value:"localhost", prompt: "e.g 127.0.0.1", placeHolder: "Host", password: false}).then(function(output){
            
            host = output;
        
            if(typeof host === 'undefined'){
                return;
            }
            vscode.window.showInputBox({value:"root", prompt: "e.g root", placeHolder: "Username", password: false}).then(function(output){
                
                user = output;
                if(typeof user === 'undefined'){
                    return;
                }
                vscode.window.showInputBox({value:"", prompt: "", placeHolder: "Password", password: true}).then(function(output){
                    
                    password = output;
                    menager.connect('mysql', host, user, password, null);
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