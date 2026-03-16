<template>
  <div class="receipt-container">
    <div class="receipt-paper-wrapper">
      <div class="receipt-text">
        {{ receipt }}
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  receipt: String
})
</script>

<style scoped>
.receipt-container {
  display: flex;
  justify-content: center;
  padding: 10px 0;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 20px;
}

.receipt-paper-wrapper {
  width: 100%;
  max-width: 260px;
  background: white;
  padding: 20px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
  border-radius: 2px;
  position: relative;
}

/* รอยหยักขอบกระดาษ */
.receipt-paper-wrapper::after {
  content: "";
  position: absolute;
  bottom: -8px;
  left: 0;
  right: 0;
  height: 8px;
  background: linear-gradient(-45deg, transparent 4px, white 4px), 
              linear-gradient(45deg, transparent 4px, white 4px);
  background-size: 8px 8px;
}

.receipt-text {
  font-family: 'Courier New', Courier, monospace;
  font-size: 13px;
  color: #333;
  line-height: 1.4;
  white-space: pre-wrap;
  word-wrap: break-word;
}
</style>