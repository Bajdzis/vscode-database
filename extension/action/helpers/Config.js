var vscode = require('vscode');
var fs = require('fs');

module.exports = class Config{

    constructor(){
        this.databaseConfig = vscode.workspace.getConfiguration('database');
    }

    getDatabases(){
        const connections = this.databaseConfig.get('connections');
        return Promise.resolve(connections);
    }

    pushDatabase(newDatabaseConfig){
        this.getDatabases().then((connections) =>{
            connections.push(newDatabaseConfig);
            this.databaseConfig.update('connections',connections);
        })
        
    }

};