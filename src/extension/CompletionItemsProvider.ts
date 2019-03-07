var manager = require('./Manager');

class CompletionItemsProvider{

    constructor() { 
    }

    provideCompletionItems() {
        return manager.getCompletionItem();
    }

    resolveCompletionItem(item) {
        return item;
    }
}

const completionItemsProvider = new CompletionItemsProvider();

module.exports = completionItemsProvider;
