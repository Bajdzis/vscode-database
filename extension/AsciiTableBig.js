

module.exports = function AsciiTableBig(json)
{
    
    var _this = this;
    var MAX_CHARACTERS_IN_LINE = 180;
    this.keys = Object.keys(json[0]);
    this.widthKey = 0;
    this.widthData = 0;

    this.table = function(){

        for (var key in _this.keys) {
            _this.widthKey = Math.max(_this.widthKey, String(_this.keys[key]).length);
        }
        _this.widthData = MAX_CHARACTERS_IN_LINE - _this.widthKey;
        return _this.draw();
    }

    this.draw = function () {
        var buffer = '';

        for (var row in json) {

            buffer += "\n\n";
            buffer += "ROW : " + row;
            buffer += "\n";

            for (var key in json[row]) {

                buffer += _this.line();
                buffer += "\n | ";

                var data = String(json[row][key]);
                
                if(data.length > _this.widthData){
                    data = data.substr(0, _this.widthData-6);
                    data += "[...]";
                }

                buffer += key + ( ' '.repeat(_this.widthKey - String(key).length) ) + " | ";
                buffer += data + ( ' '.repeat(_this.widthData - data.length) ) + " | ";

            }

            buffer += _this.line();

        }

        return buffer;
    }

    this.line = function(){
        var line = "\n +";

        line +=  ( '-'.repeat(_this.widthKey+2) ) + "+";
        line +=  ( '-'.repeat(_this.widthData+2) ) + "+";

        return line;
    }

    return this.table();
}