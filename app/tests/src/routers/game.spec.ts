import bcrypt from 'bcryptjs';
import chai, { expect } from 'chai';
import chaiHttp from 'chai-http';

import { server } from '../../../src';
import db from '../../../src/db';

chai.use(chaiHttp);

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
      await t.none('INSERT INTO words (id, word) VALUES (1, $1);', ['right']);
    });
  });

  describe('POST /game/start', () => {
    const invalidGuesses = ['looooong', 'shrt', '12345'];

    invalidGuesses.forEach(guess => {
      it(`should return 400 if the guess is not valid (${guess})`, done => {
        agent
          .post('/game/start')
          .send({ guess })
          .end((err, res) => {
            expect(res).to.have.status(400);
            done();
          });
      });
    });

    it('should not use words that the user has already guessed', async () => {
      await db.none(
        'INSERT INTO games (user_id, word_id, guessed_correctly) VALUES (1, 1, TRUE);'
      );

      // since we only have one word, the game should fail to start
      await agent
        .post('/game/start')
        .send({ guess: 'right' })
        .then(res => {
          expect(res).to.have.status(418);
        });

      await db.none('TRUNCATE TABLE games RESTART IDENTITY CASCADE;');
    });

    it('should return the correct response if the first guess is correct', done => {
      agent
        .post('/game/start')
        .send({ guess: 'tests' })
        .end((err, res) => {
          expect(res).to.have.status(200);
          expect(res.body).to.deep.equal({
            gameId: 1,
            remainingGuesses: 0,
            canKeepGuessing: false,
            won: true,
            currentPoints: 6,
            guesses: [
              'right'.split('').map((letter, index) => ({
                letter,
                index,
                guess: 'right',
                isInWord: true,
                isInCorrectPosition: true
              }))
            ]
          });
          done();
        });
    });

    it('should return the correct response if the first guess is incorrect', done => {
      agent
        .post('/game/start')
        .send({ guess: 'wrong' })
        .end((err, res) => {
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
                isInWord: false,
                isInCorrectPosition: false
              }))
            ]
          });
          done();
        });
    });
  });

  describe('POST /game/guess', () => {
    it.skip('should return 400 if the guess is not valid');
    it.skip("should return 404 if the user doesn't own the game");
    it.skip('should return 404 if the user has already won the game');
    it.skip('should return 404 if the user has already lost the game');
    it.skip('should return 400 if the user tries the same guess twice');
    it.skip('should ignore the case of the guess');
    it.skip(
      'should update the guessed_correctly column if the guess is correct'
    );
    it.skip(
      'should return the feedback for all the guesses in chronological order'
    );
    it.skip('should compute the points based on the number of guesses');
    it.skip('should return if the user can still guess');
  });
});
