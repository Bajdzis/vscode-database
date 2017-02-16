var vscode = require('vscode')
var getDataToConnect = require('./helpers/getDataToConnect.js')
var AbstractAction = require('./AbstractAction.js')

module.exports = class connectMySQL extends AbstractAction{

	execution() {
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

}
