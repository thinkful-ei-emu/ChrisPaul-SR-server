const express = require('express')
const LanguageService = require('./language-service')
const { requireAuth } = require('../middleware/jwt-auth')
const jsonParser = express.json()

const languageRouter = express.Router()

languageRouter
  .use(requireAuth)
  .use(async (req, res, next) => {
    try {
      const language = await LanguageService.getUsersLanguage(
        req.app.get('db'),
        req.user.id
      )
      const languages = await LanguageService.getUsersLanguages(
        req.app.get('db'),
        req.user.id
      )

      if (!language)
        return res.status(404).json({
          error: `You don't have any languages`,
        })

      req.language = language;
      req.languages = languages;
      next()
    } catch (error) {
      next(error)
    }
  })

languageRouter
  .get('/', async (req, res, next) => {
    try {
      const words = await LanguageService.getLanguageWords(
        req.app.get('db'),
        req.language.id,
      )
      const allWords = {};


      for(let i=0;i<req.languages.length;i++){
        const wordsForLang = await LanguageService.getLanguageWords(
          req.app.get('db'),
          req.languages[i].id,
        );
        allWords[req.languages[i].id]=wordsForLang;
      }


      res.json({
        language: req.language,
        languages: req.languages,
        allWords: allWords,
        words,
      })
      next()
    } catch (error) {
      next(error)
    }
  })
  .post('/', jsonParser, async (req, res, next) => {
    try {
      const posted = await LanguageService.addLanguage(
        req.app.get('db'),
        req.user.id,
        req.body.name
      )
      console.log(posted);
      res.status(201).json(posted);
      next();
    }
    catch (error) {
      next(error);
    }
  });

languageRouter
  .get('/head/:langid', jsonParser, async (req, res, next) => {
    try {
      //just in case the language in client is out of sync with server.
      const theLanguage = await LanguageService.getLanguage(
        req.app.get('db'),
        req.params.id
      )
      /* const words = await LanguageService.getLanguageWord(
        req.app.get('db'),
        req.language.head
      ) */
      const words = await LanguageService.getLanguageWord(
        req.app.get('db'),
        //req.language.id,
        theLanguage.head
      )
      const word = {
        nextWord: words[0].original,
        totalScore: words[0].total_score,
        wordCorrectCount: words[0].correct_count,
        wordIncorrectCount: words[0].incorrect_count
      };
      res.json(word)
      next()
    } catch (error) {
      next(error)
    }
  })

languageRouter
  .post('/guess/:langid', jsonParser, async (req, res, next) => {
    if (!req.body.guess) {
      return res.status(400).json({ error: `Missing 'guess' in request body` })
    }
    const words = await LanguageService.getLanguageWords(
      req.app.get('db'),
      //req.language.id,
      req.params.langid
    )

    //Just in case server and client are out of sync
    const theLanguage = await LanguageService.getLanguage(
      req.app.get('db'),
      req.params.langid
    )

    const currWord = await LanguageService.getLanguageWord(
      req.app.get('db'),
      theLanguage.head,
    )
    const nextWord = await LanguageService.getLanguageWord(
      req.app.get('db'),
      currWord[0].next
    )
    const { id, memory_value, correct_count, incorrect_count, translation } = currWord[0];
    let newWord;
    let isCorrect;
    let totalScore;
    let m;
    let newLang;
    console.log(words);
    try {
      if (req.body.guess === translation) {
        if (memory_value * 2 >= words.length) {
          m = words.length - 1;
        } else {
          m = memory_value * 2
        }

        newWord = { next: words[m].next, memory_value: memory_value * 2, correct_count: correct_count + 1, incorrect_count }
        prevWord = { next: id }
        newLang = { head: nextWord[0].id, total_score: theLanguage.total_score + 1 }
        isCorrect = true;
        totalScore = nextWord[0].total_score + 1;
      } else {
        newWord = { next: words[1].next, memory_value: 1, correct_count, incorrect_count: incorrect_count + 1 }
        prevWord = { next: id }
        newLang = { head: nextWord[0].id }
        isCorrect = false;
        totalScore = nextWord[0].total_score;
        m = 1;
      }
      await LanguageService.updateWord(req.app.get('db'), id, newWord)
      await LanguageService.updateWord(req.app.get('db'), words[m].id, prevWord)

      await LanguageService.updateLang(
        req.app.get('db'),
        theLanguage.id,
        newLang
      )
      res.json({
        answer: translation,
        isCorrect,
        nextWord: nextWord[0].original,
        totalScore,
        wordCorrectCount: nextWord[0].correct_count,
        wordIncorrectCount: nextWord[0].incorrect_count
      })
      next()
    }
    catch (error) {
      next(error)
    }
  })

module.exports = languageRouter
