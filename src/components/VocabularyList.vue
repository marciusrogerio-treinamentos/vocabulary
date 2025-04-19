<script setup>
import { ref, computed, onMounted } from 'vue'
import { wordService } from '../services/wordService'
import * as XLSX from 'xlsx'

const words = ref([])
const loading = ref(true)
const error = ref(null)
const search = ref('')
const sortBy = ref('word')
const sortDesc = ref(false)
const currentPage = ref(1)
const itemsPerPage = ref(10)
const showAddModal = ref(false)
const showEditModal = ref(false)
const newWord = ref({
  word: '',
  translation: ''
})
const editingWord = ref(null)
const fileInput = ref(null)

// Carregar palavras
const loadWords = async () => {
  try {
    loading.value = true
    words.value = await wordService.getWords()
    console.log('Palavras carregadas:', words.value)
  } catch (error) {
    console.error('Erro ao carregar palavras:', error)
    error.value = 'Erro ao carregar palavras. Por favor, tente novamente.'
  } finally {
    loading.value = false
  }
}

// Filtrar e ordenar palavras
const filteredWords = computed(() => {
  let result = [...words.value]

  // Aplicar filtro de busca
  if (search.value) {
    const searchLower = search.value.toLowerCase().trim()
    console.log('Buscando por:', searchLower)
    result = result.filter(word => {
      const wordMatch = word.word?.toLowerCase().includes(searchLower) || false
      const translationMatch = word.translation?.toLowerCase().includes(searchLower) || false
      console.log(`Palavra: ${word.word}, Tradução: ${word.translation}, Match: ${wordMatch || translationMatch}`)
      return wordMatch || translationMatch
    })
  }

  // Aplicar ordenação
  result.sort((a, b) => {
    const aValue = a[sortBy.value] || ''
    const bValue = b[sortBy.value] || ''
    const modifier = sortDesc.value ? -1 : 1
    return aValue.localeCompare(bValue) * modifier
  })

  return result
})

// Paginação
const totalPages = computed(() => 
  Math.ceil(filteredWords.value.length / itemsPerPage.value)
)

const paginatedWords = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage.value
  const end = start + itemsPerPage.value
  return filteredWords.value.slice(start, end)
})

// Ordenação
const sort = (field) => {
  if (sortBy.value === field) {
    sortDesc.value = !sortDesc.value
  } else {
    sortBy.value = field
    sortDesc.value = false
  }
}

// Adicionar palavra
const addWord = async () => {
  try {
    await wordService.addWord(newWord.value)
    await loadWords()
    closeModal()
  } catch (error) {
    console.error('Erro ao adicionar palavra:', error)
  }
}

// Editar palavra
const editWord = (word) => {
  editingWord.value = { ...word }
  newWord.value = { ...word }
  showEditModal.value = true
}

const updateWord = async () => {
  try {
    await wordService.updateWord(editingWord.value.id, newWord.value)
    await loadWords()
    closeModal()
  } catch (error) {
    console.error('Erro ao atualizar palavra:', error)
  }
}

// Excluir palavra
const deleteWord = async (word) => {
  if (confirm('Tem certeza que deseja excluir esta palavra?')) {
    try {
      await wordService.deleteWord(word.id)
      await loadWords()
    } catch (error) {
      console.error('Erro ao excluir palavra:', error)
    }
  }
}

// Excluir todas as palavras
const deleteAllWords = async () => {
  if (confirm('Tem certeza que deseja excluir TODAS as palavras? Esta ação não pode ser desfeita.')) {
    try {
      await wordService.deleteAllWords()
      await loadWords()
    } catch (error) {
      console.error('Erro ao excluir todas as palavras:', error)
    }
  }
}

// Importar arquivo
const importFile = () => {
  fileInput.value.click()
}

