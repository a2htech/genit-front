<script setup lang="ts">
import { computed, ref, type Component } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ArrowLeftIcon, CalendarIcon, FileTextIcon, MapPinIcon, PencilIcon, PhoneIcon, Trash2Icon } from '@lucide/vue'
import { Badge, type BadgeVariants } from '@/design-system/ui/badge'
import { Button } from '@/design-system/ui/button'
import { Empty, EmptyDescription, EmptyTitle } from '@/design-system/ui/empty'
import { Skeleton } from '@/design-system/ui/skeleton'
import { formatAcademicYear, formatDate } from '@/shared/utils/format'
import StudentDeleteDialog from './StudentDeleteDialog.vue'
import StudentFormModal from './StudentFormModal.vue'
import { useStudentQuery } from './student.queries'
import { SEX_LABELS, STUDENT_STATE_LABELS, type AcademicStatusCode, type Student } from './student.types'

const route = useRoute()
const router = useRouter()

const studentId = computed(() => {
  const raw = route.params.studentId as string | undefined
  return raw ? Number(raw) : null
})

const { data: student, isPending, isError } = useStudentQuery(studentId)

const STATE_VARIANTS: Record<AcademicStatusCode, BadgeVariants['variant']> = {
  P: 'success',
  C: 'warning',
  R: 'destructive',
  T: 'accent',
}

const initials = computed(() => {
  const s = student.value
  return s ? `${s.first_name[0] ?? ''}${s.last_name?.[0] ?? ''}` : ''
})

interface InfoRow {
  label: string
  value: string
  icon?: Component
  variant?: BadgeVariants['variant']
}

function dash(value: string | null): string {
  return value ?? '—'
}

const sections = computed<{ title: string; rows: InfoRow[] }[]>(() => {
  const s = student.value
  if (!s) return []
  return [
    {
      title: 'Identité',
      rows: [
        { label: 'Sexe', value: SEX_LABELS[s.sex] },
        { label: 'Naissance', value: formatDate(s.birthday), icon: CalendarIcon },
        { label: 'Lieu de naissance', value: dash(s.birthplace), icon: MapPinIcon },
      ],
    },
    {
      title: 'Coordonnées',
      rows: [
        { label: 'Adresse', value: dash(s.address), icon: MapPinIcon },
        { label: 'Téléphone', value: dash(s.phone), icon: PhoneIcon },
      ],
    },
    {
      title: 'Scolarité',
      rows: [
        { label: 'Niveau', value: s.class },
        { label: 'Année universitaire', value: formatAcademicYear(s.class_year) },
        { label: 'Statut', value: STUDENT_STATE_LABELS[s.state], variant: STATE_VARIANTS[s.state] },
      ],
    },
  ]
})

const formOpen = ref(false)
const deleteTarget = ref<Student | null>(null)

function openTranscript(id: number) {
  router.push({ name: 'transcript', params: { studentId: String(id) } })
}

function backToList() {
  router.push({ name: 'students' })
}
</script>

<template>
  <RouterLink
    :to="{ name: 'students' }"
    class="mb-5 inline-flex items-center gap-1.5 text-[13px] font-bold text-muted-foreground no-underline hover:text-foreground"
  >
    <ArrowLeftIcon class="size-3.5" /> Étudiants
  </RouterLink>

  <div v-if="isPending" class="border-2 border-border bg-card p-10 shadow-brutal-lg">
    <div class="flex flex-wrap items-center gap-8">
      <div class="flex-1">
        <Skeleton class="h-5 w-40" />
        <Skeleton class="mt-3 h-8 w-64" />
        <Skeleton class="mt-2 h-4 w-72" />
      </div>
      <Skeleton class="size-44 shrink-0" />
    </div>
  </div>

  <Empty v-else-if="isError || !student">
    <EmptyTitle>Étudiant introuvable</EmptyTitle>
    <EmptyDescription>
      Cet étudiant n'existe pas, ou n'est pas inscrit sur l'année universitaire en cours.
    </EmptyDescription>
    <Button class="mt-4" @click="backToList">Retour à la liste</Button>
  </Empty>

  <div v-else class="border-2 border-border bg-card shadow-brutal-lg">
    <div class="flex flex-wrap items-center justify-between gap-8 border-b-2 border-border p-10">
      <div class="min-w-70 flex-1">
        <div class="flex flex-wrap items-center gap-2.5">
          <Badge :variant="STATE_VARIANTS[student.state]">{{ STUDENT_STATE_LABELS[student.state] }}</Badge>
          <Badge :variant="student.registered ? 'success' : 'warning'">
            {{ student.registered ? 'Inscrit' : 'Non inscrit' }}
          </Badge>
        </div>

        <h1 class="mt-3 font-heading text-[32px] leading-tight font-extrabold">
          {{ student.first_name }} {{ student.last_name }}
        </h1>
        <div class="mt-2 text-sm font-semibold text-muted-foreground">
          #{{ student.id }} · Né(e) le {{ formatDate(student.birthday) }} · {{ student.class }} — année
          {{ formatAcademicYear(student.class_year) }}
        </div>

        <div class="mt-6 flex flex-wrap gap-2">
          <Button variant="secondary" @click="formOpen = true"><PencilIcon /> Éditer</Button>
          <Button variant="secondary" @click="openTranscript(student.id)"><FileTextIcon /> Voir le bulletin</Button>
          <Button variant="destructive" @click="deleteTarget = student"><Trash2Icon /> Supprimer</Button>
        </div>
      </div>

      <div
        class="flex size-44 shrink-0 items-center justify-center border-2 border-border bg-muted font-heading text-5xl font-extrabold"
      >
        {{ initials }}
      </div>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-3">
      <div
        v-for="section in sections"
        :key="section.title"
        class="border-b-2 border-border px-6 py-5 last:border-b-0 md:border-r-2 md:border-b-0 md:last:border-r-0"
      >
        <div class="mb-3 font-heading text-[15px] font-extrabold">{{ section.title }}</div>

        <div
          v-for="row in section.rows"
          :key="row.label"
          class="flex items-center justify-between gap-3 border-b border-border/15 py-2.5 last:border-b-0"
        >
          <span
            class="flex shrink-0 items-center gap-1.5 text-[11px] font-bold tracking-wide text-muted-foreground uppercase"
          >
            <component :is="row.icon" v-if="row.icon" class="size-3" />
            {{ row.label }}
          </span>
          <Badge v-if="row.variant" :variant="row.variant">{{ row.value }}</Badge>
          <span v-else class="text-right text-[13px] font-semibold">{{ row.value }}</span>
        </div>
      </div>
    </div>
  </div>

  <StudentFormModal v-model:open="formOpen" :student="student ?? null" />
  <StudentDeleteDialog v-model:student="deleteTarget" @deleted="backToList" />
</template>
