<script setup lang="ts">
const cards = [
  { label: 'Étudiants inscrits', value: '1 240' },
  { label: 'Bulletins générés', value: '87' },
  { label: 'Fiches pédagogiques', value: '12' },
]
</script>

<template>
  <div class="dashboard">
    <h1 class="dashboard__title">Bienvenue sur Genit</h1>
    <p class="dashboard__subtitle">Gestion des notes de la mention.</p>

    <div class="dashboard__cards">
      <div v-for="card in cards" :key="card.label" class="dashboard__card">
        <p class="dashboard__card-value">{{ card.value }}</p>
        <p class="dashboard__card-label">{{ card.label }}</p>
      </div>
    </div>
  </div>
</template>

<style scoped>
.dashboard {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.dashboard__title {
  font-size: 1.75rem;
  font-weight: 700;
}

.dashboard__subtitle {
  color: #6b7280;
  margin-bottom: 1rem;
}

.dashboard__cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 1rem;
}

.dashboard__card {
  border: 1px solid #e5e7eb;
  border-radius: 0.5rem;
  padding: 1.25rem;
}

.dashboard__card-value {
  font-size: 1.5rem;
  font-weight: 700;
}

.dashboard__card-label {
  color: #6b7280;
  font-size: 0.875rem;
}
</style>
