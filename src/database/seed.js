import { supabase } from '../supabase/config';

// Função para gerar um ID único
const generateUniqueId = () => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
};

// Inserir algumas palavras de exemplo
const words = [
  { 
    id: generateUniqueId(),
    word: 'Hello',
    translation: 'Olá',
    created_at: new Date().toISOString()
  },
  { 
    id: generateUniqueId(),
    word: 'World',
    translation: 'Mundo',
    created_at: new Date().toISOString()
  },
  { 
    id: generateUniqueId(),
    word: 'Computer',
    translation: 'Computador',
    created_at: new Date().toISOString()
  }
];

async function seedDatabase() {
  try {
    const { data, error } = await supabase
      .from('words')
      .insert(words)
      .select();

    if (error) throw error;
    console.log('Dados iniciais inseridos com sucesso!');
  } catch (error) {
    console.error('Erro ao inserir dados iniciais:', error.message);
  }
}

seedDatabase(); 