var AbstractAction = require('./AbstractAction.js');
var { showWebview } = require('../webViews/webViewsRunner');
var {allServerType} = require('../factoryServer');

const dataForm = Object.keys(allServerType).map(key => ({
    type: key,
    name: allServerType[key].prototype.typeName,
    fields: allServerType[key].prototype.fieldsToConnect
}));

module.exports = class connectMySQL extends AbstractAction{

    execution(){
        showWebview('connect', 'Connect to SQL server').then((panel) => {

            panel.webview.postMessage({ 
                type: 'SHOW_FORM', 
                payload : dataForm
            });

            panel.webview.onDidReceiveMessage((action) => {
                if (action.type === 'CONNECT_TO_SQL_SERVER') {
                    this.connectFactory(action.payload.type, action.payload.fieldValue)
                        .then(() => {
                            panel.dispose();
                        })
                        .catch((error) => {
                            panel.webview.postMessage({ 
                                type: 'CONNECTION_ERROR', 
                                payload : { error } 
                            });
                        });
                }
            });
        });
    }
	
    connectFactory(type, fields){
        if (allServerType[type]) {
            return this.sqlMenager.connectPromise(type, fields);
        }

        return Promise.reject(`Unknow type ${type}`);
    }
	

};
