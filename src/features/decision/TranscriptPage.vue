<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { Badge } from '@/design-system/ui/badge'
import { Button } from '@/design-system/ui/button'
import { Empty, EmptyDescription, EmptyTitle } from '@/design-system/ui/empty'
import { Input } from '@/design-system/ui/input'
import { Spinner } from '@/design-system/ui/spinner'
import { ToggleGroup, ToggleGroupItem } from '@/design-system/ui/toggle-group'
import { NIVEAUX, useContextStore, type Niveau } from '@/features/academic-year'
import { useEtudiantsRechercheQuery } from '@/features/student'
import { formatMoyenne, formatNote, isNoteEchouee } from '@/shared/utils/format'
import { useBulletinQuery } from './decision.queries'

const route = useRoute()
const router = useRouter()
const context = useContextStore()

const studentId = computed(() => (route.params.studentId as string | undefined) ?? null)
const search = ref('')

const { data: suggestionsPage } = useEtudiantsRechercheQuery(search)
const suggestions = computed(() => (studentId.value ? [] : (suggestionsPage.value?.data ?? [])))

function selectSuggestion(id: string, label: string) {
  search.value = label
  router.push({ name: 'transcript', params: { studentId: id } })
}

function onSearchChange() {
  if (studentId.value) router.replace({ name: 'transcript', params: {} })
}

const niveauView = ref<Niveau | null>(context.niveau)
watch(studentId, () => {
  niveauView.value = context.niveau
})

const { data: bulletin, isPending } = useBulletinQuery(studentId, niveauView)

const niveauIndex = computed(() => NIVEAUX.findIndex((n) => n.value === context.niveau))
const niveauOptions = computed(() => NIVEAUX.slice(0, niveauIndex.value + 1))
const showNiveauSwitcher = computed(() => niveauOptions.value.length > 1)

function moyenneBadgeTone(moyenne: number | null) {
  if (moyenne === null) return 'outline'
  return moyenne < 10 ? 'destructive' : 'success'
}

const decisionBandClass: Record<string, string> = {
  admis: 'bg-success text-success-foreground',
  dettes: 'bg-warning text-warning-foreground',
  redouble: 'bg-destructive text-destructive-foreground',
  incomplet: 'bg-background text-foreground',
}
</script>

