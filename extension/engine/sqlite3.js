var sqlite3 = require('sqlite3').verbose();
var vscode = require('vscode');
var AbstractServer = require('./AbstractServer.js');

const SELECT_TABLES = "SELECT name FROM sqlite_master WHERE type='table'"
const SELECT_COLUMNS = "SELECT sql FROM sqlite_master WHERE type='table' and tbl_name = "
const rootPath = vscode.workspace.rootPath;

module.exports = class Sqlite3Type extends AbstractServer {
    constructor() {
        super();
        this.type = "sqlite3";
        this.host = "Empty";
        this.port = "3306";
        this.user = "Empty";
        this.password = "Empty";
        this.onConnectSetDB = null;
    }


    /**
     * @param {string} host
     * @param {string} user
     * @param {string} password
     * @param {string|undefined} database
     * @return {Promise}
     */
    connectPromise(host, user, password, database) {
        this.name = host + " (sqlite3)";
        var _this = this;
        var hostAndPort = host.split(":");
        // this.host = hostAndPort[0];
        // this.port = hostAndPort[1] || "3306";
        var host = hostAndPort[0];
        // this.user = user;
        // this.password = password;
        // this.connection = new sqlite3.Database(this.host);
        return new Promise((resolve, reject) => {
            this.connection = new sqlite3.Database(rootPath + "/" + host, ((err) => {
                if (err) {
                    reject('Sqlite3 Error: ' + err);
                } else {
                    _this.currentDatabase = host;
                    resolve();
                }

            }))
        });
    };

    /**
     * @deprecated new implement is queryPromise
     * @param {string} sql
     * @param {function} func - callback
     */
    query(sql, func) {
        this.queryPromise(sql).then(func).catch(function (errMsg) {
            vscode.window.showErrorMessage(errMsg);
            this.outputMsg(errMsg);
        })
    };

    /**
     * @param {string} sql
     * @return {Promise}
     */
    queryPromise(sql) {
        return new Promise((resolve, reject) => {
            this.connection.all(sql, (err, rows) => {
                if (err) {
                    reject('Sqlite3 Error: ' + err);
                    return;
                }
                resolve(rows);
            });
        });
    }

    /**
     * @return {Promise<string[], Error>}
     */
    getDatabase() {
        return new Promise((resolve, reject) => {
            if(this.connection.filename != undefined) {
                resolve(this.connection);
            } else {
                reject("No database file selected");
            }
        });
    }

    /**
     * @param {string} name - name Database
     * @return {Promise}
     */
    changeDatabase(name) {
        this.connectPromise(name, null);
    };

    /**
     * @return {Promise}
     */
    refrestStructureDataBase() {
        var currentStructure = {};
        var tablePromise = [];
        return new Promise((resolve, reject) => {
            this.queryPromise(SELECT_TABLES).then(results => {
                for (let i = 0; i < results.length; i++) {
                    let key = Object.keys(results[i])[0];
                    let tableName = results[i][key];
                    let promise = new Promise((resolve, reject) => {
                        this.queryPromise(SELECT_COLUMNS + "'" + tableName + "'").then((result) => {
                            var columns = [];
                            //use always index 0 because even though it will return only one result, it'll always be an array
                            var sql = result[0].sql;
                            var init = sql.indexOf('(');
                            var fin = sql.indexOf(')') - 1;
                            var sqlColumns = sql.substr(init + 1, fin - init).split(",");
                            for (var i = 0; i < sqlColumns.length; i++) {
                                var fieldAndType = sqlColumns[i].split(" ");
                                var element = {
                                    "Field": fieldAndType[0], //first element is the field
                                    "Type": fieldAndType[1] //second element is the type of the field
                                };
                                columns.push(element);
                            }
                            resolve({
                                column: columns,
                                tableName: tableName
                            });
                        }).catch(reject);
                    });
                    tablePromise.push(promise);
                }
                Promise.all(tablePromise).then(data => {
                    for (var i = 0; i < data.length; i++) {
                        var columnStructure = data[i].column;
                        var tableName = data[i].tableName;
                        currentStructure[tableName] = columnStructure;
                    }
                    resolve(currentStructure);
                }).catch(reject);
            }).catch(reject);
        });
    }

}