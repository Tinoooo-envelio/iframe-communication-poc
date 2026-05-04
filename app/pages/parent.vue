<script lang="ts" setup>
type Form = { number: number; range: number; color: string }

definePageMeta({ ssr: false })

const form = reactive<Form>({
  number: 42,
  range: 50,
  color: '#3b82f6',
})

const iframe = ref<HTMLIFrameElement | null>(null)
const [useParentSharedState] = createIframeSharedState<Form>('form')
useParentSharedState(iframe, form)


</script>

<template>
  <div>
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

    <iframe ref="iframe" src="http://localhost:3000/child" style="width: 90vw; height: 50vh; border: none;" />
  </div>
</template>
