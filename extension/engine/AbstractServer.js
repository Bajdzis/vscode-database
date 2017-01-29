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
     * @return {Promise}
     */
    connectPromise(host, user, password){
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
     * @param {object} currentStructure - save new structure to this params
     */
    refrestStructureDataBase (currentStructure) { }

    /**
     * @return {Promise<string[], Error|string>}
     */
    getDatabase(){
        return Promise.resolve([]);
    }
}