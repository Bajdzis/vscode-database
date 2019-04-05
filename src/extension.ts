import * as vscode from 'vscode';
import {actionsList, ActionsList} from './extension/action';
import { CommandCallback, AbstractAction } from './extension/action/AbstractAction';
import config from './extension/action/helpers/Config';
import { manager } from './extension/Manager';
import structureProvider from './extension/StructureProvider';
import connectionsProvider from './extension/ConnectionsProvider';
import completionItemsProvider from './extension/CompletionItemsProvider';
import { setExtensionPath } from './extension/webViews/webViewsRunner';
import { markdownProvider } from './extension/providers/markdownProvider';

export function activate(context: vscode.ExtensionContext) {
    
    config.getDatabases().then((databases) => {
        manager.restoreConnections(databases);
    });

    setExtensionPath(context.extensionPath);

    context.subscriptions.push(vscode.languages.registerCompletionItemProvider('sql', completionItemsProvider, ' '));
    
    vscode.window.registerTreeDataProvider('Table', structureProvider);

    vscode.window.registerTreeDataProvider('Connections', connectionsProvider);

    addCommand(context, 'extension.queryBuild');

    addCommand(context, 'extension.runQueryBuild');

    addCommand(context, 'extension.saveConfig');
    
    addCommand(context, 'extension.changeDB');
    
    addCommand(context, 'extension.changeServer');
    
    addCommand(context, 'extension.connectToSQLServer');

    addCommand(context, 'extension.querySQL');

    addCommand(context, 'extension.querySQLToCSV');
    
    addCommand(context, 'extension.queryFileSQL');

    addCommand(context, 'extension.queryFileSQLToCSV');

    addTextEditorCommand(context, 'extension.querySelectedSQL');

    addTextEditorCommand(context, 'extension.querySelectedSQLToCSV');

    context.subscriptions.push(vscode.workspace.registerTextDocumentContentProvider('bajdzis-database-markdown', markdownProvider));

}

function addCommand(context: vscode.ExtensionContext, name: keyof ActionsList) {
    const func = getCommandFunction(name);
    const command = vscode.commands.registerCommand(name as string, func);
    context.subscriptions.push(command);
}

function addTextEditorCommand(context: vscode.ExtensionContext, name: keyof ActionsList) {
    const func = getCommandFunction(name);
    const command = vscode.commands.registerTextEditorCommand(name as string, func);
    context.subscriptions.push(command);
}

function getCommandFunction(name: keyof ActionsList): CommandCallback {
    const actionClass = actionsList[name];
    const actionObject = new actionClass(manager);
    return actionObject.execution;
}

// this method is called when your extension is deactivated
export function deactivate() {
}
