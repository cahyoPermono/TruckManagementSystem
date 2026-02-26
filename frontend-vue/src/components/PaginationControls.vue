<script setup lang="ts">
import { computed } from 'vue'
import { Button } from '@/components/ui/button'
import { ChevronLeft, ChevronRight, MoreHorizontal } from 'lucide-vue-next'

const props = defineProps<{
  currentPage: number
  totalPages: number
}>()

const emit = defineEmits<{
  (e: 'pageChange', page: number): void
}>()

const getPageNumbers = computed(() => {
  const pages = []
  const maxVisiblePages = 5
  if (props.totalPages <= maxVisiblePages) {
    for (let i = 1; i <= props.totalPages; i++) {
      pages.push(i)
    }
  } else {
    pages.push(1)
    if (props.currentPage > 3) {
      pages.push('...')
    }
    const start = Math.max(2, props.currentPage - 1)
    const end = Math.min(props.totalPages - 1, props.currentPage + 1)
    for (let i = start; i <= end; i++) {
      pages.push(i)
    }
    if (props.currentPage < props.totalPages - 2) {
      pages.push('...')
    }
    pages.push(props.totalPages)
  }
  return pages
})
</script>

<template>
  <div class="flex items-center justify-between px-4 py-3 border-t border-slate-800/60 bg-slate-900/20">
    <div class="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
      <div>
        <p class="text-sm text-slate-400">
          Showing page <span class="font-medium text-slate-200">{{ currentPage }}</span> of <span class="font-medium text-slate-200">{{ totalPages }}</span>
        </p>
      </div>
      <div>
        <nav class="isolate inline-flex -space-x-px rounded-md shadow-sm" aria-label="Pagination">
          <Button
            variant="outline"
            class="relative inline-flex items-center rounded-l-md px-2 py-2 text-slate-400 hover:bg-slate-800 border-slate-700 bg-slate-900/50"
            :disabled="currentPage === 1"
            @click="emit('pageChange', currentPage - 1)"
          >
            <span class="sr-only">Previous</span>
            <ChevronLeft class="h-4 w-4" aria-hidden="true" />
          </Button>

          <template v-for="(page, index) in getPageNumbers" :key="index">
            <Button
              v-if="page === '...'"
              disabled
              variant="outline"
              class="relative inline-flex items-center px-4 py-2 text-sm font-semibold text-slate-500 border-slate-700 bg-slate-900/50"
            >
              <MoreHorizontal class="h-4 w-4" />
            </Button>
            <Button
              v-else
              :variant="page === currentPage ? 'default' : 'outline'"
              :class="[
                page === currentPage ? 'z-10 bg-indigo-600 text-white hover:bg-indigo-700 border-indigo-600' : 'text-slate-300 hover:bg-slate-800 border-slate-700 bg-slate-900/50',
                'relative inline-flex items-center px-4 py-2 text-sm font-semibold'
              ]"
              @click="emit('pageChange', page as number)"
            >
              {{ page }}
            </Button>
          </template>

          <Button
            variant="outline"
            class="relative inline-flex items-center rounded-r-md px-2 py-2 text-slate-400 hover:bg-slate-800 border-slate-700 bg-slate-900/50"
            :disabled="currentPage === totalPages"
            @click="emit('pageChange', currentPage + 1)"
          >
            <span class="sr-only">Next</span>
            <ChevronRight class="h-4 w-4" aria-hidden="true" />
          </Button>
        </nav>
      </div>
    </div>
  </div>
</template>
