import bcrypt from 'bcryptjs';
import chai, { expect } from 'chai';
import chaiHttp from 'chai-http';

import { server } from '../../../src';
import db from '../../../src/db';

chai.use(chaiHttp);

const invalidGuesses = ['looooong', 'shrt', '12345'];
const winningGuess = 'right';

describe('GameRouter', () => {
  const agent = chai.request.agent(server);

  before(async () => {
    const hash = await bcrypt.hash('password', 10);

    await db.tx(async t => {
      await t.none('TRUNCATE TABLE users RESTART IDENTITY CASCADE;');
      await t.none(
        `INSERT INTO users (username, password_hash) VALUES ('username', $1);`,
        [hash]
      );
    });

    await agent
      .post('/login')
      .send({ username: 'username', password: 'password' });
  });

  after(() => {
    agent.close();
  });

  beforeEach(async () => {
    await db.tx(async t => {
      await t.none(
        'TRUNCATE TABLE games, guesses, words RESTART IDENTITY CASCADE;'
      );
      await t.none('INSERT INTO words (id, word) VALUES (1, $1);', [
        winningGuess
      ]);
    });
  });

  describe('POST /game/start', () => {
    invalidGuesses.forEach(guess => {
      it(`should return 400 if the guess is not valid (${guess})`, () =>
        agent
          .post('/game/start')
          .send({ guess })
          .then(res => {
            expect(res).to.have.status(400);
          }));
    });

    it('should not use words that the user has already guessed', async () => {
      await db.none(
        'INSERT INTO games (user_id, word_id, guessed_correctly) VALUES (1, 1, TRUE);'
      );

      // since we only have one word, the game should fail to start
      await agent
        .post('/game/start')
        .send({ guess: winningGuess })
        .then(res => {
          expect(res).to.have.status(418);
        });

      await db.none('TRUNCATE TABLE games RESTART IDENTITY CASCADE;');
    });

    it('should return the correct response if the first guess is correct', () =>
      agent
        .post('/game/start')
        .send({ guess: winningGuess })
        .then(res => {
          expect(res).to.have.status(200);
          expect(res.body).to.deep.equal({
            gameId: 1,
            remainingGuesses: 0,
            canKeepGuessing: false,
            won: true,
            currentPoints: 6,
            guesses: [
              winningGuess.split('').map((letter, index) => ({
                letter,
                index,
                guess: winningGuess,
                isInWord: true,
                isInCorrectPosition: true
              }))
            ]
          });
        }));

    it('should return the correct response if the first guess is incorrect', () =>
      agent
        .post('/game/start')
        .send({ guess: 'wrong' })
        .then(res => {
          expect(res).to.have.status(200);
          expect(res.body).to.deep.equal({
            gameId: 1,
            remainingGuesses: 5,
            canKeepGuessing: true,
            won: false,
            currentPoints: 5,
            guesses: [
              'wrong'.split('').map((letter, index) => ({
                letter,
                index,
                guess: 'wrong',
                isInWord: winningGuess.includes(letter),
                isInCorrectPosition: winningGuess[index] === letter
              }))
            ]
          });
        }));
  });

  describe('POST /game/guess', () => {
    beforeEach(async () => {
      await agent.post('/game/start').send({ guess: 'wrong' });
    });

    afterEach(async () => {
      await db.none('TRUNCATE TABLE games RESTART IDENTITY CASCADE;');
    });

    invalidGuesses.forEach(guess => {
      it(`should return 400 if the guess is not valid (${guess})`, () =>
        agent
          .post('/game/start')
          .send({ guess })
          .then(res => {
            expect(res).to.have.status(400);
          }));
    });

    it("should return 404 if the user doesn't own the game", async () => {
      await db.tx(async t => {
        await t.none(
          `INSERT INTO users (id, username, password_hash) VALUES (2, 'user2', 'hash');`
        );
        await t.none('UPDATE games SET user_id = 2 WHERE user_id = 1;');
      });

      await agent
        .post('/game/guess')
        .send({ gameId: 1, guess: 'tests' })
        .then(res => {
          expect(res).to.have.status(404);
        });
    });

    it('should return 404 if the user has already won the game', async () => {
      await db.none('UPDATE games SET guessed_correctly = TRUE WHERE id = 1;');

      await agent
        .post('/game/guess')
        .send({ gameId: 1, guess: 'tests' })
        .then(res => {
          expect(res).to.have.status(404);
        });
    });

    it('should return 404 if the user has already lost the game', async () => {
      // use up all the guesses
      const guesses = ['polar', 'polka', 'polyp', 'pooch', 'poppy'];
      for (let i = 0; i < 5; i++) {
        await agent
          .post('/game/guess')
          .send({ gameId: 1, guess: guesses[i] })
          .then(res => {
            expect(res).to.have.status(200);
          });
      }

      await agent
        .post('/game/guess')
        .send({ gameId: 1, guess: winningGuess })
        .then(res => {
          expect(res).to.have.status(404);
        });
    });

    it('should return 400 if the user tries the same guess twice', () =>
      agent
        .post('/game/guess')
        .send({ gameId: 1, guess: 'wrong' })
        .then(res => {
          expect(res).to.have.status(400);
        }));

    it('should update the guessed_correctly column if the guess is correct', async () => {
      await agent.post('/game/guess').send({ gameId: 1, guess: winningGuess });

      const { guessed_correctly } = await db.one(
        'SELECT guessed_correctly FROM games WHERE id = 1;'
      );

      expect(guessed_correctly).to.be.true;
    });

    it('should return the feedback for all the guesses in chronological order', () =>
      agent
        .post('/game/guess')
        .send({ gameId: 1, guess: 'polka' })
        .then(res => {
          expect(res).to.have.status(200);
          expect(res.body).to.deep.equal({
            gameId: 1,
            remainingGuesses: 4,
            canKeepGuessing: true,
            won: false,
            currentPoints: 4,
            guesses: [
              'wrong'.split('').map((letter, index) => ({
                letter,
                index,
                guess: 'wrong',
                isInWord: winningGuess.includes(letter),
                isInCorrectPosition: winningGuess[index] === letter
              })),
              'polka'.split('').map((letter, index) => ({
                letter,
                index,
                guess: 'polka',
                isInWord: winningGuess.includes(letter),
                isInCorrectPosition: winningGuess[index] === letter
              }))
            ]
          });
        }));
  });
});
