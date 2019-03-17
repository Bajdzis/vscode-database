import { AbstractAction } from './AbstractAction';
import { showWebview } from '../webViews/webViewsRunner';
import {allServerType, ServerTypeName} from '../factoryServer';
import { AnyObject } from '../../typeing/common';

const dataForm = Object.keys(allServerType).map(key => ({
    type: key,
    name: allServerType[key].prototype.typeName,
    fields: allServerType[key].prototype.fieldsToConnect
}));
export class ConnectToSQLServer extends AbstractAction{

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
	
    connectFactory(type: ServerTypeName, fields: AnyObject){
        if (allServerType[type]) {
            return this.sqlMenager.connectPromise(type, fields);
        }

        return Promise.reject(`Unknow type ${type}`);
    }
	

}
