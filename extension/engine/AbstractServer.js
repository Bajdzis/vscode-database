class AbstractServer
{
    constructor() {
        this.connection = null;
        this.currentDatabase = null;
        this.name = 'Noname';
        this.OutputChannel = null;
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
     * @return {object} - object with some data to save
     */
    getDataToRestore(){
        return {
            type:this.type,
            name:this.name,
            host:this.host + ':' + this.port,
            username:this.username,
            password:this.password,
            database:this.currentDatabase
        };
    } 
   
    /**
     * @param {object} fields - result getDataToRestore() function
     * @return {Promise}
     */
    restoreConnection(fields){
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

AbstractServer.prototype.fieldsToConnect = [
    {
        type: 'text',
        defaultValue: 'localhost',
        name: 'host',
        title: 'Host',
        info: '(e.g host, 127.0.0.1, with port 127.0.0.1:3333)'
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

module.exports = AbstractServer;
