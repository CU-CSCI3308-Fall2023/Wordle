import bcrypt from 'bcryptjs';
import chai, { expect } from 'chai';
import chaiHttp from 'chai-http';
import { before } from 'mocha';

import { server } from '../../../src';
import db from '../../../src/db';

chai.use(chaiHttp);

// TODO: Test that the response contains the desired error messages

const credentials = {
  username: 'test',
  password: 'password'
} as const;

describe('AuthRouter', () => {
  before(async () => {
    const hash = await bcrypt.hash(credentials.password, 10);

    await db.tx(async t => {
      await t.none('DELETE FROM users;');
      await t.none(
        'INSERT INTO users (username, password_hash) VALUES ($1, $2);',
        [credentials.username, hash]
      );
    });
  });

  describe('POST /login', () => {
    it('should log the user in with correct credentials', done => {
      chai
        .request(server)
        .post('/login')
        .send(credentials)
        .end((err, res) => {
          expect(res).to.have.status(200);
          expect(res).to.redirectTo('/');
          expect(res).to.have.cookie('connect.sid');
          done();
        });
    });

    it('should not log the user in with incorrect credentials', done => {
      chai
        .request(server)
        .post('/login')
        .send({ username: credentials.username, password: 'wrongpassword' })
        .end((err, res) => {
          expect(res).to.have.status(401);
          done();
        });
    });

    it('should return 400 if username is missing', done => {
      chai
        .request(server)
        .post('/login')
        .send({ password: credentials.password })
        .end((err, res) => {
          expect(res).to.have.status(400);
          done();
        });
    });

    it('should return 400 if password is missing', done => {
      chai
        .request(server)
        .post('/login')
        .send({ username: credentials.username })
        .end((err, res) => {
          expect(res).to.have.status(400);
          done();
        });
    });

    it('should return 400 if both username and password are missing', done => {
      chai
        .request(server)
        .post('/login')
        .send({})
        .end((err, res) => {
          expect(res).to.have.status(400);
          done();
        });
    });

    it('should return 400 if username is not a string', done => {
      chai
        .request(server)
        .post('/login')
        .send({ username: 123, password: 'password' })
        .end((err, res) => {
          expect(res).to.have.status(400);
          done();
        });
    });

    it('should return 400 if password is not a string', done => {
      chai
        .request(server)
        .post('/login')
        .send({ username: 'test', password: 123 })
        .end((err, res) => {
          expect(res).to.have.status(400);
          done();
        });
    });
  });

  describe('POST /signup', () => {
    it('should sign the user up with new credentials', done => {
      chai
        .request(server)
        .post('/signup')
        .send({ username: 'newuser', password: 'newpassword123' })
        .end((err, res) => {
          expect(res).to.have.status(200);
          expect(res).to.redirectTo('/');
          expect(res).to.have.cookie('connect.sid');
          done();
        });
    });

    it('should not sign the user up with an existing username', done => {
      chai
        .request(server)
        .post('/signup')
        .send(credentials)
        .end((err, res) => {
          expect(res).to.have.status(409);
          done();
        });
    });

    it('should return 400 if username is missing', done => {
      chai
        .request(server)
        .post('/signup')
        .send({ password: credentials.password })
        .end((err, res) => {
          expect(res).to.have.status(400);
          done();
        });
    });

    it('should return 400 if password is missing', done => {
      chai
        .request(server)
        .post('/signup')
        .send({ username: credentials.username })
        .end((err, res) => {
          expect(res).to.have.status(400);
          done();
        });
    });

    it('should return 400 if both username and password are missing', done => {
      chai
        .request(server)
        .post('/signup')
        .send({})
        .end((err, res) => {
          expect(res).to.have.status(400);
          done();
        });
    });

    it('should return 400 if username is not a string', done => {
      chai
        .request(server)
        .post('/signup')
        .send({ username: 123, password: 'password' })
        .end((err, res) => {
          expect(res).to.have.status(400);
          done();
        });
    });

    it('should return 400 if password is not a string', done => {
      chai
        .request(server)
        .post('/signup')
        .send({ username: 'test', password: 123 })
        .end((err, res) => {
          expect(res).to.have.status(400);
          done();
        });
    });
  });
});
