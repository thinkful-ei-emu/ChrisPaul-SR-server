const xss = require('xss');

const WordService = {
  getWord(db, original, language_id) {
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
      .where({ original, language_id });
  },
  getWordByID(db, id) {
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
      .where({ id });
  },
  getLastWord(db, language_id) {
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
      .where({ language_id, next: null });
  },
  getPrevWord(db, next) {
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
      .where({ next });
  },
  addWord(db, newWord){
    return db('word')
      .insert(newWord)
      .returning('*')
      .then(res => res[0]);
  },
  updateWord(db, id, newWordData){
    return db
      .from('word')
      .where({ id })
      .update(newWordData);
  },
  deleteWord(db, id){
    return db('word')
      .where({ id })
      .delete();
  },
  serializeWord(word){
    return {
      id: word.id,
      original: xss(word.original),
      translation: xss(word.translation),
      memory_value: word.memory_value,
      incorrect_count: word.incorrect_count,
      correct_count: word.correct_count,
      language_id: word.language_id,
      next: word.next
    }
  }
};

module.exports = WordService;