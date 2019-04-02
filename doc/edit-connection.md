# Edit / delete saved connection

The extension does not have edit mode for saved connection. However, you can edit the data manually. All data is saved in VS Code setting in key `database.connections`.

Structure for My SQL: 
```json
    "database.connections": [
        {
            "type": "mysql",
            "name": "any name you want to display (NOT REQUIRED)",
            "host": "localhost:3306",
            "username": "root",
            "database": "database-name",
            "password": "this-field-is-not-required"
        }
    ]
```

Structure for postgres: 
```json
    "database.connections": [
        {
            "type": "postgres",
            "name": "any name you want to display (NOT REQUIRED)",
            "host": "localhost:5432",
            "username": "postgres",
            "database": "database-name",
            "password": "this-field-is-not-required"
        }
    ]
```

[How to edit setting in VS Code](https://code.visualstudio.com/docs/getstarted/settings)