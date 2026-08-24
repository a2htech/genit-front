<script setup lang="ts">
import { Empty, EmptyDescription, EmptyTitle } from '@/design-system/ui/empty'
import { useContextStore } from '@/features/academic-year'

const context = useContextStore()
</script>

<template>
  <h1 class="font-heading mb-5 text-2xl font-extrabold">Résultats — {{ context.level }}</h1>

  <Empty>
    <EmptyTitle>Bientôt disponible</EmptyTitle>
    <EmptyDescription>
      Cette vue attend un endpoint back listant les résultats annuels déjà calculés pour une
      classe (voir BACKEND_HANDOFF.md). En attendant, les résultats individuels restent
      consultables depuis le bulletin de chaque étudiant.
    </EmptyDescription>
  </Empty>
</template>
