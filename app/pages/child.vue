<script lang="ts" setup>
type Form = { number: number; range: number; color: string }

definePageMeta({ ssr: false })

const form = reactive<Form>({
  number: 0,
  range: 0,
  color: '#000000',
})

const [, useChildSharedState] = createIframeSharedState<Form>('form')
useChildSharedState(form)
</script>

<template>
  <div style="background-color: #313131; color: white; padding: 10px">
    <label>
      Number
      <input v-model.number="form.number" type="number" />
    </label>

    <label>
      Range ({{ form.range }})
      <input v-model.number="form.range" type="range" min="0" max="100" />
    </label>

    <label>
      Color
      <input v-model="form.color" type="color" />
    </label>

    <pre>{{ form }}</pre>
  </div>
</template>