<template>
  <h1 class="font-heading mb-5 text-2xl font-extrabold">Bulletin</h1>

  <div class="relative mb-6.5 max-w-115">
    <Input v-model="search" placeholder="Rechercher un étudiant par nom…" @input="onSearchChange" />
    <div
      v-if="suggestions.length > 0"
      class="absolute top-[calc(100%+4px)] right-0 left-0 z-10 border-2 border-border bg-card shadow-brutal-md"
    >
      <div
        v-for="s in suggestions"
        :key="s.id"
        class="cursor-pointer border-b-2 border-border px-3.5 py-2.5 text-sm font-semibold last:border-b-0 hover:bg-accent hover:text-accent-foreground"
        @click="selectSuggestion(s.id, `${s.prenom} ${s.nom}`)"
      >
        {{ s.prenom }} {{ s.nom }} — {{ s.matricule }}
      </div>
    </div>
  </div>

  <Empty v-if="!studentId">
    <EmptyTitle>Aucun étudiant sélectionné</EmptyTitle>
    <EmptyDescription>Recherchez un étudiant ci-dessus pour afficher son bulletin.</EmptyDescription>
  </Empty>

  <Spinner v-else-if="isPending" class="mx-auto mt-12 size-8" />

  <div v-else-if="bulletin" class="border-2 border-border bg-card shadow-brutal-lg">
    <div class="border-b-2 border-border px-6 py-4.5 text-center">
      <div class="text-[11px] font-bold tracking-wide text-muted-foreground uppercase">
        Université — Mention Informatique
      </div>
      <div class="font-heading mt-1 text-base font-extrabold">
        Fiche individuelle de résultats — {{ bulletin.niveauLabel }} · {{ bulletin.anneeLabel }}
      </div>
    </div>

    <div class="flex flex-wrap items-center gap-5 border-b-2 border-border p-6">
      <div class="font-heading flex size-18 shrink-0 items-center justify-center border-2 border-border bg-muted text-2xl font-extrabold">
        {{ bulletin.initiales }}
      </div>
      <div>
        <div class="font-heading text-[22px] font-extrabold">{{ bulletin.nomComplet }}</div>
        <div class="mt-0.5 text-[13px] font-semibold text-muted-foreground">
          {{ bulletin.matricule }} · Né(e) le {{ bulletin.dateNaissance }}
        </div>
      </div>
      <ToggleGroup
        v-if="showNiveauSwitcher"
        :model-value="niveauView ?? undefined"
        type="single"
        class="ml-auto"
        @update:model-value="(v) => v && (niveauView = v as Niveau)"
      >
        <ToggleGroupItem v-for="n in niveauOptions" :key="n.value" :value="n.value" size="sm">
          {{ n.value }}
        </ToggleGroupItem>
      </ToggleGroup>
    </div>

    <template v-if="bulletin.isHistorique">
      <div class="p-6">
        <div class="mb-4 text-[13px] font-semibold text-muted-foreground">
          Résumé archivé — le détail matière par matière de ce niveau n'est plus modifiable.
        </div>
        <div v-for="sem in bulletin.semestres" :key="sem.numero" class="mb-3.5 flex flex-wrap gap-4">
          <div class="min-w-50 flex-1 border-2 border-border bg-muted p-3.5">
            <div class="text-[11px] font-bold text-muted-foreground uppercase">
              Semestre {{ sem.numero }} — Crédits validés
            </div>
            <div class="font-heading text-[22px] font-extrabold">
              {{ sem.creditsValides }} / {{ sem.creditsTotal }}
            </div>
          </div>
        </div>
      </div>
    </template>

    <template v-else>
      <div v-for="sem in bulletin.semestres" :key="sem.numero" class="border-b-2 border-border p-6">
        <div class="font-heading mb-3.5 text-base font-extrabold">Semestre {{ sem.numero }}</div>

        <div v-for="bloc in sem.ueBlocs" :key="bloc.ue.code" class="mb-3.5 border-2 border-border">
          <div class="flex flex-wrap items-center gap-2.5 border-b-2 border-border bg-muted px-3.5 py-2.5">
            <div class="font-heading min-w-45 flex-1 text-[13px] font-extrabold">
              {{ bloc.ue.code }} — {{ bloc.ue.intitule }}
            </div>
            <span class="text-[11px] font-bold text-muted-foreground">{{ bloc.ue.credits }} crédits</span>
            <Badge :variant="moyenneBadgeTone(bloc.normaleMoyenne)">
              N: {{ formatMoyenne(bloc.normaleMoyenne) }} · {{ bloc.normaleMention }} ·
              {{ bloc.normaleCreditsAcquis }} cr.
            </Badge>
            <Badge :variant="moyenneBadgeTone(bloc.rattrapageMoyenne)">
              R: {{ formatMoyenne(bloc.rattrapageMoyenne) }} · {{ bloc.rattrapageMention }} ·
              {{ bloc.rattrapageCreditsAcquis }} cr.
            </Badge>
          </div>
          <table class="w-full border-collapse">
            <tbody>
              <tr v-for="mr in bloc.matieres" :key="mr.intitule" class="border-b border-border/30 last:border-b-0">
                <td class="px-3.5 py-2 text-[13px]">{{ mr.intitule }}</td>
                <td class="px-3.5 py-2 text-xs text-muted-foreground">coef. {{ mr.coefficient }}</td>
                <td
                  class="w-25 px-3.5 py-2 text-right text-[13px] font-bold"
                  :class="isNoteEchouee(mr.noteNormale) ? 'text-destructive' : ''"
                >
                  N: {{ formatNote(mr.noteNormale) }}
                </td>
                <td
                  class="w-25 px-3.5 py-2 text-right text-[13px] font-bold"
                  :class="isNoteEchouee(mr.noteRattrapage) ? 'text-destructive' : ''"
                >
                  R: {{ formatNote(mr.noteRattrapage) }}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div class="mt-2 flex flex-wrap gap-4">
          <div class="min-w-50 flex-1 border-2 border-border bg-muted p-3.5">
            <div class="text-[11px] font-bold text-muted-foreground uppercase">Crédits validés — Normale</div>
            <div class="font-heading text-xl font-extrabold">
              {{ sem.creditsValidesNormale }} / {{ sem.creditsTotal }}
            </div>
          </div>
          <div class="min-w-50 flex-1 border-2 border-border bg-muted p-3.5">
            <div class="text-[11px] font-bold text-muted-foreground uppercase">Crédits validés — Rattrapage</div>
            <div class="font-heading text-xl font-extrabold">
              {{ sem.creditsValidesRattrapage }} / {{ sem.creditsTotal }}
            </div>
          </div>
        </div>
      </div>
    </template>

    <div
      class="font-heading border-b-2 border-border p-5 text-center text-[26px] font-extrabold tracking-wide"
      :class="decisionBandClass[bulletin.decisionCode]"
    >
      {{ bulletin.decisionLabel }}
    </div>

    <div class="flex justify-end p-6">
      <Button variant="secondary">Exporter en PDF</Button>
    </div>
  </div>
</template>
