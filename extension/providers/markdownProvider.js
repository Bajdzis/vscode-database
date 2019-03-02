var vscode = require('vscode');

var htmlEncode = function (str) {
    return str.toString().replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/'/g, '&#39;')
        .replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/`/g, '&grave;');
};

const markdownProvider = new class{
    constructor() {
        this.onDidChangeEmitter = new vscode.EventEmitter();
        this.onDidChange = this.onDidChangeEmitter.event;
    }

    provideTextDocumentContent(uri) {
        const query = JSON.parse(uri.query);
        const markdownDocument = new vscode.MarkdownString('# Query result');
        
        if (query.sql) {
            markdownDocument.appendCodeblock(query.sql, 'sql');
        }

        if (query.message) {
            markdownDocument.appendMarkdown(`\n**${query.message}**\n`);
        }

        if (query.data[0]) {
            const keys = Object.keys(query.data[0]);
            const headers = keys.join(' | ');
            const separator = keys.map(() => '---').join(' | ');
            const data = query.data.map(row => `${keys.map(key => htmlEncode(row[key]) ).join(' | ')}`).join('\n');

            markdownDocument.appendMarkdown(`\n${headers}\n${separator}\n${data}\n`);
        }

        return markdownDocument.value;
    }
};

module.exports = { markdownProvider };
