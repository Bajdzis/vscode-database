var vscode = require('vscode');
var fs = require('fs');

module.exports = class Config{

    constructor(){
        this.rootPath = vscode.workspace.rootPath;
    }

    getDatabases(){
        return new Promise((resolve, reject) => {
            
            if(typeof this.rootPath === 'undefined'){
                vscode.window.showInformationMessage("Open folder before change configurations");
                reject();
                return;
            }
            var existsDIR = fs.existsSync(this.rootPath + '/.vscode/');
            if(existsDIR === false){
                fs.mkdirSync(this.rootPath + '/.vscode/');
            }
            var exists = fs.existsSync(this.rootPath + '/.vscode/database.json');
            if(exists === false){

                fs.writeFileSync(this.rootPath + '/.vscode/database.json', "{}");
            }

            fs.readFile(this.rootPath + '/.vscode/database.json', (err, data) => {
                if (err) {
                    vscode.window.showErrorMessage('Failed read file /.vscode/database.json');
                    reject();
                    return;
                }

                var json = data.toString('ascii');
                var config =  eval('(' + json + ')');
                
                if(typeof config['extension.databases'] === "undefined"){
                    config['extension.databases'] = [];
                }
                resolve(config);
            });
        });
    }


    pushDatabase(newDatabaseConfig){
        this.getDatabases().then((config) =>{
            config['extension.databases'].push(newDatabaseConfig);
            this.saveConfig(config);
        })
        
    }

    saveConfig(config){
        var jsonStr = JSON.stringify(config, null, "\t");
        var configPath = this.rootPath + '/.vscode/database.json';
            
        fs.writeFile(configPath, jsonStr, (err) => {
            if (err) {
                vscode.window.showErrorMessage('Failed save file /.vscode/database.json');
                return;
            }
            vscode.window.showInformationMessage(`Saved configurations in "${configPath}"`);
        });
    }
};