const handleFileUpload = async (event) => {
  const file = event.target.files[0]
  if (!file) return

  try {
    const fileExtension = file.name.split('.').pop().toLowerCase()
    
    if (fileExtension === 'csv') {
      const text = await file.text()
      const rows = text.split('\n').map(row => row.split(','))
      const data = rows.slice(1)

      for (const row of data) {
        if (row.length >= 2) {
          await wordService.addWord({
            word: row[0].trim(),
            translation: row[1].trim()
          })
        }
      }
    } else if (fileExtension === 'xlsx' || fileExtension === 'xls') {
      const data = await file.arrayBuffer()
      const workbook = XLSX.read(data)
      const worksheet = workbook.Sheets[workbook.SheetNames[0]]
      const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: ['word', 'translation'] })
      
      // Pular o cabeçalho
      for (const row of jsonData.slice(1)) {
        if (row.word && row.translation) {
          await wordService.addWord({
            word: row.word.toString().trim(),
            translation: row.translation.toString().trim()
          })
        }
      }
    }

    await loadWords()
    event.target.value = null
  } catch (error) {
    console.error('Erro ao importar arquivo:', error)
  }
}

// Exportar arquivo
const exportFile = (format) => {
  const headers = ['Palavra', 'Tradução']
  const rows = filteredWords.value.map(word => [
    word.word,
    word.translation
  ])

  if (format === 'csv') {
    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = 'vocabulario.csv'
    link.click()
  } else if (format === 'xlsx') {
    const worksheet = XLSX.utils.aoa_to_sheet([headers, ...rows])
    const workbook = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Vocabulário')
    XLSX.writeFile(workbook, 'vocabulario.xlsx')
  }
}

// Fechar modal
const closeModal = () => {
  showAddModal.value = false
  showEditModal.value = false
  newWord.value = {
    word: '',
    translation: ''
  }
  editingWord.value = null
}

// Carregar palavras ao montar o componente
onMounted(loadWords)
</script>

