<script setup lang="ts"></script>

<template>
  <div class="default-layout">
    <header class="default-layout__header">
      <RouterLink to="/" class="default-layout__title">Genit</RouterLink>
    </header>
    <main class="default-layout__content">
      <RouterView />
    </main>
  </div>
</template>

<style scoped>
.default-layout__header {
  padding: 1rem 1.5rem;
  background: #fff;
  border-bottom: 1px solid #e5e7eb;
}

.default-layout__title {
  font-weight: 700;
  color: #111827;
  text-decoration: none;
}

.default-layout__content {
  padding: 1.5rem;
}
</style>
