var pg = require('pg');
var vscode = require('vscode');
var AbstractServer = require('./AbstractServer.js');


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


module.exports = class PostgreSQLType extends AbstractServer{

    constructor() {
        super();
        this.type = "postgres";
        this.host = "Empty";
        this.port = "5432";
        this.user = "Empty";
        this.password = "Empty";
        this.schema = "public";
        this.onConnectSetDB = null;
        this.release = null;
    }

    connect (host, user, password, menager) {
        this.name = this.onConnectSetDB + "@" + host + " (postgres)";
        var hostAndPort = host.split(":");
        this.host = hostAndPort[0];
        this.port = hostAndPort[1] || "5432";
        this.user = user;
        this.password = password;
        this.connection = new pg.Pool({
            user: user,
            database: this.onConnectSetDB,
            password: password,
            host: this.host,
            port: this.port,
            max: 10,
            idleTimeoutMillis: 30000,
            schema: this.schema,
        });
        var _this = this;
        this.connection.connect(function (err, client, release) {
            _this.release = release;
            _this.release();
            if (err) {
                var errMsg = 'PostgreSQL Error: ' + err.stack;
                vscode.window.showErrorMessage(errMsg);
                _this.outputMsg(errMsg);
                return;
            }

            menager.registerNewServer(_this);

            if (_this.onConnectSetDB !== null) {
                menager.currentDatabase = _this.onConnectSetDB;
                vscode.window.showInformationMessage('Database changed');
                menager.showStatus();
            }

        });

        this.connection.on('error', function (err, client) {
            var errMsg = 'PostgreSQL Error: ' + err.stack;
            vscode.window.showErrorMessage(errMsg);
            _this.outputMsg(errMsg);
            return;
        })

    };

    query (sql, func, params) {
        var _this = this;
        this.connection.query(sql, params, function (err, rows) {
            _this.release();
            if (err) {
                var errMsg = 'PostgreSQL Error: ' + err.stack;
                vscode.window.showErrorMessage(errMsg);
                _this.outputMsg(errMsg);
                return;
            }
            if (func !== null) {
                func(rows.rows);
            }
        });
    };

    getShowDatabaseSql (){
        return SELECT_SCHEMA_SQL;
    };

    changeDatabase (name) {
        this.query("SET search_path to " + name, null);
    };

    refrestStructureDataBase (currentStructure, currentDatabase) {
        const that = this;
        const selectTables = SELECT_TABLE_SQL;
        const selectColumns = SELECT_COLUMNS_SQL;
        const tableParams = [currentDatabase];
        this.query(selectTables, function (results) {
            for (var i = 0; i < results.length; i++) {
                const key = Object.keys(results[i])[0];
                const tableName = results[i][key];
                const columnParams = [tableName, tableName];
                that.query(selectColumns, (function (tableName) {
                    return function (columnStructure) {
                        currentStructure[tableName] = columnStructure;
                    }
                })(tableName), columnParams);
            }
        }, tableParams);

    }

}

