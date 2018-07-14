module.exports = class AbstractServer
{
    constructor() {
        this.connection = null;
        this.currentDatabase = null;
        this.name = "Noname";
        this.OutputChannel = null;
    }

    /**
     * @param {OutputChannel} OutputChannel - VS Code Output Channel
     */
    setOutput(OutputChannel){
        this.OutputChannel = OutputChannel;
    };
    
    /**
     * @param {string} msg - text message to show
     */
    outputMsg (msg){
        if(this.OutputChannel !== null){
            this.OutputChannel.appendLine(msg);
        }
    };

    /**
     * @param {string} host
     * @param {string} user
     * @param {string} password
     * @param {string|undefined} database
     * @return {Promise}
     */
    connectPromise(host, user, password, database){
        return Promise.reject("No implement connectPromise");
    };

    /**
     * @param {string} sql - query
     * @return {Promise}
     */
    queryPromise(sql){
        return Promise.reject("No implement queryPromise");
    };

    /**
     * @param {string} sql - queries separate ;
     * @return {string[]}
     */
    splitQueries(sqlMulti) {
        return sqlMulti.split(";").filter((sql) => {
            if (!sql) {
                return false;
            }
            const notEmpty = (sql.trim().replace(/(\r\n|\n|\r)/gm, "") !== "");
            return notEmpty ? true : false;
        })
    }

    /**
     * @param {object} currentStructure - save new structure to this params
     */
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
        return `SELECT * FROM ${getIdentifiedTableName(tableName)}`;
    }
}