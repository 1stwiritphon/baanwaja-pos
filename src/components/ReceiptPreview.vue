<template>
<div class="receipt">
<pre>{{ receipt }}</pre>
</div>
</template>

<script setup>
defineProps({
receipt: String
})
</script>

<style>
.receipt{
width:220px;
background:white;
padding:10px;
font-family: monospace;
font-size:12px;
}
</style>