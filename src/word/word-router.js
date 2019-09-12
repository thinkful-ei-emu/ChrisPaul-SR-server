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
    try{
      const { language_id, original, translation } = req.body.word;
      const newWord = { language_id, original, translation };
      for(let [key, value] of Object.entries(newWord)){
        if(!value){
          return res.status(400).json({ error: `You must provide a ${key}` })
        }
      }
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
        await LanguageService.updateLang(req.app.get('db'), lang.id, newHead);
      }
      if(lastWord[0]){
        await WordService.updateWord(req.app.get('db'), lastWord[0].id, newNext)
      }
      res.json(WordService.serializeWord(result));
    }
    catch(e){
      next(e)
    }
  });

wordRouter
  .delete('/:word_id', async (req, res, next) => {
    const { word_id } = req.params;
    try{
    let prevWord = await WordService.getPrevWord(req.app.get('db'), word_id)
    let currWord = await WordService.getWordByID(req.app.get('db'), word_id);
    let userLangs = await LanguageService.getUsersLanguages(req.app.get('db'), req.user.id)
    if(!currWord[0]){
      return res.status(400).json({ error: `Word is already deleted`})
    }
    let lang = userLangs.find(e => e.id === currWord[0].language_id)
    if(!lang) {
      return res.status(400).json({ error: `Language doesn't exist`})
    }
    if(lang.user_id !== req.user.id){
      return res.status(401).json({ error: 'Unauthorized request' })
    }
    if(lang.head === currWord[0].id){
      const newLang={ head:currWord[0].next }
      await LanguageService.updateLang(
        req.app.get('db'),
        lang.id,
        newLang
      )
    }
    let newNext = { next: currWord[0].next }
    if(prevWord[0]){
    await WordService.updateWord(req.app.get('db'), prevWord[0].id, newNext)
    }
    await WordService.deleteWord(
      req.app.get('db'),
      word_id
    )
    res.status(204).end();
    }
    catch(e) {
      next(e)
    }
  });

module.exports = wordRouter;