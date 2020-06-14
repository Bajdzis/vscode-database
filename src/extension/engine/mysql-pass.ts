import * as vscode from 'vscode';
import { AbstractServer } from './AbstractServer';
import { createConnection, Connection, ConnectionConfig } from 'mysql';
import { AnyObject } from '../../typeing/common';

export class MySQLType extends AbstractServer
{
    protected connection?: Connection;
    public socket: string;

    constructor() {
        super();
        this.type = 'mysql';
        this.host = 'Empty';
        this.port = '3306';
        this.username = 'Empty';
        this.password = 'Empty';
        this.socket = '';
    }
    
    /**
     * @param {object} fields
     * @return {Promise}
     */
    connectPromise({host, username, password, socket}: AnyObject): Promise<undefined> {
        const [hostName, port = '3306'] = host.split(':');
        this.host = hostName;
        this.port = port;
        this.username = username;
        this.password = password;
        const setting: ConnectionConfig = {
            'host': this.host,
            'port': parseInt(port, 10),
            'user': username,
            'password': password
        };
        if(socket){
            this.socket = hostName;
            setting.socketPath = this.host;
            delete setting.host;
            delete setting.port;
        }
        return new Promise((resolve, reject) => {
            this.connection = createConnection(setting);
            this.connection.connect((err: Error) => {
                if (err) {
                    reject(err.message);
                } else {
                    resolve();
                }
            });
        });
    }

    /**
     * @deprecated new implement is queryPromise
     * @param {string} sql
     * @param {function} func - callback
     */
    query (sql: string, func: any){
        this.queryPromise(sql).then(func).catch((errMsg: string) => {
            vscode.window.showErrorMessage(errMsg);
            this.outputMsg(errMsg);
        });
    }

    /**
     * @param {string} sql
     * @return {Promise}
     */
    queryPromise(sql: string): Promise<AnyObject[]>{
        return new Promise((resolve, reject) => {
            if (!this.connection) {
                reject('connection is undefined');
                return;
            }
            this.connection.query(sql, (err: Error, rows: AnyObject[]) => {
                if(err){
                    reject(err.message);
                    return;
                }
                resolve(rows);
            });
        });
    }

    /**
     * @return {Promise<string[], Error>}
     */
    getDatabase(): Promise<string[]>{
        return new Promise((resolve, reject) => {
            this.queryPromise('SHOW DATABASES').then((results: AnyObject[]) => {
                const allDatabase: string[] = [];
                for (let i = 0; i < results.length; i++) {
                    allDatabase.push(results[i].Database as string);
                }
                resolve(allDatabase);
            }).catch(reject);
        });
    }

    /**
     * @param {string} name - name Database
     * @return {Promise}
     */
    changeDatabase (name: string): Promise<{}>{
        return new Promise((resolve, reject) => {
            this.queryPromise('USE `' + name + '`').then(() => {
                this.currentDatabase = name;
                resolve();
            }).catch((err) => {
                this.currentDatabase = null;
                reject(err);
            });
        });
    }

