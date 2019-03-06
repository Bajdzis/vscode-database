const vscode = require('vscode');

class AbstractServer
{
    constructor() {
        this.connection = null;
        this.currentDatabase = null;
        this.OutputChannel = null;
    }

    /**
     * @return {string} - name server
     */
    getName() {
        if (this.name) {
            return this.name;
        }
        return  `${this.username}@${this.host} (${this.typeName})`;
    }

    /**
     * @param {OutputChannel} OutputChannel - VS Code Output Channel
     */
    setOutput(OutputChannel){
        this.OutputChannel = OutputChannel;
    }
    
    /**
     * @param {string} msg - text message to show
     */
    outputMsg (msg){
        if(this.OutputChannel !== null){
            this.OutputChannel.appendLine(msg);
        }
    }
   
    /**
     * @return {Promise<object>} - object with some data to save
     */
    getDataToRestore(){

        return vscode.window.showQuickPick([
            {label:'Yes'},	
            {label:'No'}		
        ], {	
            matchOnDescription:false,
            placeHolder:'Save password in setting? (plain text)'					
        }).then(output => {
            const data = {
                type:this.type,
                name:this.getName(),
                host:this.host + ':' + this.port,
                username:this.username,
                database:this.currentDatabase,
            };

            if (output.label === 'Yes') {
                data.password = this.password;
            }

            return data;
        });

    } 
   
    /**
     * @param {object} fields - result getDataToRestore() function
     * @return {Promise}
     */
    restoreConnection(fields){
        if (!fields.username) {
            fields.username = fields.user;
        }
        if (fields.password === undefined) {
            return vscode.window.showInputBox({ value: '', prompt: fields.name, placeHolder: 'Password', password: true })
                .then((password) => {
                    fields.password = password;
                    return this.connectPromise(fields);
                });
        }

        return this.connectPromise(fields);
    } 

    /**
     * @param {object} fields - object with fields from *.prototype.fieldsToConnect
     * @return {Promise}
     */
    // eslint-disable-next-line no-unused-vars
    connectPromise(fields){
        return Promise.reject('No implement connectPromise');
    }

    /**
     * @param {string} sql - query
     * @return {Promise}
     */
    // eslint-disable-next-line no-unused-vars
    queryPromise(sql){
        return Promise.reject('No implement queryPromise');
    }

    /**
     * @param {string} sql - queries separate ;
     * @return {string[]}
     */
    splitQueries(sqlMulti) {
        return sqlMulti.split(';').filter((sql) => {
            if (!sql) {
                return false;
            }
            const notEmpty = (sql.trim().replace(/(\r\n|\n|\r)/gm, '') !== '');
            return notEmpty ? true : false;
        });
    }

    /**
     * @param {object} currentStructure - save new structure to this params
     */
    // eslint-disable-next-line no-unused-vars
    refrestStructureDataBase (currentStructure) { }

    /**
     * @return {Promise<string[], Error|string>}
     */
    getDatabase(){
        return Promise.resolve([]);
    }

    /**
     * @param {string} tableName
     * @return {string} a quoted identifier table name
     */
    getIdentifiedTableName(tableName){
        return tableName;
    }

    /**
     * @param {string} tableName
     * @return {string} a SQL SELECT statement
     */
    getSelectTableSql(tableName){
        return `SELECT * FROM ${this.getIdentifiedTableName(tableName)}`;
    }
}

AbstractServer.prototype.typeName = 'Unknow';

AbstractServer.prototype.fieldsToConnect = [];

module.exports = AbstractServer;
