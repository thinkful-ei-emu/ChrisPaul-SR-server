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
    const [testLanguage] = testLanguages;
    const testLanguagesWords = testWords.filter(
      w => w.language_id === testLanguage.id
    );

    beforeEach('insert users, languages and words', () => {
      return helpers.seedUsersLanguagesWords(
        db,
        testUsers,
        testLanguages,
        testWords
      );
    });

    it('responds with 400 required error when \'guess\' is missing', () => {
      const postBody = {
        word: {
          randomField: 'test random field'
        }
      };

      return supertest(app)
        .post('/api/word')
        .set('Authorization', helpers.makeAuthHeader(testUser))
        .send(postBody)
        .expect(400, { error: 'You must provide a language, original word and translated word' });
    });
  });

  describe.skip('DELETE /api/word', () => {

  });
});