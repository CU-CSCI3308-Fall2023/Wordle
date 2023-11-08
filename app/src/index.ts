import './db'; // although we don't use it directly, we need to import it to connect to the database

import bodyParser from 'body-parser';
import express from 'express';
import session from 'express-session';

import auth from './routers/auth';

const app = express();

app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// hide that the app is powered by Express
app.disable('x-powered-by');

app.use(
  session({
    secret: process.env.SESSION_SECRET!,
    saveUninitialized: false,
    resave: false
  })
);

// all routes after this middleware require authentication
app.use(auth);

app.listen(3000, () => {
  console.log('Listening on port 3000');
});
