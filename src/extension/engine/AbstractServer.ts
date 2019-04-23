import * as vscode from 'vscode';
import { AnyObject } from '../../typeing/common';


export class AbstractServer
{
    currentDatabase: string | null;
    OutputChannel: vscode.OutputChannel | null;

    name?: string;
    type?: string;

    username?: string;
    password?: string;
    host?: string;
    port?: string;
    typeName?: string;
    fieldsToConnect: AnyObject[];

    constructor() {
        this.type = this.typeName;
        this.fieldsToConnect = [];
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
    setOutput(OutputChannel: vscode.OutputChannel | null){
        this.OutputChannel = OutputChannel;
    }
    
    /**
     * @param {string} msg - text message to show
     */
    outputMsg (msg: string){
        if(this.OutputChannel !== null){
            this.OutputChannel.appendLine(msg);
        }
    }
   
    /**
     * @return {Promise<object>} - object with some data to save
     */
    getDataToRestore(){

        return vscode.window.showQuickPick<vscode.QuickPickItem>([
            {label:'Yes'},	
            {label:'No'}		
        ], {	
            matchOnDescription:false,
            placeHolder:'Save password in setting? (plain text)'					
        }).then((output) => {
            const data: AnyObject = {
                type:this.type,
                name:this.getName(),
                host:this.host + ':' + this.port,
                username:this.username,
                database:this.currentDatabase,
            };

            if (output && output.label === 'Yes') {
                data.password = this.password;
            }

            return data;
        });

    } 
   
    /**
     * @param {object} fields - result getDataToRestore() function
     * @return {Promise}
     */
    restoreConnection(fields: AnyObject): Promise<undefined>{
        if (!fields.username) {
            fields.username = fields.user;
        }
        if (fields.password === undefined) {
            return new Promise((resolve) => {
                vscode.window.showInputBox({ value: '', prompt: fields.name, placeHolder: 'Password', password: true })
                    .then((password) => {
                        fields.password = password;
                        this.connectPromise(fields).then(resolve);
                    });
            });
            
            
        }

        return this.connectPromise(fields);
    } 

    /**
     * @param {object} fields - object with fields from *.prototype.fieldsToConnect
     * @return {Promise}
     */
    // eslint-disable-next-line no-unused-vars
    connectPromise(fields: AnyObject): Promise<undefined>{
        return Promise.reject('No implement connectPromise');
    }

    /**
     * @param {string} sql - query
     * @return {Promise}
     */
    // eslint-disable-next-line no-unused-vars
    queryPromise(sql: string, params?: any): Promise<{}>{
        return Promise.reject('No implement queryPromise');
    }

    // eslint-disable-next-line no-unused-vars
    changeDatabase(name: string): Promise<{}>{
        return Promise.reject('No implement changeDatabase');
    }

    /**
     * @param {string} sql - queries separate ;
     * @return {string[]}
     */
    splitQueries(sqlMulti: string) {
        const quotes=/^((?:[^"`']*?(?:(?:"(?:[^"]|\\")*?(?<!\\)")|(?:'(?:[^']|\\')*?(?<!\\)')|(?:`(?:[^`]|\\`)*?(?<!\\)`)))*?[^"`']*?)/;
        let queries=[],match:any=[],delimiter=';';
        let splitRegex=new RegExp(quotes.source+delimiter);
        while((match=sqlMulti.match(splitRegex))!==null){
            queries.push(match[1]);     //push the split query into the queries array
            sqlMulti=sqlMulti.slice(match[1].length+delimiter.length);  //remove split query from sql string
        }
        queries.push(sqlMulti);     //push last query which could have no delimiter
        //remove empty queries
        return queries.filter((sql) => {
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
    refrestStructureDataBase (currentStructure?: AnyObject): Promise<{}> {
        return Promise.resolve({});
    }

    /**
     * @return {Promise<string[], Error|string>}
     */
    getDatabase(): Promise<string[]>{
        return Promise.resolve([]);
    }

    /**
     * @param {string} tableName
     * @return {string} a quoted identifier table name
     */
    getIdentifiedTableName(tableName: string): string {
        return tableName;
    }

    /**
     * @param {string} tableName
     * @return {string} a SQL SELECT statement
     */
    getSelectTableSql(tableName: string, limit: number = 50): string {
        return `SELECT * FROM ${this.getIdentifiedTableName(tableName)} LIMIT ${limit}`;
    }

}

AbstractServer.prototype.typeName= 'Unknow';

AbstractServer.prototype.fieldsToConnect = [];
