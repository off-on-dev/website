<script setup>
import { onUnmounted } from 'vue'
import { useRouter } from 'vue-router'

const base = import.meta.env.BASE_URL
const router = useRouter()

// Open presenter view in a new window. Slidev's default navigates the current
// window, which leaves no audience view. Returning false cancels the navigation.
const removeGuard = router.beforeEach((to) => {
  if (to.name === 'presenter' && !location.hash.startsWith('#/presenter/')) {
    const no = to.params?.no ?? '1'
    window.open(`${location.href.split('#')[0]}#/presenter/${no}`, '_blank')
    return false
  }
})

onUnmounted(removeGuard)
</script>

<template>
  <!-- Firefly wave — static decorative dots, position:fixed relative to viewport -->
  <div id="ff-wave" aria-hidden="true">
    <span class="fw fw-lo" style="left:2%;  top:92%; opacity:.15"></span>
    <span class="fw fw-md" style="left:5%;  top:87%; opacity:.23"></span>
    <span class="fw fw-lo" style="left:8%;  top:94%; opacity:.16"></span>
    <span class="fw fw-lo" style="left:10%; top:90%; opacity:.15"></span>
    <span class="fw fw-hi" style="left:15%; top:85%; opacity:.33"></span>
    <span class="fw fw-lo" style="left:20%; top:91%; opacity:.17"></span>
    <span class="fw fw-md" style="left:24%; top:86%; opacity:.24"></span>
    <span class="fw fw-lo" style="left:28%; top:93%; opacity:.14"></span>
    <span class="fw fw-md" style="left:31%; top:88%; opacity:.22"></span>
    <span class="fw fw-hi" style="left:38%; top:90%; opacity:.32"></span>
    <span class="fw fw-lo" style="left:43%; top:92%; opacity:.18"></span>
    <span class="fw fw-md" style="left:47%; top:87%; opacity:.23"></span>
    <span class="fw fw-lo" style="left:51%; top:94%; opacity:.15"></span>
    <span class="fw fw-lo" style="left:54%; top:89%; opacity:.17"></span>
    <span class="fw fw-hi" style="left:61%; top:86%; opacity:.34"></span>
    <span class="fw fw-lo" style="left:66%; top:91%; opacity:.15"></span>
    <span class="fw fw-md" style="left:69%; top:87%; opacity:.25"></span>
    <span class="fw fw-md" style="left:73%; top:93%; opacity:.26"></span>
    <span class="fw fw-lo" style="left:76%; top:89%; opacity:.16"></span>
    <span class="fw fw-hi" style="left:83%; top:88%; opacity:.31"></span>
    <span class="fw fw-lo" style="left:88%; top:91%; opacity:.17"></span>
    <span class="fw fw-md" style="left:91%; top:85%; opacity:.22"></span>
    <span class="fw fw-lo" style="left:94%; top:93%; opacity:.14"></span>
    <span class="fw fw-lo" style="left:97%; top:88%; opacity:.16"></span>
  </div>
  <div id="ff-mist" aria-hidden="true">
    <span class="fw fw-lo" style="left:9%;  top:95%; opacity:.05"></span>
    <span class="fw fw-lo" style="left:14%; top:93%; opacity:.05"></span>
    <span class="fw fw-lo" style="left:28%; top:96%; opacity:.04"></span>
    <span class="fw fw-lo" style="left:44%; top:94%; opacity:.06"></span>
    <span class="fw fw-lo" style="left:48%; top:96%; opacity:.05"></span>
    <span class="fw fw-lo" style="left:65%; top:95%; opacity:.05"></span>
    <span class="fw fw-lo" style="left:76%; top:93%; opacity:.04"></span>
    <span class="fw fw-lo" style="left:81%; top:95%; opacity:.06"></span>
  </div>
  <!-- OffOn favicon logo — fixed top-right, outside slide transform -->
  <img
    id="deck-logo"
    :src="`${base}brand/offon-favicon.svg`"
    alt=""
    aria-hidden="true"
    width="51"
    height="66"
  >
</template>
