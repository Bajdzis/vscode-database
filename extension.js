
var vscode = require('vscode');
var mysql = require('mysql');
var Menager = require('./extension/Menager.js');

function quickExample(){
    qpitem = [
    {
        'label' : "$(database) etykieta jeden",
        'description' : "to jest test etykiety jeden"
    },
    {
        'label' : "etykieta dwa",
        "description" : "$(dashboard) to jest test etykiety dwa"
    }];

    vscode.window.showQuickPick(qpitem,{matchOnDescription:true, placeHolder:"wpisz tu cos"});
}
function inputBox(){
    var cos2 = vscode.window.showInputBox({
    	value:"wartosc",
		prompt: "cos",
		placeHolder: "placeholder",
		password: true
    });
}

/*
function sql(server, sql){
    var result = {};
    server.query(sql, (function(err, results) {
        if (err) {
            vscode.window.showErrorMessage('Error connecting: ' + err.stack);
            return;
        }
        result = results;
    })(result));
    console.log(result);
    return result;
}
*/
var menager = new Menager();
function activate(context) {

    //menager.connect('mysql', 'localhost', 'root', '');

	console.log('Congratulations, your extension "DATABASE" is now active!');

    addCommand(context, 'extension.changeDB', function () {

        menager.query('SHOW DATABASES', function(results){
            var allDatabase = [];
            
            for (var i = 0; i < results.length; i++) {
                allDatabase.push(results[i].Database);
            }
            vscode.window.showQuickPick(allDatabase,{matchOnDescription:false, placeHolder:"Choice database"}).then(
                function(object){
                    console.log(typeof object);
                    if(typeof object !== 'undefined'){
                        menager.changeDatabase(object);
                    }
                }
                
            );

        });

        
	});
    /*
    addCommand(context, 'extension.changeServer', function () {
        var allServerName = [];
        for (var i = 0; i < menager.server.length; i++) {
            allServerName.push(menager.server[i].Database);
        }
        vscode.window.showQuickPick(allServerName,{matchOnDescription:false, placeHolder:"Choice database"}).then(
            function(object){
                console.log(typeof object);
                if(typeof object !== 'undefined'){
                    menager.changeServer(object);
                }
            }
            
        );

        
	});
    */
    addCommand(context,'extension.connectSQL', function () {
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
                    menager.connect('mysql', host, user, password);
                });

            });

        });

        
        
		//vscode.window.showInformationMessage('Połączono');
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

        
        
		//vscode.window.showInformationMessage('Połączono');
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