import getBuildQueryDocument from './helpers/getBuildQueryDocument.js';
import { AbstractAction } from './AbstractAction.js';

export class RunQueryBuild extends AbstractAction
{
    
    execution() {
        getBuildQueryDocument().then((document) => {
            this.execQuery(document.getText());
        });
    }

    execQuery(query?: string) {
        if (!query) {
            return;
        }

        this.sqlMenager.runAsQuery(query);
    }
}
