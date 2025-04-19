const STORAGE_KEY = 'vocabulary_words';

// Função auxiliar para obter palavras do localStorage
const getWordsFromStorage = () => {
  const words = localStorage.getItem(STORAGE_KEY);
  return words ? JSON.parse(words) : [];
};

// Função auxiliar para salvar palavras no localStorage
const saveWordsToStorage = (words) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(words));
};

// Função para gerar um ID único
const generateUniqueId = () => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
};

export const wordService = {
  // Adicionar uma nova palavra
  async addWord(wordData) {
    try {
      const words = getWordsFromStorage();
      const newWord = {
        id: generateUniqueId(),
        ...wordData,
        created_at: new Date().toISOString()
      };
      words.push(newWord);
      saveWordsToStorage(words);
      return newWord;
    } catch (error) {
      console.error('Erro ao adicionar palavra:', error.message);
      throw error;
    }
  },

  // Buscar todas as palavras
  async getWords() {
    try {
      const words = getWordsFromStorage();
      return words.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    } catch (error) {
      console.error('Erro ao buscar palavras:', error.message);
      throw error;
    }
  },

  // Atualizar uma palavra
  async updateWord(id, wordData) {
    try {
      const words = getWordsFromStorage();
      const index = words.findIndex(word => word.id === id);
      if (index === -1) throw new Error('Palavra não encontrada');
      
      words[index] = {
        ...words[index],
        ...wordData,
        id // Manter o ID original
      };
      
      saveWordsToStorage(words);
      return words[index];
    } catch (error) {
      console.error('Erro ao atualizar palavra:', error.message);
      throw error;
    }
  },

  // Deletar uma palavra
  async deleteWord(id) {
    try {
      const words = getWordsFromStorage();
      const wordToDelete = words.find(word => word.id === id);
      if (!wordToDelete) {
        throw new Error('Palavra não encontrada');
      }
      
      const filteredWords = words.filter(word => word.id !== id);
      if (filteredWords.length === words.length) {
        throw new Error('Palavra não foi encontrada para exclusão');
      }
      
      saveWordsToStorage(filteredWords);
      return true;
    } catch (error) {
      console.error('Erro ao deletar palavra:', error.message);
      throw error;
    }
  },

  // Deletar todas as palavras
  async deleteAllWords() {
    try {
      localStorage.removeItem(STORAGE_KEY);
      return true;
    } catch (error) {
      console.error('Erro ao deletar todas as palavras:', error.message);
      throw error;
    }
  }
}; 