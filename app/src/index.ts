import 'dotenv/config';
import './db'; // although we don't use it directly, we need to import it to connect to the database

import bodyParser from 'body-parser';
import express from 'express';
import session from 'express-session';
import path from 'path';

import auth from './routers/auth';
import game from './routers/game';
import scoreboard from './routers/scoreboard';

const app = express();

app.set('views', path.join(__dirname, 'ui'));
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

app.use(express.static(path.join(__dirname, 'public')));

// all routes after this middleware require authentication
app.use(auth);
app.use('/game', game);
app.use('/scoreboard', scoreboard);

app.get('/', (req, res) => {
  res.redirect('/how-to-play');
});

app.get('/login', async (req, res) => {
  res.render('views/login.ejs');
});

app.get('/how-to-play', async (req, res) => {
  res.render('views/instructions');
});

export const server = app.listen(3000, () => {
  console.log('Listening on port 3000');
});
