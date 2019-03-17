import * as vscode from 'vscode';
import { manager } from './Manager';

class CompletionItemsProvider{

    constructor() { 
    }

    provideCompletionItems() {
        return manager.getCompletionItem();
    }

    resolveCompletionItem(item: vscode.CompletionItem) {
        return item;
    }
}

const completionItemsProvider = new CompletionItemsProvider();

export default completionItemsProvider;
