var vscode = require('vscode')
var getDataToConnect = require('./helpers/getDataToConnect.js')
var AbstractAction = require('./AbstractAction.js')

module.exports = class connectMySQL extends AbstractAction{

	execution(){
		vscode.window.showQuickPick([
			{label:"mysql"},
			{label:"postgres"}
		], {
            matchOnDescription:false,
            placeHolder:"Choice type"
		}).then((data) => {
			if(data === undefined){
				return;
			}
			this.connectFactory(data.label);

		} );
	}
	
	connectFactory(type){
		if(type == 'postgres'){
			this.connectToPostgres();
		}

		if(type == 'mysql'){
			this.connectToMySQL();
		}
	}
	
	connectToMySQL() {
		var _this = this;
		getDataToConnect().then((data) => {
			if (data === undefined) {
				return;
			}
			_this.sqlMenager.connectPromise('mysql', data.host, data.user, data.password).then(() => {
				vscode.commands.executeCommand('extension.changeDB');
			}).catch((err) => {
				vscode.window.showErrorMessage(err);
			});
		});
	}


    connectToPostgres() {
        getDataToConnect().then((data) => {
            vscode.window.showInputBox({ value: "postgres", prompt: "e.g database", placeHolder: "Database", password: false }).then((databaseName) => {
                if (typeof databaseName === 'undefined') {
                    return;
                }
                this.sqlMenager.connectPromise('postgres', data.host, data.user, data.password, databaseName).catch((err) => {
                    vscode.window.showErrorMessage(err);
                });
            });
        });
    };

}
