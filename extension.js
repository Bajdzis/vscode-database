
var vscode = require('vscode');

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
function output(){
    var out = vscode.window.createOutputChannel("database");
    out.appendLine("test");
    out.show(3);
}
function bar(){
    var _statusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left);
    _statusBarItem.text =  '$(pencil) Text';
    _statusBarItem.show();
}
function addCommand(context, name, func){
    context.subscriptions.push(vscode.commands.registerCommand(name, func));
}
function activate(context) {

	console.log('Congratulations, your extension "DATABASE" is now active!');
    //quickExample();
    //inputBox();
    //output();
    //bar();
    addCommand(context,'extension.changeDB', function () {
		vscode.window.showInformationMessage('Zmieniono baze danych');
	});

    addCommand(context,'extension.connectSQL', function () {
		vscode.window.showInformationMessage('Połączono');
	});

}
exports.activate = activate;

// this method is called when your extension is deactivated
function deactivate() {
}
exports.deactivate = deactivate;