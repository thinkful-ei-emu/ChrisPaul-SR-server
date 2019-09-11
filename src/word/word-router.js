const express = require('express');
const WordService = require('./word-service');
const LanguageService = require('../language/language-service');
const { requireAuth } = require('../middleware/jwt-auth');
const jsonParser = express.json();

const wordRouter = express.Router();

wordRouter
  .use(requireAuth)

wordRouter
  .post('/', jsonParser, async (req, res, next) => {
    const { language_id, original, translation } = req.body;
    const newWord = { language_id, original, translation };
    const word = await WordService.getWord(
      req.app.get('db'),
      original,
      language_id
    )
    if(word[0] && word[0].original === original){
      return res.status(400).json({ error: 'Word already exists' })
    }
    let lastWord = await WordService.getLastWord(req.app.get('db'), language_id);
    let result = await WordService.addWord(req.app.get('db'), newWord);
    let newNext = { next: result.id };
    let lang = await LanguageService.getLanguage(req.app.get('db'), language_id);
    if(lang.head === null){
      let newHead = { head: result.id };
      await LanguageService.updateLang(req.app.get('db'), theLanguage.id, newHead);
    }
    await WordService.updateWord(req.app.get('db'), lastWord[0].id, newNext)
    res.json(WordService.serializeWord(result));
  });

wordRouter
  .delete('/:word_id', async (req, res, next) => {
    const { word_id } = req.params;
    let prevWord = await WordService.getPrevWord(req.app.get('db'), word_id)
    let currWord = await WordService.getWordByID(req.app.get('db'), word_id);
    let newNext = { next: currWord[0].next }
    await WordService.updateWord(req.app.get('db'), prevWord[0].id, newNext)
    await WordService.deleteWord(
      req.app.get('db'),
      word_id
    )
    res.status(204).end();
  });

module.exports = wordRouter;