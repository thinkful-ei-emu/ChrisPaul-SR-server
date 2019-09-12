/* global supertest */
const app = require('../src/app');
const helpers = require('./test-helpers');

describe('Word Endpoints', function () {
  let db;

  const testUsers = helpers.makeUsersArray();
  const [testUser] = testUsers;
  const [testLanguages, testWords] = helpers.makeLanguagesAndWords(testUser);

  before('make knex instance', () => {
    db = helpers.makeKnexInstance();
    app.set('db', db);
  });

  after('disconnect from db', () => db.destroy());

  before('cleanup', () => helpers.cleanTables(db));

  afterEach('cleanup', () => helpers.cleanTables(db));

  /**
   * @description Submit a new guess for the language
   **/
  describe('POST /api/word', () => {
    context('Given there are no words in the language', () => {
      beforeEach('insert users, languages and words', () => {
        return helpers.seedUsersLanguages(
          db,
          testUsers,
          testLanguages
        );
      });

      it('responds with 400 required error when the body is incorrect', () => {
        const postBody = {
          word: {
            randomField: 'test random field'
          }
        };

        return supertest(app)
          .post('/api/word')
          .set('Authorization', helpers.makeAuthHeader(testUser))
          .send(postBody)
          .expect(400, { error: 'You must provide a language_id' });
      });
      it('responds with 400 required error when missing a language_id', () => {
        const postBody = {
          word: {
            original: 'queso',
            translation: 'cheese'
          }
        };

        return supertest(app)
          .post('/api/word')
          .set('Authorization', helpers.makeAuthHeader(testUser))
          .send(postBody)
          .expect(400, { error: 'You must provide a language_id' });
      });
      it('responds with 400 required error when missing a translation', () => {
        const postBody = {
          word: {
            language_id: 1,
            original: 'queso'
          }
        };

        return supertest(app)
          .post('/api/word')
          .set('Authorization', helpers.makeAuthHeader(testUser))
          .send(postBody)
          .expect(400, { error: 'You must provide a translation' });
      });
      it('responds with 400 required error when missing a original', () => {
        const postBody = {
          word: {
            language_id: 1,
            translation: 'queso'
          }
        };

        return supertest(app)
          .post('/api/word')
          .set('Authorization', helpers.makeAuthHeader(testUser))
          .send(postBody)
          .expect(400, { error: 'You must provide a original' });
      });
      it('responds with 200 when the correct information is in the body', () => {
        const postBody = {
          word: {
            language_id: 1,
            original: 'queso',
            translation: 'cheese'
          }
        };

        return supertest(app)
          .post('/api/word')
          .set('Authorization', helpers.makeAuthHeader(testUser))
          .send(postBody)
          .expect(200);
      });
    });
    context('Given there are words in the language already', () => {
      beforeEach('insert users, languages and words', () => {
        return helpers.seedUsersLanguagesWords(
          db,
          testUsers,
          testLanguages,
          testWords
        );
      });

      it('responds with 400 required error when the body is incorrect', () => {
        const postBody = {
          word: {
            randomField: 'test random field'
          }
        };

        return supertest(app)
          .post('/api/word')
          .set('Authorization', helpers.makeAuthHeader(testUser))
          .send(postBody)
          .expect(400, { error: 'You must provide a language_id' });
      });
      it('responds with 400 required error when missing a language_id', () => {
        const postBody = {
          word: {
            original: 'queso',
            translation: 'cheese'
          }
        };

        return supertest(app)
          .post('/api/word')
          .set('Authorization', helpers.makeAuthHeader(testUser))
          .send(postBody)
          .expect(400, { error: 'You must provide a language_id' });
      });
      it('responds with 400 required error when missing a translation', () => {
        const postBody = {
          word: {
            language_id: 1,
            original: 'queso'
          }
        };

        return supertest(app)
          .post('/api/word')
          .set('Authorization', helpers.makeAuthHeader(testUser))
          .send(postBody)
          .expect(400, { error: 'You must provide a translation' });
      });
      it('responds with 400 required error when missing a original', () => {
        const postBody = {
          word: {
            language_id: 1,
            translation: 'queso'
          }
        };

        return supertest(app)
          .post('/api/word')
          .set('Authorization', helpers.makeAuthHeader(testUser))
          .send(postBody)
          .expect(400, { error: 'You must provide a original' });
      });
      it('responds with 400 when the word already exists in the database', () => {
        const postBody = {
          word: {
            language_id: testWords[0].language_id,
            original: testWords[0].original,
            translation: testWords[0].translation
          }
        };

        return supertest(app)
          .post('/api/word')
          .set('Authorization', helpers.makeAuthHeader(testUser))
          .send(postBody)
          .expect(400, { error: 'Word already exists' });
      });
      it('responds with 200 when the correct information is in the body', () => {
        const postBody = {
          word: {
            language_id: 1,
            original: 'queso',
            translation: 'cheese'
          }
        };

        return supertest(app)
          .post('/api/word')
          .set('Authorization', helpers.makeAuthHeader(testUser))
          .send(postBody)
          .expect(200);
      });
    });
  });

  describe('DELETE /api/word', () => {
    beforeEach('insert users, languages and words', () => {
      return helpers.seedUsersLanguagesWords(
        db,
        testUsers,
        testLanguages,
        testWords
      );
    });

    it('resonds with an error when the word does not exist', () => {
      return supertest(app)
        .delete('/api/word/6')
        .set('Authorization', helpers.makeAuthHeader(testUser))
        .expect(400);
    });
    it('responds with 204 when the language head has been deleted', () => {
      return supertest(app)
        .delete('/api/word/1')
        .set('Authorization', helpers.makeAuthHeader(testUser))
        .expect(204);
    });
    it('responds with 204 when non lanugage head words are deleted', () => {
      return supertest(app)
        .delete('/api/word/3')
        .set('Authorization', helpers.makeAuthHeader(testUser))
        .expect(204);
    });
  });
});