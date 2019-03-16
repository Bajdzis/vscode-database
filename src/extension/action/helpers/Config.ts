import * as vscode from 'vscode';
import { AnyObject } from '../../../typeing/common';

class Config{
    databaseConfig: any;

    constructor(){
        this.databaseConfig = vscode.workspace.getConfiguration('database');
    }

    getDatabases(){
        const connections = this.databaseConfig.get('connections');
        return Promise.resolve(connections);
    }

    pushDatabase(newDatabaseConfig: AnyObject){
        this.getDatabases().then((connections) =>{
            connections.push(newDatabaseConfig);
            this.databaseConfig.update('connections',connections);
        });
        
    }

}

const config = new Config();

export default config;
