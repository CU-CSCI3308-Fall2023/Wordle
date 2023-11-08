import express from 'express';

const router = express.Router();

router.get('/login', async (req, res) => {});

router.get('/signup', async (req, res) => {});

router.post('/login', async (req, res) => {});

router.post('/signup', async (req, res) => {});

router.use((req, res, next) => {
  if (!req.session.user) {
    res.redirect('/login');
  }
  next();
});

export default router;
