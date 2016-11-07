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
    this.OutputChannel = null;
    this.onConnectSetDB = null;
    this.done = null;

    this.connect = function (host, user, password, menager) {
        this.name = host + " (postgres)";
        var hostAndPort = host.split(":");
        this.host = hostAndPort[0];
        this.port = hostAndPort[1] || "5432";
        this.user = user;
        this.password = password;
        this.connection = new pg.Pool({
            user: user,
            database: this.host,
            password: password,
            port: this.port,
            max: 10,
            idleTimeoutMillis: 30000,
        });
        var instancja = this;
        this.connection.connect(function (err, client, done) {
            if (err) {
                var errMsg = 'PostgreSQL Error: ' + err.stack;
                vscode.window.showErrorMessage(errMsg);
                instancja.outputMsg(errMsg);
                return;
            }
            menager.registerNewServer(instancja);
            if (instancja.onConnectSetDB !== null) {
                instancja.query("USE " + instancja.onConnectSetDB, null);
                menager.currentDatabase = instancja.onConnectSetDB;
                vscode.window.showInformationMessage('Database changed');
                menager.showStatus();
            }
            this.done = done;
        });

        this.connection.on('error', function (err, client) {
            var errMsg = 'PostgreSQL Error: ' + err.stack;
            vscode.window.showErrorMessage(errMsg);
            instancja.outputMsg(errMsg);
            return;
        })

    };

    this.setOutput = function (OutputChannel) {
        this.OutputChannel = OutputChannel;
    };

    this.outputMsg = function (msg) {
        if (this.OutputChannel !== null) {
            this.OutputChannel.appendLine(msg);
        }
    };

    this.query = function (sql, func) {
        var instancja = this;
        this.connection.query(sql, [], function (err, rows) {
            this.done;
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

}