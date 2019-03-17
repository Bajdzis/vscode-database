import getBuildQueryDocument from './helpers/getBuildQueryDocument';
import { AbstractAction } from './AbstractAction';

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
