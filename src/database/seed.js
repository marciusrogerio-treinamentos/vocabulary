const STORAGE_KEY = 'vocabulary_words';

// Inserir algumas palavras de exemplo
const words = [
  { 
    id: Date.now(),
    english: 'Hello',
    portuguese: 'Olá',
    created_at: new Date().toISOString()
  },
  { 
    id: Date.now() + 1,
    english: 'World',
    portuguese: 'Mundo',
    created_at: new Date().toISOString()
  },
  { 
    id: Date.now() + 2,
    english: 'Computer',
    portuguese: 'Computador',
    created_at: new Date().toISOString()
  }
];

try {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(words));
  console.log('Dados iniciais inseridos com sucesso!');
} catch (error) {
  console.error('Erro ao inserir dados iniciais:', error.message);
} 