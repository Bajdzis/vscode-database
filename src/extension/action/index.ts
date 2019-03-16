import { AbstractAction } from './AbstractAction';
import { Manager } from '../Manager';
import { ChangeDB } from './extension.changeDB';
import { ChangeServer } from './extension.changeServer';
import { SaveConfig } from './extension.saveConfig';
import { RunQueryBuild } from './extension.runQueryBuild';
import { QuerySelectedSQL } from './extension.querySelectedSQL';
import { QuerySelectedSQLToCSV } from './extension.querySelectedSQLToCSV';
import { QueryFileSQLToCSV } from './extension.queryFileSQLToCSV';
import { QueryFileSQL } from './extension.queryFileSQL';
import { QueryBuild } from './extension.queryBuild';
import { ConnectToSQLServer } from './extension.connectToSQLServer';
import { QuerySQL } from './extension.querySQL';

export interface ActionsList {
    [K: string]: new (sqlMenager: Manager) => AbstractAction;
}

export const actionsList: ActionsList = {
    'extension.changeDB': ChangeDB,
    'extension.changeServer': ChangeServer,
    'extension.connectToSQLServer': ConnectToSQLServer,
    'extension.queryBuild': QueryBuild,
    'extension.queryFileSQL': QueryFileSQL,
    'extension.queryFileSQLToCSV': QueryFileSQLToCSV,
    'extension.querySelectedSQL': QuerySelectedSQL,
    'extension.querySelectedSQLToCSV': QuerySelectedSQLToCSV,
    'extension.querySQL': QuerySQL,
    'extension.runQueryBuild': RunQueryBuild,
    'extension.saveConfig': SaveConfig,
};
