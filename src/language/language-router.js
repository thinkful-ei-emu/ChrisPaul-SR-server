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
      res.status(201).json(posted);
      next();
    }
    catch (error) {
      next(error);
    }
  })
  .delete('/:id',async (req, res, next) => {
    try{
      const deleted = await LanguageService.deleteLanguage(
        req.app.get('db'),
        req.params.id
      )
      res.status(204).json({success:true});
      next();
    }
    catch(error){
      next(error);
    }
  });

languageRouter
  .get('/head/:langid', async (req, res, next) => {
    try {
      //just in case the language in client is out of sync with server.
      const theLanguage = await LanguageService.getLanguage(
        req.app.get('db'),
        req.params.langid
      )
      /* const words = await LanguageService.getLanguageWord(
        req.app.get('db'),
        req.language.head
      ) */
      console.log(theLanguage);
      if(theLanguage.head===null){
        return res.status(404).json({ error:'The head is null'});
      }
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

function getMthWordId(wordsObj,head,m){
  while(m>0 && head){
    head=wordsObj[head];
    m--;
  }
  return head;
}

function printIds(wordsObj,head){
  let str=''
  while(head!==null){
    str+=head+' --> ';
    head=wordsObj[head];
  }
  console.log(str);
}
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
    if(words.length===0){
      return res.status(404).json({ error:'No words exist'})
    }
    const wordsObj={};
    words.forEach(word=>{
      wordsObj[word.id]=word.next;
    });
    const theLanguage = await LanguageService.getLanguage(
      req.app.get('db'),
      req.params.langid
    )
    //printIds(wordsObj,theLanguage.head);

    let currWord = await LanguageService.getLanguageWord(
      req.app.get('db'),
      theLanguage.head,
    );
    let nextWord = (words.length!==1)?await LanguageService.getLanguageWord(
      req.app.get('db'),
      currWord[0].next
    ):
    currWord[0];
    currWord=currWord[0];
    nextWord=nextWord[0];
    /* const { id, memory_value, correct_count, incorrect_count, translation } = currWord; */
    const {memory_value, translation, correct_count,incorrect_count} = currWord;
    let newWord={};
    let isCorrect;
    let totalScore=theLanguage.total_score;
    let m;
    try {
      if (req.body.guess === translation) {
        if (((memory_value * 2) >= words.length)) {
          m = words.length - 1;
        } else {
          m = memory_value * 2
        }
        isCorrect = true;
        totalScore++;
        newWord.correct_count=correct_count+1;
      } else {
        m = 1;
        isCorrect = false;
        newWord.incorrect_count=incorrect_count+1;
      }

      if(words.length===1){
        await LanguageService.updateLang(
          req.app.get('db'),
          theLanguage.id,
          {
            total_score:totalScore
          }
        );
        newWord.next=null;
        newWord.memory_value=1;
        await LanguageService.updateWord(req.app.get('db'), currWord.id, newWord)
        if(words.length!==1){
          await LanguageService.updateWord(req.app.get('db'), idOfNodeInNewSpot, {next:currWord.id})
        }
        res.json({
          answer: currWord.translation,
          isCorrect,
          nextWord: currWord.original,
          totalScore,
          wordCorrectCount: newWord.correct_count?newWord.correct_count:currWord.correct_count,
          wordIncorrectCount: newWord.incorrect_count?newWord.incorrect_count:currWord.incorrect_count
        })
        next()
      }

      else{
        const newLang={
          head:nextWord.id,
          total_score:totalScore
        }
        await LanguageService.updateLang(
          req.app.get('db'),
          theLanguage.id,
          newLang
        )
        
  
        const idOfNodeInNewSpot=getMthWordId(wordsObj,theLanguage.head,m);
        //console.log(idOfNodeInNewSpot)
        newWord.next=wordsObj[idOfNodeInNewSpot];
        newWord.memory_value=m;
        await LanguageService.updateWord(req.app.get('db'), currWord.id, newWord)
        await LanguageService.updateWord(req.app.get('db'), idOfNodeInNewSpot, {next:currWord.id})
        //for manual testing
        /* const words2 = await LanguageService.getLanguageWords(
          req.app.get('db'),
          //req.language.id,
          req.params.langid
        )
        const wordsObj2={};
        words2.forEach(word=>{
          wordsObj2[word.id]=word.next;
        });
        const theLanguage2 = await LanguageService.getLanguage(
          req.app.get('db'),
          req.params.langid
        )
        printIds(wordsObj2,theLanguage2.head); */
        res.json({
          answer: currWord.translation,
          isCorrect,
          nextWord: nextWord.original,
          totalScore,
          wordCorrectCount: nextWord.correct_count,
          wordIncorrectCount: nextWord.incorrect_count
        })
        next()
      }
      
    }
    catch (error) {
      next(error)
    }
  })

module.exports = languageRouter
