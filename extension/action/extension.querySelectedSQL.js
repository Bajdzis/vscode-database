var vscode = require('vscode');
var AbstractAction = require('./AbstractAction.js');

module.exports = class querySelectedSQL extends AbstractAction {

    execution(editor) {
        if (!editor || !editor.document || editor.selection.isEmpty) {
            return;
        }

        let selection = editor.document.getText(editor.selection);
        if (selection) {
            this.sqlMenager.queryPromiseMulti(selection).then(allResult => {
                allResult.forEach(result => {
                    this.sqlMenager.queryOutput(result);
                });
            });
        }
    }
}
