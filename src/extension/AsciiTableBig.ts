import { AnyObject } from '../typeing/common';

export const asciiTableBig = (json: AnyObject[]): string => {
    
    let widthKey = 0;
    let widthData = 0;
    const MAX_CHARACTERS_IN_LINE = 180;
    const keys = Object.keys(json[0]);

    const line = () => {
        var line = '\n +';

        line +=  ( '-'.repeat(widthKey+2) ) + '+';
        line +=  ( '-'.repeat(widthData+2) ) + '+';

        return line;
    };

    const draw = () => {
        var buffer = '';

        for (var row in json) {

            buffer += '\n\n';
            buffer += 'ROW : ' + row;
            buffer += '\n';

            for (var key in json[row]) {

                buffer += line();
                buffer += '\n | ';

                var data = String(json[row][key]);
                
                if(data.length > widthData){
                    data = data.substr(0, widthData-6);
                    data += '[...]';
                }

                buffer += key + ( ' '.repeat(widthKey - String(key).length) ) + ' | ';
                buffer += data + ( ' '.repeat(widthData - data.length) ) + ' | ';

            }

            buffer += line();

        }

        return buffer;
    };

    for (var key in keys) {
        widthKey = Math.max(widthKey, String(keys[key]).length);
    }
    widthData = MAX_CHARACTERS_IN_LINE - widthKey;

    return draw();
};
