import { supabase } from '../supabase/config';

// Função para gerar um ID único
const generateUniqueId = () => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
};

export const wordService = {
  // Adicionar uma nova palavra
  async addWord(wordData) {
    try {
      const newWord = {
        id: generateUniqueId(),
        ...wordData,
        created_at: new Date().toISOString()
      };
      
      const { data, error } = await supabase
        .from('words')
        .insert([newWord])
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Erro ao adicionar palavra:', error.message);
      throw error;
    }
  },

  // Buscar todas as palavras
  async getWords() {
    try {
      const { data, error } = await supabase
        .from('words')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Erro ao buscar palavras:', error.message);
      throw error;
    }
  },

  // Atualizar uma palavra
  async updateWord(id, wordData) {
    try {
      const { data, error } = await supabase
        .from('words')
        .update(wordData)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      if (!data) throw new Error('Palavra não encontrada');
      
      return data;
    } catch (error) {
      console.error('Erro ao atualizar palavra:', error.message);
      throw error;
    }
  },

  // Deletar uma palavra
  async deleteWord(id) {
    try {
      const { error } = await supabase
        .from('words')
        .delete()
        .eq('id', id);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Erro ao deletar palavra:', error.message);
      throw error;
    }
  },

  // Deletar todas as palavras
  async deleteAllWords() {
    try {
      const { error } = await supabase
        .from('words')
        .delete()
        .neq('id', 'dummy'); // Deleta todas as palavras

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Erro ao deletar todas as palavras:', error.message);
      throw error;
    }
  }
}; 