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
        req.user.id,
      )

      if (!language)
        return res.status(404).json({
          error: `You don't have any languages`,
        })

      req.language = language
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

      res.json({
        language: req.language,
        words,
      })
      next()
    } catch (error) {
      next(error)
    }
  })

languageRouter
  .get('/head', jsonParser, async (req, res, next) => {
    try{
    const words = await LanguageService.getLanguageWord(
      req.app.get('db'),
      req.language.head
    )
    const word = words[0];
    res.json(word)
    next()
  } catch (error) {
    next(error)
  }
  })

languageRouter
  .post('/guess', jsonParser, async (req, res, next) => {
    if(!req.body.guess){
      return res.status(400).json({ error: `Missing 'guess' in request body` })
    }
    console.log(req.body)
    // implement me
    res.send('implement me!')
  })

module.exports = languageRouter
