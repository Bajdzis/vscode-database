
import { MySQLType } from './mysql-pass';


describe('Mysql type', () => {

    it('correct split many query', () => {
        const serverInstance = new MySQLType();

        const queries = serverInstance.splitQueries('SELECT * FROM `table1`;SELECT * FROM `table2`;');

        expect(queries).toHaveLength(2);
        expect(queries[0]).toEqual('SELECT * FROM `table1`');
        expect(queries[1]).toEqual('SELECT * FROM `table2`');
    });

    it('delete empty query', () => {
        const serverInstance = new MySQLType();

        const queries = serverInstance.splitQueries(';;;;;SELECT * FROM `table1`;;;;;SELECT * FROM `table2`;;;;;;');

        expect(queries).toHaveLength(2);
        expect(queries[0]).toEqual('SELECT * FROM `table1`');
        expect(queries[1]).toEqual('SELECT * FROM `table2`');
    });
    
});
