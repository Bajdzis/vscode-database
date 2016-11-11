module.exports = class AbstractServer
{
    constructor() {
        this.connection = null;
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
}