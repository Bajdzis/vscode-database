import { AbstractAction } from './AbstractAction';
import { showWebview } from '../webViews/webViewsRunner';
import {allServerType, ServerTypeName} from '../factoryServer';
import { AnyObject } from '../../typeing/common';

interface DataForm {
    type: string;
    name?: string;
    fields: any[];
}

export class ConnectToSQLServer extends AbstractAction{

    private dataFormCache: null | DataForm[] = null;

    async getDataForm() {
        if (this.dataFormCache !== null) {
            return this.dataFormCache;
        }
        // TODO move fieldsToConnect to other file without lazy loading
        const loadAllType = Object.keys(allServerType).map(async (key) => {

            const serverModule = await allServerType[key]();
            return {
                type: key,
                name: serverModule.default.prototype.typeName,
                fields: serverModule.default.prototype.fieldsToConnect
            };
        });

        const dataForm = await Promise.all(loadAllType);
        this.dataFormCache = dataForm;
        return dataForm;
    }

    execution(){
        showWebview('connect', 'Connect to SQL server').then((panel) => {
            this.getDataForm().then((dataForm) => {
                panel.webview.postMessage({ 
                    type: 'SHOW_FORM', 
                    payload : dataForm
                });
            });

            panel.webview.onDidReceiveMessage((action) => {
                if (action.type === 'CONNECT_TO_SQL_SERVER') {
                    this.connectFactory(action.payload.type, action.payload.fieldValue)
                        .then(() => {
                            panel.dispose();
                        })
                        .catch((error) => {
                            console.log({ error });
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
