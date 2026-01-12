const db = require('./config/db');

async function checkSchema() {
    try {
        const databaseName = 'forsalinkk'; // From db.js
        console.log(`\n--- Foreign Keys pointing to jobs ---`);
        const [dependencies] = await db.query(`
      SELECT 
        TABLE_NAME, 
        COLUMN_NAME, 
        CONSTRAINT_NAME, 
        REFERENCED_TABLE_NAME, 
        REFERENCED_COLUMN_NAME
      FROM 
        INFORMATION_SCHEMA.KEY_COLUMN_USAGE
      WHERE 
        REFERENCED_TABLE_NAME = 'jobs'
        AND TABLE_SCHEMA = ?
    `, [databaseName]);
        console.table(dependencies);

        const tables = ['jobs', 'applications', 'bookmarks', 'notifications'];
        for (const table of tables) {
            console.log(`\n--- Schema for table: ${table} ---`);
            try {
                const [columns] = await db.query(`DESCRIBE ${table}`);
                console.table(columns);

                const [createTable] = await db.query(`SHOW CREATE TABLE ${table}`);
                console.log(createTable[0]['Create Table']);
            } catch (e) {
                console.log(`Table ${table} might not exist or error: ${e.message}`);
            }
        }
        process.exit(0);
    } catch (error) {
        console.error('Error checking schema:', error);
        process.exit(1);
    }
}

checkSchema();
