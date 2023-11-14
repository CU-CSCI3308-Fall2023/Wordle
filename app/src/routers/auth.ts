import bcrypt from 'bcryptjs';
import express from 'express';

import db from '../db';
import { User } from '../types';

const router = express.Router();

router.get('/login', async (req, res) => {
  res.render('views/login');
});

router.get('/signup', async (req, res) => {});

router.get('/how-to-play', async (req, res) => {
  res.render('views/instructions');
});

router.post('/login', async (req, res) => {
  const { username, password } = req.body;

  if (
    !username ||
    !password ||
    typeof username !== 'string' ||
    typeof password !== 'string'
  ) {
    return res.status(400).end();
  }

  try {
    const user = await db.oneOrNone<User>(
      `SELECT * FROM users WHERE username = $1;`,
      [username]
    );

    if (!user || !(await bcrypt.compare(password, user.password_hash))) {
      // TODO: Render the login page with an error message
      return res.status(401).end();
    }

    req.session.user = user;
    req.session.save();
    res.redirect('/');
  } catch (error: unknown) {
    res.status(500).end();
  }
});

router.post('/signup', async (req, res) => {
  const { username, password } = req.body;

  // TODO: Maybe add some validation on how we want the username and password to look like
  if (
    !username ||
    !password ||
    typeof username !== 'string' ||
    typeof password !== 'string'
  ) {
    return res.status(400).end();
  }

  const hash = await bcrypt.hash(password, 10);

  try {
    const user = await db.one<User>(
      `INSERT INTO users(username, password_hash) VALUES($1, $2) RETURNING *;`,
      [username, hash]
    );

    req.session.user = user;
    req.session.save();
    res.redirect('/');
  } catch (error: unknown) {
    // @ts-ignore 23505 is the unique_violation error code (username already exists)
    if (error?.code === '23505') {
      return res.status(409).end();
    }

    res.status(500).end();
  }
});

router.use((req, res, next) => {
  if (!req.session.user) {
    res.redirect('/login');
  }
  next();
});

export default router;
