import * as vscode from 'vscode';
import { AnyObject } from '../../typeing/common';

const htmlEncode = (str: string) => {
    return (str === null) ? "NULL" : str.toString().replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/'/g, '&#39;')
        .replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/`/g, '&grave;');
};

export const markdownProvider = new class implements vscode.TextDocumentContentProvider {
    public onDidChangeEmitter: vscode.EventEmitter<vscode.Uri>;
    public onDidChange: vscode.Event<vscode.Uri>;

    public constructor() {
        this.onDidChangeEmitter = new vscode.EventEmitter<vscode.Uri>();
        this.onDidChange = this.onDidChangeEmitter.event;
    }

    public provideTextDocumentContent(uri: vscode.Uri) {
        const query = JSON.parse(uri.query);
        const markdownDocument = new vscode.MarkdownString('# Query result');

        if (query.sql) {
            markdownDocument.appendCodeblock(query.sql, 'sql');
        }

        if (query.message) {
            markdownDocument.appendMarkdown(`\n**${query.message}**\n`);
        }

        if (Array.isArray(query.data) && query.data[0]) {
            const keys = Object.keys(query.data[0]);
            const headers = keys.join(' | ');
            const separator = keys.map(() => '---').join(' | ');
            const data = query.data.map((row: AnyObject) => `${keys.map(key => htmlEncode(row[key])).join(' | ')}`).join('\n');

            markdownDocument.appendMarkdown(`\n${headers}\n${separator}\n${data}\n`);
        }

        return markdownDocument.value;
    }
};
