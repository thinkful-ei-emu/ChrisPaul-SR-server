const xss = require('xss');
const LanguageService = {
  getUsersLanguage(db, user_id) {
    return db
      .from('language')
      .select(
        'language.id',
        'language.name',
        'language.user_id',
        'language.head',
        'language.total_score'
      )
      .where('language.user_id', user_id)
      .first();
  },
  getUsersLanguages(db, user_id) {
    return db
      .from('language')
      .select(
        'language.id',
        'language.name',
        'language.user_id',
        'language.head',
        'language.total_score'
      )
      .where('language.user_id', user_id);
  },
  getLanguage(db,id){
    return db
      .from('language')
      .select(
        'language.id',
        'language.name',
        'language.user_id',
        'language.head',
        'language.total_score'
      )
      .where('language.id', id)
      .first();
  },
  addLanguage(db,user_id,name){
    return db
      .insert({
        user_id,
        name
      })
      .into('language')
      .returning('*')
      .then(res => res[0]);
  },
  deleteLanguage(db,id){
    return db('language')
      .where({id})
      .delete();
  },
  getLanguageWords(db, language_id) {
    return db
      .from('word')
      .select(
        'id',
        'language_id',
        'original',
        'translation',
        'next',
        'memory_value',
        'correct_count',
        'incorrect_count'
      )
      .where({ language_id });
  },
  getLanguageWord(db, id){
    return db
      .from('word')
      .select(
        'word.id',
        'word.language_id',
        'word.original',
        'word.translation',
        'word.next',
        'word.memory_value',
        'word.correct_count',
        'word.incorrect_count',
        'lan.total_score'
      )
      .where( 'word.id', id )
      .leftJoin(
        'language AS lan',
        'word.language_id',
        'lan.id'
      )
      .groupBy('word.id', 'lan.id');
  },
  updateWord(db, id, newWordData){
    return db
      .from('word')
      .where({ id })
      .update(newWordData);
  },
  updateLang(db, id, newLang){
    return db
      .from('language')
      .where({ id })
      .update(newLang);
  },
  serializeLanguage(lang){
    return{
      id:lang.id,
      name:xss(lang.name),
      total_score:lang.total_score,
      user_id:lang.user_id,
      head:lang.head
    };
  },
  serializeWord(word){
    let safeWord= {
      id: word.id,
      original: xss(word.original),
      translation: xss(word.translation),
      memory_value: word.memory_value,
      incorrect_count: word.incorrect_count,
      correct_count: word.correct_count,
      language_id: word.language_id,
      next: word.next
    };
    if(word.total_score!=null)
      safeWord.total_score=word.total_score;
    return safeWord;
  }

};

module.exports = LanguageService;
