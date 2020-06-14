import { AnyObject } from '../typeing/common';

export const asciiTableBig = (json: AnyObject[], appendLine: (line: string) => void): void => {
    
    let widthKey = 0;
    let widthData = 0;
    const MAX_CHARACTERS_IN_LINE = 180;
    const keys = Object.keys(json[0]);

    const line = () => {
        let line = ' +';

        line +=  ( '-'.repeat(widthKey+2) ) + '+';
        line +=  ( '-'.repeat(widthData+2) ) + '+';

        return line;
    };

    const draw = () => {

        for (const row in json) {

            appendLine('');
            appendLine('');
            appendLine('ROW : ' + row);
            appendLine('');

            for (const key in json[row]) {

                appendLine(line());

                let data = String(json[row][key]);
                
                if(data.length > widthData){
                    data = data.substr(0, widthData-6);
                    data += '[...]';
                }

                let bufferLine = ' | ';
                bufferLine += (key + ( ' '.repeat(widthKey - String(key).length) ) + ' | ');
                bufferLine += (data + ( ' '.repeat(widthData - data.length) ) + ' | ');
                appendLine(bufferLine);

            }

            appendLine(line());

        }
    };

    for (const key in keys) {
        widthKey = Math.max(widthKey, String(keys[key]).length);
    }
    widthData = MAX_CHARACTERS_IN_LINE - widthKey;

    draw();
};
