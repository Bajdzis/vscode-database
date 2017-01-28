module.exports = class AbstractServer
{
    constructor() {
        this.connection = null;
        this.currentDatabase = null;
        this.name = "Noname";
        this.OutputChannel = null;
    }

    setOutput(OutputChannel){
        this.OutputChannel = OutputChannel;
    };
    
    outputMsg (msg){
        if(this.OutputChannel !== null){
            this.OutputChannel.appendLine(msg);
        }
    };

    connectPromise(host, user, password){
        return Promise.reject("No implement connectPromise");
    };

    queryPromise(host, user, password){
        return Promise.reject("No implement queryPromise");
    };
}