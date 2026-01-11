const db = require('./config/db');

async function listUsers() {
    try {
        const [users] = await db.query('SELECT id, full_name, email, password, role FROM users');
        console.log('--- Registered Users ---');
        console.table(users);
        process.exit(0);
    } catch (err) {
        console.error('Error:', err.message);
        process.exit(1);
    }
}

listUsers();
