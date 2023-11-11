import pgPromise from 'pg-promise';

const pgp = pgPromise();

const host = process.env.NODE_ENV === 'test' ? 'db-test' : 'db';

const db = pgp({
  host,
  port: 5432,
  database: process.env.POSTGRES_DB,
  user: process.env.POSTGRES_USER,
  password: process.env.POSTGRES_PASSWORD
});

db.connect()
  .then(obj => {
    console.log('Database connection successful');
    obj.done();
  })
  .catch(error => {
    console.log('ERROR:', error.message || error);
  });

export default db;