<template>
  <div class="vocabulary-list">
    <div v-if="error" class="alert alert-error">
      {{ error }}
    </div>

    <div class="card">
      <div class="card-header">
        <div class="word-count">
          Total de palavras: {{ words.length }}
        </div>
        <div class="controls">
          <div class="select-wrapper">
            <select v-model="itemsPerPage" class="select">
              <option value="10">10 por página</option>
              <option value="25">25 por página</option>
              <option value="50">50 por página</option>
            </select>
          </div>
          <div class="actions">
            <div class="dropdown">
              <button class="btn btn-secondary" @click="importFile">
                <svg xmlns="http://www.w3.org/2000/svg" class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                  <polyline points="17 8 12 3 7 8"/>
                  <line x1="12" y1="3" x2="12" y2="15"/>
                </svg>
                Importar
              </button>
              <div class="dropdown-menu">
                <button class="dropdown-item" @click="importFile">CSV</button>
                <button class="dropdown-item" @click="importFile">Excel</button>
              </div>
            </div>
            <div class="dropdown">
              <button class="btn btn-secondary" @click="exportFile('csv')">
                <svg xmlns="http://www.w3.org/2000/svg" class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                  <polyline points="7 10 12 15 17 10"/>
                  <line x1="12" y1="15" x2="12" y2="3"/>
                </svg>
                Exportar
              </button>
              <div class="dropdown-menu">
                <button class="dropdown-item" @click="exportFile('csv')">CSV</button>
                <button class="dropdown-item" @click="exportFile('xlsx')">Excel</button>
              </div>
            </div>
            <button class="btn btn-primary" @click="showAddModal = true">
              <svg xmlns="http://www.w3.org/2000/svg" class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <line x1="12" y1="5" x2="12" y2="19"/>
                <line x1="5" y1="12" x2="19" y2="12"/>
              </svg>
              Nova Palavra
            </button>
            <button class="btn btn-danger" @click="deleteAllWords" :disabled="words.length === 0">
              <svg xmlns="http://www.w3.org/2000/svg" class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M3 6h18"/>
                <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/>
                <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/>
                <line x1="10" y1="11" x2="10" y2="17"/>
                <line x1="14" y1="11" x2="14" y2="17"/>
              </svg>
              Excluir Todos
            </button>
          </div>
        </div>

        <div class="filters">
          <div class="search-wrapper">
            <svg xmlns="http://www.w3.org/2000/svg" class="search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="11" cy="11" r="8"/>
              <line x1="21" y1="21" x2="16.65" y2="16.65"/>
            </svg>
            <input type="text" v-model="search" placeholder="Buscar..." class="search-input">
          </div>
        </div>
      </div>

      <div class="card-body">
        <div v-if="loading" class="loading">
          <svg class="spinner" viewBox="0 0 50 50">
            <circle class="path" cx="25" cy="25" r="20" fill="none" stroke-width="5"></circle>
          </svg>
          <span>Carregando...</span>
        </div>

        <div v-else-if="filteredWords.length === 0" class="empty-state">
          <svg xmlns="http://www.w3.org/2000/svg" class="empty-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
            <polyline points="7 10 12 15 17 10"/>
            <line x1="12" y1="15" x2="12" y2="3"/>
          </svg>
          <p>Nenhuma palavra encontrada</p>
          <button class="btn btn-primary" @click="showAddModal = true">
            <svg xmlns="http://www.w3.org/2000/svg" class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <line x1="12" y1="5" x2="12" y2="19"/>
              <line x1="5" y1="12" x2="19" y2="12"/>
            </svg>
            Adicionar Palavra
          </button>
        </div>

        <table v-else class="table">
          <thead>
            <tr>
              <th @click="sort('word')" :class="{ active: sortBy === 'word' }">
                Palavra
                <svg v-if="sortBy === 'word'" xmlns="http://www.w3.org/2000/svg" class="sort-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="m18 15-6-6-6 6"/>
                </svg>
              </th>
              <th @click="sort('translation')" :class="{ active: sortBy === 'translation' }">
                Tradução
                <svg v-if="sortBy === 'translation'" xmlns="http://www.w3.org/2000/svg" class="sort-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="m18 15-6-6-6 6"/>
                </svg>
              </th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="word in paginatedWords" :key="word.id">
              <td>{{ word.word }}</td>
              <td>{{ word.translation }}</td>
              <td>
                <div class="actions">
                  <button class="btn btn-icon" @click="editWord(word)">
                    <svg xmlns="http://www.w3.org/2000/svg" class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                      <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/>
                    </svg>
                  </button>
                  <button class="btn btn-icon" @click="deleteWord(word)">
                    <svg xmlns="http://www.w3.org/2000/svg" class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                      <path d="M3 6h18"/>
                      <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/>
                      <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/>
                    </svg>
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div class="card-footer">
        <div class="pagination">
          <button class="btn btn-icon" :disabled="currentPage === 1" @click="currentPage = 1">
            <svg xmlns="http://www.w3.org/2000/svg" class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="m11 17-5-5 5-5"/>
              <path d="m18 17-5-5 5-5"/>
            </svg>
          </button>
          <button class="btn btn-icon" :disabled="currentPage === 1" @click="currentPage--">
            <svg xmlns="http://www.w3.org/2000/svg" class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="m15 18-6-6 6-6"/>
            </svg>
          </button>
          <span class="pagination-info">
            Página {{ currentPage }} de {{ totalPages }}
          </span>
          <button class="btn btn-icon" :disabled="currentPage === totalPages" @click="currentPage++">
            <svg xmlns="http://www.w3.org/2000/svg" class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="m9 18 6-6-6-6"/>
            </svg>
          </button>
          <button class="btn btn-icon" :disabled="currentPage === totalPages" @click="currentPage = totalPages">
            <svg xmlns="http://www.w3.org/2000/svg" class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="m13 17 5-5-5-5"/>
              <path d="m6 17 5-5-5-5"/>
            </svg>
          </button>
        </div>
      </div>
    </div>

    <!-- Modal Adicionar/Editar -->
    <div v-if="showAddModal || showEditModal" class="modal-overlay" @click="closeModal">
      <div class="modal" @click.stop>
        <div class="modal-header">
          <h2>{{ showAddModal ? 'Adicionar Palavra' : 'Editar Palavra' }}</h2>
          <button class="btn btn-icon" @click="closeModal">
            <svg xmlns="http://www.w3.org/2000/svg" class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"/>
              <line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>
        <div class="modal-body">
          <form @submit.prevent="showAddModal ? addWord() : updateWord()">
            <div class="form-group">
              <label for="word">Palavra</label>
              <input type="text" id="word" v-model="newWord.word" required class="input">
            </div>
            <div class="form-group">
              <label for="translation">Tradução</label>
              <input type="text" id="translation" v-model="newWord.translation" required class="input">
            </div>
            <div class="modal-footer">
              <button type="button" class="btn btn-secondary" @click="closeModal">Cancelar</button>
              <button type="submit" class="btn btn-primary">
                {{ showAddModal ? 'Adicionar' : 'Salvar' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>

    <!-- Input oculto para importação de arquivo -->
    <input type="file" ref="fileInput" @change="handleFileUpload" accept=".csv,.xlsx,.xls" style="display: none">
  </div>
</template>

<style scoped>
.vocabulary-list {
  width: 100%;
}

.card {
  background-color: var(--surface-color);
  border-radius: var(--radius);
  box-shadow: var(--shadow);
  overflow: hidden;
}

.card-header {
  padding: 1.5rem;
  border-bottom: 1px solid var(--border-color);
}

.word-count {
  font-size: 0.875rem;
  color: var(--text-light);
  margin-bottom: 1rem;
  font-weight: 500;
}

.controls {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
  gap: 2rem;
  flex-wrap: wrap;
}

.actions {
  display: flex;
  gap: 0.75rem;
  flex-wrap: wrap;
}

.filters {
  display: flex;
  gap: 1rem;
  width: 100%;
}

.search-wrapper {
  position: relative;
  flex: 1;
}

.search-icon {
  position: absolute;
  left: 0.75rem;
  top: 50%;
  transform: translateY(-50%);
  width: 1.25rem;
  height: 1.25rem;
  color: var(--text-light);
}

.search-input {
  width: 100%;
  padding: 0.5rem 0.75rem 0.5rem 2.5rem;
  border: 1px solid var(--border-color);
  border-radius: var(--radius-sm);
  font-size: 0.875rem;
  transition: all 0.2s;
}

.search-input:focus {
  outline: none;
  border-color: var(--primary-color);
  box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
}

.select-wrapper,
.filter-wrapper {
  position: relative;
}

.select {
  appearance: none;
  padding: 0.5rem 2rem 0.5rem 0.75rem;
  border: 1px solid var(--border-color);
  border-radius: var(--radius-sm);
  font-size: 0.875rem;
  background-color: var(--surface-color);
  cursor: pointer;
  transition: all 0.2s;
}

.select:focus {
  outline: none;
  border-color: var(--primary-color);
  box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
}

.btn {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  border: none;
  border-radius: var(--radius-sm);
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-primary {
  background-color: var(--primary-color);
  color: white;
}

.btn-primary:hover {
  background-color: var(--primary-dark);
}

.btn-secondary {
  background-color: var(--surface-color);
  color: var(--text-color);
  border: 1px solid var(--border-color);
}

.btn-secondary:hover {
  background-color: var(--background-color);
}

.btn-icon {
  padding: 0.5rem;
  color: var(--text-light);
}

.btn-icon:hover {
  color: var(--text-color);
  background-color: var(--background-color);
}

.icon {
  width: 1.25rem;
  height: 1.25rem;
}

.card-body {
  padding: 1.5rem;
}

.loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  padding: 2rem;
  color: var(--text-light);
}

.spinner {
  animation: rotate 2s linear infinite;
  width: 2rem;
  height: 2rem;
}

.path {
  stroke: var(--primary-color);
  stroke-linecap: round;
  animation: dash 1.5s ease-in-out infinite;
}

@keyframes rotate {
  100% {
    transform: rotate(360deg);
  }
}

@keyframes dash {
  0% {
    stroke-dasharray: 1, 150;
    stroke-dashoffset: 0;
  }
  50% {
    stroke-dasharray: 90, 150;
    stroke-dashoffset: -35;
  }
  100% {
    stroke-dasharray: 90, 150;
    stroke-dashoffset: -124;
  }
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  padding: 3rem;
  text-align: center;
  color: var(--text-light);
}

.empty-icon {
  width: 3rem;
  height: 3rem;
}

.table {
  width: 100%;
  border-collapse: collapse;
}

.table th {
  text-align: left;
  padding: 0.75rem;
  font-weight: 500;
  color: var(--text-light);
  border-bottom: 1px solid var(--border-color);
  cursor: pointer;
  user-select: none;
}

.table th.active {
  color: var(--primary-color);
}

.sort-icon {
  width: 1rem;
  height: 1rem;
  margin-left: 0.25rem;
  vertical-align: middle;
}

.table td {
  padding: 0.75rem;
  border-bottom: 1px solid var(--border-color);
}

.card-footer {
  padding: 1rem 1.5rem;
  border-top: 1px solid var(--border-color);
}

.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 1rem;
}

.pagination-info {
  font-size: 0.875rem;
  color: var(--text-light);
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal {
  background-color: var(--surface-color);
  border-radius: var(--radius);
  box-shadow: var(--shadow-md);
  width: 100%;
  max-width: 32rem;
  max-height: calc(100vh - 2rem);
  overflow-y: auto;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem;
  border-bottom: 1px solid var(--border-color);
}

.modal-header h2 {
  font-size: 1.25rem;
  font-weight: 600;
}

.modal-body {
  padding: 1.5rem;
}

.form-group {
  margin-bottom: 1rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  font-size: 0.875rem;
  font-weight: 500;
}

.input {
  width: 100%;
  padding: 0.5rem 0.75rem;
  border: 1px solid var(--border-color);
  border-radius: var(--radius-sm);
  font-size: 0.875rem;
  transition: all 0.2s;
}

.input:focus {
  outline: none;
  border-color: var(--primary-color);
  box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 0.5rem;
  margin-top: 1.5rem;
}

@media (max-width: 768px) {
  .card-header {
    padding: 1rem;
  }

  .controls {
    flex-direction: column;
    align-items: stretch;
    gap: 1rem;
  }

  .actions {
    flex-direction: column;
    width: 100%;
  }

  .actions .btn {
    width: 100%;
    justify-content: center;
  }

  .filters {
    flex-direction: column;
  }

  .search-wrapper {
    width: 100%;
  }

  .table {
    display: block;
    overflow-x: auto;
    white-space: nowrap;
  }

  .table th,
  .table td {
    min-width: 120px;
  }

  .table td:last-child {
    min-width: 100px;
  }

  .pagination {
    flex-wrap: wrap;
    justify-content: center;
  }

  .modal {
    margin: 1rem;
    max-height: calc(100vh - 2rem);
  }
}

@media (max-width: 480px) {
  .word-count {
    text-align: center;
  }

  .select-wrapper {
    width: 100%;
  }

  .select {
    width: 100%;
  }

  .pagination-info {
    width: 100%;
    text-align: center;
  }
}

.dropdown {
  position: relative;
  display: inline-block;
}

.dropdown-menu {
  display: none;
  position: absolute;
  top: 100%;
  left: 0;
  min-width: 8rem;
  background-color: var(--surface-color);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-sm);
  box-shadow: var(--shadow);
  z-index: 1000;
}

.dropdown:hover .dropdown-menu {
  display: block;
}

.dropdown-item {
  display: block;
  width: 100%;
  padding: 0.5rem 1rem;
  text-align: left;
  background: none;
  border: none;
  font-size: 0.875rem;
  color: var(--text-color);
  cursor: pointer;
  transition: all 0.2s;
}

.dropdown-item:hover {
  background-color: var(--background-color);
}

.btn-danger {
  background-color: var(--error-color);
  color: white;
}

.btn-danger:hover {
  background-color: #dc2626;
}

.btn-danger:disabled {
  background-color: var(--text-light);
  cursor: not-allowed;
}
</style> 