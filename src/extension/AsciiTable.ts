import {asciiTableBig} from './AsciiTableBig';
import { AnyObject } from '../typeing/common';

export const asciiTable = (json: AnyObject[], appendLine: (line: string) => void): void => {
    const MAX_CHARACTERS_IN_LINE = 180;
    const keys = Object.keys(json[0]);
    const width: AnyObject = {};

    const line = function(){
        let line = ' +';
        for (const size in width) {
            line +=  ( '-'.repeat(width[size]+2) ) + '+';
        }

        return line;
    };

    const draw = () => {
        appendLine(line());
        let buffer = ' | ';
        for (const key in keys) {
            buffer += keys[key] + ( ' '.repeat(width[keys[key]] - String(keys[key]).length) ) + ' | ';
        }
            
        appendLine(buffer); 
        appendLine(line()); 
        
        for (const row in json) {
            let buffer = ' | ';
            for (const data in json[row]) {
                buffer += String(json[row][data]) + ( ' '.repeat(width[data] - String(json[row][data]).length) ) + ' | ';
            }
            appendLine(buffer); 
        }
        
        appendLine(line());
    };

    for (const key in keys) {
        width[keys[key]] = String(keys[key]).length;
    }

    for (const row in json) {
        for (const data in json[row]) {
            width[data] = Math.max(width[data], String(json[row][data]).length);
        }
    }

    let counterWidth = 0;
    for (const size in width) {
        counterWidth +=  width[size];
    }

    if(counterWidth > MAX_CHARACTERS_IN_LINE){
        return asciiTableBig(json, appendLine);
    }

    draw();
};
