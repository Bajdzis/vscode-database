var pg = require('pg');
var vscode = require('vscode');
var AbstractServer = require('./AbstractServer.js');

const SELECT_DATABSE_SQL = 
`
SELECT datname AS "Database" 
FROM pg_database 
WHERE datistemplate = false;
`;

const SELECT_SCHEMA_SQL = 
`
SELECT
  schema_name AS "Database"
FROM information_schema.schemata
`;

const SELECT_TABLE_SQL = 
`
SELECT 
  table_name
FROM information_schema.tables
WHERE table_schema = $1::text
`;

const SELECT_COLUMNS_SQL = 
`
SELECT
  col.column_name                                                   AS "Field",
  CASE
  WHEN col.character_maximum_length IS NULL
    THEN col.udt_name
  ELSE col.udt_name || '(' || col.character_maximum_length || ')'
  END                                                               AS "Type",
  col.is_nullable                                                   AS "Null",
  CASE
  WHEN keycol.constraint_type IS NULL
    THEN ''
  ELSE keycol.constraint_type
  END                                                               AS "Key",
  CASE
  WHEN col.column_default IS NULL
    THEN ''
  ELSE col.column_default
  END                                                               AS "Default",
  col_description(to_regclass(col.table_name), col.ordinal_position) AS "Extra"
FROM
  information_schema.columns col
  -- Key
  LEFT JOIN (
              SELECT
                col.column_name,
                tc.constraint_type
              FROM information_schema.table_constraints tc
                INNER JOIN information_schema.constraint_column_usage ccu
                  ON tc.table_name = ccu.table_name
                     AND tc.constraint_name = ccu.constraint_name
                INNER JOIN information_schema.key_column_usage col
                  ON tc.table_catalog = col.table_catalog
                     AND tc.table_schema = col.table_schema
                     AND tc.table_name = col.table_name
                     AND ccu.column_name = col.column_name
              WHERE tc.table_name = $1::text
            ) AS keycol
    ON keycol.column_name = col.column_name
WHERE
  col.table_name = $2::text
ORDER BY
  col.table_name
  , col.ordinal_position
`;

class PostgreSQLType extends AbstractServer{

    constructor() {
        super();
        this.type = 'postgres';
        this.host = 'Empty';
        this.port = '5432';
        this.username = 'Empty';
        this.password = 'Empty';
        this.database = undefined;
        this.sslEnabled = false;
        this.schema = 'public';
        this.onConnectSetDB = null;
        this.release = null;
    }

    /**
     * @param {string} host
     * @param {string} user
     * @param {string} password
     * @param {string} [database="postgres"]
     * @param {string} [schema="public"]
     * @param {bool} [sslEnabled=false]
     * @return {Promise}
     */
    connectPromise({ host, username, password, database, schema, sslEnabled }){
        const [hostName, port = '5432'] = host.split(':');
        this.host = hostName;
        this.port = port;
        this.username = username;
        this.password = password;
        this.database = database;
        this.schema = schema;
        this.sslEnabled = sslEnabled;
        this.connection = new pg.Pool({
            user: this.username,
            database: this.database,
            password: this.password,
            host: this.host,
            port: this.port,
            ssl: this.sslEnabled,
            max: 10,
            idleTimeoutMillis: 30000,
            schema: this.schema,
        });
        return new Promise((resolve, reject) => {
            this.connection.connect((err, client, release) => {
                this.release = release;
                this.release();
                if (err) {
                    reject('PostgreSQL Error: ' + err.stack);
                    return;
                }
                resolve();
            });
            this.connection.on('error', (err) => {
                reject('PostgreSQL Error: ' + err.stack);
            });
        });
    }

    /**
     * @return {Promise}
     */
    closeConnect(){
        return new Promise((resolve, reject) => {
            this.connection.end().then(() => {
                this.connection = null;
                resolve();
            }).catch(reject);
        });
    }
    /**
     * @param {string} sql
     * @param {object} params
     * @return {Promise}
     */
    queryPromise(sql, params){
        return new Promise((resolve, reject) => {
            this.connection.query(sql, params, (err, rows) => {
                this.release();
                if (err) {
                    reject('PostgreSQL Error: ' + err.stack);
                    return;
                }
                resolve(rows.rows);
            });
        });
    }

