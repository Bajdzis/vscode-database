var pg = require('pg');
var vscode = require('vscode');

module.exports = function PostgreSQLType() {
    this.connection = null;
    this.name = "Noname";
    this.type = "postgres";
    this.host = "Empty";
    this.port = "5432";
    this.user = "Empty";
    this.password = "Empty";
    this.schema = "public";
    this.OutputChannel = null;
    this.onConnectSetDB = null;
    this.release = null;

    this.setOutput = function (OutputChannel) {
        this.OutputChannel = OutputChannel;
    };

    this.outputMsg = function (msg) {
        if (this.OutputChannel !== null) {
            this.OutputChannel.appendLine(msg);
        }
    };

    this.connect = function (host, user, password, menager) {
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
        var instancja = this;
        this.connection.connect(function (err, client, release) {
            instancja.release = release;
            instancja.release();
            if (err) {
                var errMsg = 'PostgreSQL Error: ' + err.stack;
                vscode.window.showErrorMessage(errMsg);
                instancja.outputMsg(errMsg);
                return;
            }

            menager.registerNewServer(instancja);

            if (instancja.onConnectSetDB !== null) {
                menager.currentDatabase = instancja.onConnectSetDB;
                vscode.window.showInformationMessage('Database changed');
                menager.showStatus();
            }

        });

        this.connection.on('error', function (err, client) {
            var errMsg = 'PostgreSQL Error: ' + err.stack;
            vscode.window.showErrorMessage(errMsg);
            instancja.outputMsg(errMsg);
            return;
        })

    };

    this.query = function (sql, func, params) {
        var instancja = this;
        this.connection.query(sql, params, function (err, rows) {
            instancja.release();
            if (err) {
                var errMsg = 'PostgreSQL Error: ' + err.stack;
                vscode.window.showErrorMessage(errMsg);
                instancja.outputMsg(errMsg);
                return;
            }
            if (func !== null) {
                func(rows.rows);
            }
        });
    };

    this.getShowDatabaseSql = function(){
        return getSelectSchemaSql();
    };

    this.changeDatabase = function (name) {
        this.query("SET search_path to " + name, null);
    };

    this.refrestStructureDataBase = function (currentStructure) {
        const that = this;
        const selectTables = getSelectTableSql();
        const tableParams = [that.schema];
        this.query(selectTables, function (results) {
            for (var i = 0; i < results.length; i++) {
                const key = Object.keys(results[i])[0];
                const tableName = results[i][key];
                const selectColumns = getSelectColumnsSql(tableName);
                const columnParams = [tableName, tableName];
                that.query(selectColumns, (function (tableName) {
                    return function (columnStructure) {
                        currentStructure[tableName] = columnStructure;
                    }
                })(tableName), columnParams);
            }
        }, tableParams);

    }

    const getSelectSchemaSql = () =>
`
SELECT
  schema_name AS "Database"
FROM information_schema.schemata
`;

    const getSelectTableSql = () =>
`
SELECT 
  table_name
FROM information_schema.tables
WHERE table_schema = $1::text
`;

    const getSelectColumnsSql = () =>
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
  col_description(col.table_name :: REGCLASS, col.ordinal_position) AS "Extra"
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

}

