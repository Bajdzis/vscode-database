# VS Code database
### Extension for Visual Studio Code 

## Usage

![result](https://github.com/Bajdzis/vscode-database/raw/master/readme/v2.0-result.gif)

![connection](https://github.com/Bajdzis/vscode-database/raw/master/readme/v2.0-connection.gif)

## Install
* Press `Shift+Ctrl+P` 
* Pick `Extensions: Install Extension`
* Find `vscode-database`
 
## Changelog

* 2.0.1 (IN BETA TESTING)
    * Created new form to connect database. Fixed #19 
    * Add database icon in sidebar.
    * Query result to csv
    * Connect via SSL to postgres #54
    * Ask for save with password #3
    * New query result (based on markdown)
    * Connect via Socket to mysql #28
    * Connect via SSL to mysql #47
    * Fix SQL Connection error in postgres #63

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

## Authors

* Bajdzis - Extension
* k--kato - Postgres integration
* serl - Execute selected query
* ArtemiusUA - Query result to csv

## License
MIT © [Bajdzis](https://github.com/Bajdzis)