    /**
     * @param {string} sql - queries
     * @return {string[]}
     */
    splitQueries(sqlMulti: string) {
        const quotes=/^((?:[^"`']*?(?:(?:"(?:[^"]|\\")*?(?<!\\)")|(?:'(?:[^']|\\')*?(?<!\\)')|(?:`(?:[^`]|\\`)*?(?<!\\)`)))*?[^"`']*?)/;
        const delimiterRegex=/^(?:\r\n|[ \t\r\n])*DELIMITER[\t ]*(.*?)(?:\r\n|\n|\r|$)/i;
        let match: any = [];
        const queries = [];
        let delimiter = ';';
        let splitRegex=new RegExp(quotes.source+delimiter);
        while(match!==null){
            const delimiterCommand=sqlMulti.match(delimiterRegex);
            if(delimiterCommand!==null){    //if to change delimiter
                delimiter=delimiterCommand[1].replace(/[.*+?^${}()|[\]\\]/g, '\\$&');  //change delimiter
                splitRegex=new RegExp(quotes.source+delimiter);
                sqlMulti=sqlMulti.slice(delimiterCommand[0].length); //remove delimiter from sql string
            }else{
                match=sqlMulti.match(splitRegex);   //split sql string
                if(match!==null){
                    queries.push(match[1]);     //push the split query into the queries array
                    sqlMulti=sqlMulti.slice(match[1].length+delimiter.length);  //remove split query from sql string
                }
            }
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
     * @param {string} sql - a SQL string
     * @return {string} - the SQL string without comments
     */
    removeComments(sql: string) {
        const quotes=/^((?:[^"`']*?(?:(?:"(?:[^"]|\\")*?(?<!\\)")|(?:'(?:[^']|\\')*?(?<!\\)')|(?:`(?:[^`]|\\`)*?(?<!\\)`)))*?[^"`']*?)/;
        const cStyleComments=new RegExp(quotes.source+'/\\*.*?\\*/');
        const doubleDashComments=new RegExp(quotes.source+'--(?:(?:[ \t]+.*(\r\n|\n|\r)?)|(\r\n|\n|\r)|$)');
        const hashComments=new RegExp(quotes.source+'#.*(\r\n|\n|\r)?');
        while(sql.match(cStyleComments)) sql=sql.replace(cStyleComments,'$1');
        while(sql.match(doubleDashComments)) sql=sql.replace(doubleDashComments,'$1$2$3');
        while(sql.match(hashComments)) sql=sql.replace(hashComments,'$1$2');
        return sql;
    }

    /**
     * @return {Promise}
     */
    refrestStructureDataBase (): Promise<{}>{
        const currentStructure: any = {};
        const tablePromise: Promise<{}>[] = [];
        return new Promise((resolve, reject) => {
            this.queryPromise('SHOW tables').then(results => {
                for (let i = 0; i < results.length; i++) {
                    const key = Object.keys(results[i])[0];
                    const tableName = results[i][key];
                    const promise = new Promise((resolve, reject) => {
                        this.queryPromise('SHOW COLUMNS FROM ' + tableName).then((column) => {
                            resolve({
                                column : column,
                                tableName : tableName
                            });
                        }).catch(reject);
                    }) as Promise<{}>;
                    tablePromise.push(promise);
                }
                Promise.all(tablePromise).then((data: AnyObject[]) => {
                    for (let i = 0; i < data.length; i++) {
                        const columnStructure = data[i].column;
                        const tableName = data[i].tableName;
                        currentStructure[tableName] = columnStructure;
                    }
                    resolve(currentStructure);
                }).catch(reject);
            }).catch(reject);
        });
    }

    /**
     * @param {string} tableName
     * @return {string} a quoted identifier table name
     */
    getIdentifiedTableName(tableName: string){
        return `\`${tableName}\``;
    }

    /**
     * @param {string} tableName
     * @return {string} a SQL SELECT statement
     */
    getSelectTableSql(tableName: string): string{
        return `SELECT * FROM ${this.getIdentifiedTableName(tableName)}`;
    }

}

MySQLType.prototype.typeName = 'MySql';

MySQLType.prototype.fieldsToConnect = [
    {
        type: 'text',
        defaultValue: 'localhost',
        name: 'host',
        title: 'Host',
        info: '(e.g host, 127.0.0.1, with port 127.0.0.1:3333)'
    },
    {
        type: 'checkbox',
        defaultValue: false,
        name: 'socket',
        title: 'via socket',
        info: '(if you want to connect via socket, enter socketPath in the host field)'
    },
    {
        type: 'text',
        defaultValue: 'root',
        name: 'username',
        title: 'Username',
        info: '(e.g root/user)'
    },
    {
        type: 'password',
        name: 'password',
        defaultValue: '',
        title: 'Password',
        info: ''
    }
];
