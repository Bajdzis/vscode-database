var asciiTableBig = require('./AsciiTableBig.js');

module.exports = function AsciiTable(json)
{
    var _this = this;
    var MAX_CHARACTERS_IN_LINE = 180;
    this.keys = Object.keys(json[0]);
    this.width = {};

    this.table = function(){

        for (var key in _this.keys) {
            _this.width[_this.keys[key]] = String(_this.keys[key]).length;
        }

        for (var row in json) {
            for (var data in json[row]) {
                _this.width[data] = Math.max(_this.width[data], String(json[row][data]).length);
            }
        }

        var counterWidth = 0;
        for (var size in this.width) {
            counterWidth +=  this.width[size];
        }

        if(counterWidth > MAX_CHARACTERS_IN_LINE){
            return asciiTableBig(json);
        }

        return _this.draw();
    };

    this.draw = function () {
        var buffer = '';
        // draw 
        buffer += _this.line();
        buffer += '\n | ';
        for (var key in _this.keys) {
            buffer += _this.keys[key] + ( ' '.repeat(_this.width[_this.keys[key]] - String(_this.keys[key]).length) ) + ' | ';
        }
            
        buffer += _this.line(); 
        
        for (var row in json) {
            
            buffer += '\n | ';
            for (var data in json[row]) {

                buffer += String(json[row][data]) + ( ' '.repeat(_this.width[data] - String(json[row][data]).length) ) + ' | ';

            }
        }
        
        buffer += this.line(); 
        return buffer;
    };

    this.line = function(){
        var line = '\n +';
        for (var size in this.width) {
            line +=  ( '-'.repeat(this.width[size]+2) ) + '+';
        }

        return line;
    };

    return this.table();
};
