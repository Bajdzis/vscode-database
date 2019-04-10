# VS Code database
Extension for Visual Studio Code 

[![Build Status](https://travis-ci.com/Bajdzis/vscode-database.svg?branch=master)](https://travis-ci.com/Bajdzis/vscode-database)

## Demo

![result](https://github.com/Bajdzis/vscode-database/raw/master/readme/v2.0-result.gif)

![connection](https://github.com/Bajdzis/vscode-database/raw/master/readme/v2.0-connection.gif)

## Usage

* Connection
    * [Create many connection to database](https://github.com/Bajdzis/vscode-database/blob/master/doc/create-connection.md)
    * [Save connection](https://github.com/Bajdzis/vscode-database/blob/master/doc/save-connection.md)
    * [Edit/delete saved connection](https://github.com/Bajdzis/vscode-database/blob/master/doc/edit-connection.md)
 
## Changelog

* 2.1.5
    * Fix Query command #85
    * Fix Markdown preview with NULL value #86

* 2.1.4
    * Fix sidebar provider #82

* 2.1.3
    * Fixed #78 (disable mangle in webpack config)

* 2.1.2
    * Update dependencies

* 2.1.1
    * Fix: add webview to extension pack

* 2.1.0
    * Migrate JavaScript to TypeScript
    * Add connection SSL with user and password authentication (thanks @brooksgarrett)
    * Start using webpack #75

* 2.0.3
    * Created new form to connect database. Fixed #19 
    * Add database icon in sidebar.
    * Query result to csv
    * Connect via SSL to postgres #54
    * Ask for save with password #3
    * New query result (based on markdown)
    * Connect via Socket to mysql #28
    * Connect via SSL to mysql #47
    * Fix SQL Connection error in postgres #63
    * Fix change database in postgres #66
    * Hide password input show if save connection require empty password

* 1.5.3 - Fixed #59

* 1.5.2 - Fixed #49

* 1.5.1 - Fixed #39

* 1.5.0 - Add new command for run query from SQL files

* 1.4.1 - Fixed #24, #21

* 1.4.0 - Show connections and table in TreeView, Start using VSCode Setting

    ( if you update please copy and paste you setting from file `${projectFolder}/.vscode/database.json` to VSCode Setting `database.connections`)

* 1.3.0 - Execute selected query, new status bars, additional info #25, #30

* 1.2.0 - Fixed #10, #16, #17

* 1.1.0 - Fixed #12, #13

* 1.0.0 - Add postgres database support

* 0.9.0 - Snippets, Completion Item and Query Advancer Build

* 0.1.4 - Fixed ASCII table.

* 0.1.3 - Support ports other than 3306.

* 0.1.1 - Fixed ASCII table.

* 0.1.0 - Save database to config.

* 0.0.2 - Show error message, save config.

* 0.0.1 - Add mysql database support.

## Install
* Press `Shift+Ctrl+P` 
* Pick `Extensions: Install Extension`
* Find `vscode-database`

## Authors

* [Bajdzis](https://github.com/Bajdzis) - Extension
* [k--kato](https://github.com/kasecato) - Postgres integration
* [serl](https://github.com/serl) - Execute selected query
* [ArtemiusUA](https://github.com/ArtemiusUA) - Query result to csv
* [brooksgarrett](https://github.com/brooksgarrett) - Add connection SSL with user and password authenticatio
* [EPMatt](https://github.com/EPMatt) - Fix sidebar provider #82, Fix Query command #85, Fix Markdown preview with NULL value #86

## License
MIT © [Bajdzis](https://github.com/Bajdzis)
