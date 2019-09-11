const express = require('express');
const WordService = require('./word-service');
const LanguageService = require('../language/language-service');
const { requireAuth } = require('../middleware/jwt-auth');
const jsonParser = express.json();

const wordRouter = express.Router();

wordRouter
  .use(requireAuth)
  .use(async (req, res, next) => {
    try {
      const language = await LanguageService.getUsersLanguage(
        req.app.get('db'),
        req.user.id
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
  });

wordRouter
  .post('/', jsonParser, async (req, res, next) => {
    const { language_id, original, translation } = req.body;
    const newWord = { language_id, original, translation };
    const word = await WordService.getWord(
      req.app.get('db'),
      original,
      language_id
    )
    if(word.original === original){
      res.status(400).json({ error: 'Word already exists' })
    }
    let result = await WordService.addWord(req.app.get('db'), newWord)
    res.json(result);
  });

wordRouter
  .delete('/:word_id', (req, res, next) => {
    const { word_id } = req.params;
    console.log(word_id)
    WordService.deleteWord(
      req.app.get('db'),
      word_id
    )
    .then(() => res.status(204).end())
    .catch(next);
  });

module.exports = wordRouter;