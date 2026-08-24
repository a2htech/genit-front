<script setup lang="ts">
import { ref } from 'vue'
import { Badge } from '@/design-system/ui/badge'
import { Button } from '@/design-system/ui/button'
import { Empty, EmptyDescription, EmptyTitle } from '@/design-system/ui/empty'
import { Field, FieldGroup, FieldLabel } from '@/design-system/ui/field'
import { Input } from '@/design-system/ui/input'
import { Pagination, PaginationContent, PaginationItem } from '@/design-system/ui/pagination'
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from '@/design-system/ui/select'
import { Spinner } from '@/design-system/ui/spinner'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/design-system/ui/table'
import { ToggleGroup, ToggleGroupItem } from '@/design-system/ui/toggle-group'
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/design-system/ui/dialog'

const text = ref('')
const select = ref('a')
const toggle = ref('a')
const page = ref(1)
</script>

<template>
  <div class="pb-16">
    <h1 class="font-heading mb-6 text-2xl font-extrabold">Design system</h1>

    <section class="mb-8">
      <h2 class="font-heading mb-3 text-base font-extrabold">Button</h2>
      <div class="mb-2.5 flex flex-wrap items-center gap-3">
        <Button>Primary</Button>
        <Button variant="secondary">Secondary</Button>
        <Button variant="destructive">Destructive</Button>
        <Button variant="success">Success</Button>
        <Button variant="outline">Outline</Button>
        <Button variant="ghost">Ghost</Button>
        <Button disabled>Disabled</Button>
      </div>
      <div class="mb-2.5 flex flex-wrap items-center gap-3">
        <Button emphasis="compact" size="sm">Compact</Button>
        <Button emphasis="compact" size="sm" variant="destructive">Compact danger</Button>
      </div>
      <div class="flex items-center gap-3 bg-foreground p-4">
        <Button
          variant="success"
          class="border-background shadow-[4px_4px_0_0_var(--background)] hover:shadow-[2px_2px_0_0_var(--background)]"
        >
          On dark
        </Button>
      </div>
    </section>

    <section class="mb-8">
      <h2 class="font-heading mb-3 text-base font-extrabold">Input / Select / Field</h2>
      <FieldGroup class="max-w-2xl flex-row flex-wrap gap-4">
        <Field class="max-w-xs"><FieldLabel>Texte</FieldLabel><Input v-model="text" placeholder="Saisir…" /></Field>
        <Field class="max-w-xs">
          <FieldLabel>Nombre (échec)</FieldLabel>
          <Input type="number" model-value="8" class="text-center text-destructive" />
        </Field>
        <Field class="max-w-xs">
          <FieldLabel>Sélection</FieldLabel>
          <Select v-model="select">
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectItem value="a">Option A</SelectItem>
                <SelectItem value="b">Option B</SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>
        </Field>
      </FieldGroup>
    </section>

    <section class="mb-8">
      <h2 class="font-heading mb-3 text-base font-extrabold">Badge</h2>
      <div class="flex flex-wrap gap-2">
        <Badge>Default</Badge>
        <Badge variant="success">Success</Badge>
        <Badge variant="warning">Warning</Badge>
        <Badge variant="destructive">Destructive</Badge>
        <Badge variant="accent">Accent</Badge>
        <Badge variant="outline">Outline</Badge>
      </div>
    </section>

    <section class="mb-8">
      <h2 class="font-heading mb-3 text-base font-extrabold">ToggleGroup</h2>
      <ToggleGroup v-model="toggle" type="single" variant="outline">
        <ToggleGroupItem value="a">Normale</ToggleGroupItem>
        <ToggleGroupItem value="b">Rattrapage</ToggleGroupItem>
      </ToggleGroup>
    </section>

    <section class="mb-8">
      <h2 class="font-heading mb-3 text-base font-extrabold">Spinner</h2>
      <Spinner class="size-6" />
    </section>

    <section class="mb-8">
      <h2 class="font-heading mb-3 text-base font-extrabold">Empty</h2>
      <Empty>
        <EmptyTitle>Aucun résultat</EmptyTitle>
        <EmptyDescription>Description optionnelle.</EmptyDescription>
      </Empty>
    </section>

    <section class="mb-8">
      <h2 class="font-heading mb-3 text-base font-extrabold">Pagination</h2>
      <Pagination v-model:page="page" :total="30" :items-per-page="10">
        <PaginationContent>
          <PaginationItem v-for="p in 3" :key="p" :value="p" :is-active="p === page">{{ p }}</PaginationItem>
        </PaginationContent>
      </Pagination>
    </section>

    <section class="mb-8">
      <h2 class="font-heading mb-3 text-base font-extrabold">Table</h2>
      <Table>
        <TableHeader>
          <TableRow><TableHead>Colonne A</TableHead><TableHead>Colonne B</TableHead></TableRow>
        </TableHeader>
        <TableBody>
          <TableRow><TableCell>Valeur 1</TableCell><TableCell>Valeur 2</TableCell></TableRow>
        </TableBody>
      </Table>
    </section>

    <section class="mb-8">
      <h2 class="font-heading mb-3 text-base font-extrabold">Dialog</h2>
      <Dialog>
        <DialogTrigger as-child>
          <Button emphasis="compact" size="sm">Ouvrir une modale</Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Exemple de modale</DialogTitle>
            <DialogDescription>Contenu de la modale.</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <DialogClose as-child>
              <Button emphasis="compact">Fermer</Button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </section>
  </div>
</template>
