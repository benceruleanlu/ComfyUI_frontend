<template>
  <div
    class="font-sans w-screen h-screen mx-0 grid items-center justify-center text-neutral-300 bg-neutral-900 dark-theme pointer-events-auto overflow-y-auto"
  >
    <div
      class="max-w-screen-sm w-screen p-8 relative col-start-1 row-start-1 mx-auto"
    >
      <!-- TODO: Impl. progress updates once added to desktop. -->
      <ProgressBar mode="indeterminate" />
    </div>
  </div>
</template>

<script setup lang="ts">
import ProgressBar from 'primevue/progressbar'
</script>
