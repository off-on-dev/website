<script setup>
const base = import.meta.env.BASE_URL
</script>

<template>
  <!-- Firefly wave — static decorative dots, position:fixed relative to viewport -->
  <div id="ff-wave" aria-hidden="true">
    <span class="fw fw-lo" style="left:2%;  top:92%; opacity:.36"></span>
    <span class="fw fw-md" style="left:5%;  top:87%; opacity:.58"></span>
    <span class="fw fw-lo" style="left:8%;  top:94%; opacity:.40"></span>
    <span class="fw fw-lo" style="left:10%; top:90%; opacity:.38"></span>
    <span class="fw fw-hi" style="left:15%; top:85%; opacity:.82"></span>
    <span class="fw fw-lo" style="left:20%; top:91%; opacity:.42"></span>
    <span class="fw fw-md" style="left:24%; top:86%; opacity:.60"></span>
    <span class="fw fw-lo" style="left:28%; top:93%; opacity:.36"></span>
    <span class="fw fw-md" style="left:31%; top:88%; opacity:.55"></span>
    <span class="fw fw-hi" style="left:38%; top:90%; opacity:.80"></span>
    <span class="fw fw-lo" style="left:43%; top:92%; opacity:.44"></span>
    <span class="fw fw-md" style="left:47%; top:87%; opacity:.58"></span>
    <span class="fw fw-lo" style="left:51%; top:94%; opacity:.38"></span>
    <span class="fw fw-lo" style="left:54%; top:89%; opacity:.42"></span>
    <span class="fw fw-hi" style="left:61%; top:86%; opacity:.84"></span>
    <span class="fw fw-lo" style="left:66%; top:91%; opacity:.38"></span>
    <span class="fw fw-md" style="left:69%; top:87%; opacity:.62"></span>
    <span class="fw fw-md" style="left:73%; top:93%; opacity:.65"></span>
    <span class="fw fw-lo" style="left:76%; top:89%; opacity:.40"></span>
    <span class="fw fw-hi" style="left:83%; top:88%; opacity:.78"></span>
    <span class="fw fw-lo" style="left:88%; top:91%; opacity:.42"></span>
    <span class="fw fw-md" style="left:91%; top:85%; opacity:.55"></span>
    <span class="fw fw-lo" style="left:94%; top:93%; opacity:.36"></span>
    <span class="fw fw-lo" style="left:97%; top:88%; opacity:.40"></span>
  </div>
  <div id="ff-mist" aria-hidden="true">
    <span class="fw fw-lo" style="left:9%;  top:95%; opacity:.09"></span>
    <span class="fw fw-lo" style="left:14%; top:93%; opacity:.10"></span>
    <span class="fw fw-lo" style="left:28%; top:96%; opacity:.08"></span>
    <span class="fw fw-lo" style="left:44%; top:94%; opacity:.11"></span>
    <span class="fw fw-lo" style="left:48%; top:96%; opacity:.09"></span>
    <span class="fw fw-lo" style="left:65%; top:95%; opacity:.10"></span>
    <span class="fw fw-lo" style="left:76%; top:93%; opacity:.09"></span>
    <span class="fw fw-lo" style="left:81%; top:95%; opacity:.11"></span>
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
