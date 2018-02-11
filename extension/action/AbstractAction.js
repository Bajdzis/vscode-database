var manager = require('../Manager');

module.exports = class AbstractAction
{
    constructor() {
        this.sqlMenager = manager;
        this.execution = this.execution.bind(this);
    }

    /**
     * execution action
     */
    execution(){

    };
    
}