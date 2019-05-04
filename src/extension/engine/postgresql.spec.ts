
import { PostgreSQLType } from './postgresql';


describe('PostgreSQL type', () => {

    it('correct split many query', () => {
        const serverInstacne = new PostgreSQLType();

        const queries = serverInstacne.splitQueries("SELECT * FORM `table1`;SELECT * FORM `table2`;");

        expect(queries).toHaveLength(2);
        expect(queries[0]).toEqual('SELECT * FORM `table1`');
        expect(queries[1]).toEqual('SELECT * FORM `table2`');
    });

    it('delete empty query', () => {
        const serverInstacne = new PostgreSQLType();

        const queries = serverInstacne.splitQueries(";;;;;SELECT * FORM `table1`;;;;;SELECT * FORM `table2`;;;;;;");

        expect(queries).toHaveLength(2);
        expect(queries[0]).toEqual('SELECT * FORM `table1`');
        expect(queries[1]).toEqual('SELECT * FORM `table2`');
    });
    
})
