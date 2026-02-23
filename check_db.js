const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./database.sqlite');

db.serialize(() => {
    db.all('SELECT * FROM donations', (err, rows) => {
        if (err) console.error(err);
        else console.log('Donations:', rows);
    });
    db.all('SELECT * FROM newsletter', (err, rows) => {
        if (err) console.error(err);
        else console.log('Newsletter:', rows);
    });
});

db.close();