    /**
     * @deprecated new implement is queryPromise
     * @param {string} sql
     * @param {function} func - callback
     * @param {object} params
     */
    query (sql, func, params){
        this.queryPromise(sql, params).then(func).catch((errMsg) => {
            vscode.window.showErrorMessage(errMsg);
            this.outputMsg(errMsg);
        });
    }

    /**
     * @return {Promise}
     */
    getDatabase(){
        return new Promise((resolve, reject) => {
            Promise.all([
                this.queryPromise(SELECT_DATABSE_SQL),
                this.queryPromise(SELECT_SCHEMA_SQL)
            ]).then(results => {
                var database = results[0];
                var schema = results[1];
                var allDatabase = [];
                for (let i = 0; i < database.length; i++) {
                    allDatabase.push(database[i].Database);
                }
                if(this.currentDatabase === null){
                    resolve(allDatabase);
                    return;
                }
                for (let i = 0; i < schema.length; i++) {
                    allDatabase.push(this.currentDatabase + '.' + schema[i].Database);
                }
                resolve(allDatabase);
            }).catch(reject);
        });
    }

    /**
     * @param {string} name - name Database or Database.schema
     * @return {Promise}
     */
    changeDatabase (name) {
        var databaseAndSchema = name.split('.');
        var database = databaseAndSchema.splice(0, 1)[0];
        var schema = 'public';
        if(databaseAndSchema.length > 0){
            schema = databaseAndSchema.join('.');
        }
        return new Promise((resolve, reject) => {
            if(database === this.currentDatabase){
                this.changeSchema(schema).then(resolve).catch(reject);
            }else{
                this.closeConnect().then(() => {
                    this.connectPromise({
                        host: this.host + ':' + this.port, 
                        username: this.username, 
                        password: this.password, 
                        sslEnabled: this.sslEnabled,
                        database, 
                        schema
                    }).then(() =>{
                        this.schema = schema;
                        this.currentDatabase = database;
                        resolve();
                    }).catch(reject);
                });
            }
        });
    }

    changeSchema(schema){
        return new Promise((resolve, reject) => {
            this.queryPromise('SET search_path to ' + schema).then(() => {
                this.schema = schema;
                resolve();
            }).catch(() => {
                this.schema = null;
                reject();
            });
        });
    }

    /**
     * @return {Promise}
     */
    refrestStructureDataBase () {
        var currentStructure = {};
        var tablePromise = [];
        const tableParams = [this.schema];
        return new Promise((resolve, reject) => {
            this.queryPromise(SELECT_TABLE_SQL, tableParams).then((results) => {
                for (var i = 0; i < results.length; i++) {
                    let key = Object.keys(results[i])[0];
                    let tableName =  results[i][key];
                    let columnParams = [tableName,tableName];
                    let promise = new Promise((resolve, reject) => {
                        this.queryPromise(SELECT_COLUMNS_SQL, columnParams).then((column) => {
                            var columns = [];
                            for (var i = 0; i < column.length; i++) {
                                var element = column[i];
                                columns.push(element);
                            }
                            resolve({
                                column : columns,
                                tableName : tableName
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
            });
        });


    }

    /**
     * @param {string} tableName
     * @return {string} a quoted identifier table name
     */
    getIdentifiedTableName(tableName){
        return `"${tableName}"`;
    }

    /**
     * @param {string} tableName
     * @return {string} a SQL SELECT statement
     */
    getSelectTableSql(tableName){
        return `SELECT * FROM ${this.schema}.${this.getIdentifiedTableName(tableName)}`;
    }

}

PostgreSQLType.prototype.typeName = 'Postgre SQL';

PostgreSQLType.prototype.fieldsToConnect = [
    {
        type: 'text',
        defaultValue: 'localhost',
        title: 'Host',
        name: 'host',
        info: '(e.g host, 127.0.0.1, with port 127.0.0.1:3333)'
    },
    {
        type: 'text',
        defaultValue: 'postgres',
        title: 'Database',
        name: 'database',
        info: ''
    },
    {
        type: 'text',
        defaultValue: 'public',
        title: 'Schema',
        name: 'schema',
        info: ''
    },
    {
        type: 'text',
        defaultValue: 'root',
        title: 'Userame',
        name: 'username',
        info: '(e.g root/user)'
    },
    {
        type: 'password',
        name: 'password',
        defaultValue: '',
        title: 'Password',
        info: ''
    },
    {
        type: 'checkbox',
        name: 'sslEnabled',
        defaultValue: false,
        title: 'Use SSL',
        info: ''
    }
];

module.exports = PostgreSQLType;
