var vscode = require('vscode');
var manager = require('./Manager');

class CompletionItemsProvider{

	constructor() { 
    }

    provideCompletionItems(document, position, token) {
        return manager.getCompletionItem();
    }

    resolveCompletionItem(item, token) {
        return item;
    }
}

const completionItemsProvider = new CompletionItemsProvider();

module.exports = completionItemsProvider;