<script setup lang="ts">
import { ShieldOffIcon } from '@lucide/vue'
import { useRouter } from 'vue-router'
import { Button } from '@/design-system/ui/button'
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from '@/design-system/ui/empty'
import { useAuthStore } from '@/features/auth'

const router = useRouter()
const auth = useAuthStore()

async function logout() {
  await auth.signOut()
  router.push({ name: 'sign-in' })
}
</script>

<template>
  <div class="mx-auto flex min-h-screen max-w-md items-center px-6">
    <Empty class="w-full shadow-brutal-lg">
      <EmptyHeader>
        <EmptyMedia variant="icon" class="size-14 bg-destructive/10 text-destructive [&_svg:not([class*=size-])]:size-7">
          <ShieldOffIcon />
        </EmptyMedia>
        <EmptyTitle>Accès refusé</EmptyTitle>
        <EmptyDescription>
          Vous n'avez pas les droits nécessaires pour accéder à cette ressource.
        </EmptyDescription>
      </EmptyHeader>
      <EmptyContent>
        <div class="flex gap-2.5">
          <Button as-child>
            <RouterLink :to="{ name: 'dashboard' }">Retour à l'accueil</RouterLink>
          </Button>
          <Button variant="outline" emphasis="compact" @click="logout">Se déconnecter</Button>
        </div>
      </EmptyContent>
    </Empty>
  </div>
</template>
