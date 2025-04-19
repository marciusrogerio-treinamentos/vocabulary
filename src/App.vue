<script setup>
import VocabularyList from './components/VocabularyList.vue'
</script>

<template>
  <div class="app">
    <header class="header">
      <h1>Vocabulário</h1>
    </header>

    <main class="main">
      <VocabularyList />
    </main>

    <footer class="footer">
      <p>&copy; 2024 Vocabulário. Todos os direitos reservados.</p>
    </footer>
  </div>
</template>

<style>
:root {
  /* Cores */
  --primary-color: #2563eb;
  --primary-dark: #1d4ed8;
  --success-color: #22c55e;
  --warning-color: #eab308;
  --error-color: #ef4444;
  --secondary-color: #64748b;
  
  /* Cores de fundo e texto */
  --background-color: #f8fafc;
  --surface-color: #ffffff;
  --text-color: #1e293b;
  --text-light: #64748b;
  --border-color: #e2e8f0;
  
  /* Sombras */
  --shadow: 0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1);
  --shadow-md: 0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1);
  
  /* Bordas */
  --radius: 0.5rem;
  --radius-sm: 0.375rem;
}

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
  line-height: 1.5;
  color: var(--text-color);
  background-color: var(--background-color);
}

.app {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.header {
  background-color: var(--surface-color);
  padding: 1rem 1.5rem;
  box-shadow: var(--shadow);
}

.header h1 {
  font-size: 1.5rem;
  font-weight: 600;
  color: var(--primary-color);
}

.main {
  flex: 1;
  padding: 1.5rem;
  max-width: 1200px;
  margin: 0 auto;
  width: 100%;
}

.footer {
  background-color: var(--surface-color);
  padding: 1rem 1.5rem;
  text-align: center;
  color: var(--text-light);
  font-size: 0.875rem;
  box-shadow: var(--shadow);
}

@media (max-width: 768px) {
  .main {
    padding: 1rem;
  }
}
</style>
