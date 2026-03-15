<script setup>
import { computed, ref, watch } from 'vue'
import {
  proteins,
  noodles,
  eggs,
  getAllowedProteins,
  calculateCustomMenuPrice,
  buildCustomMenuName,
} from '../data/menuOptions'

const props = defineProps({
  open: Boolean,
  menu: Object,
})

const emit = defineEmits(['close', 'add'])

const selectedProtein = ref('')
const selectedNoodle = ref('')
const selectedEggs = ref([])

const allowedProteins = computed(() => getAllowedProteins(props.menu))

const totalPrice = computed(() => {
  if (!props.menu) return 0
  return calculateCustomMenuPrice(props.menu, selectedProtein.value, selectedEggs.value)
})

const previewName = computed(() => {
  if (!props.menu) return ''
  return buildCustomMenuName(
    props.menu,
    selectedProtein.value,
    selectedNoodle.value,
    selectedEggs.value
  )
})

watch(
  () => props.open,
  (isOpen) => {
    if (isOpen) {
      selectedProtein.value = ''
      selectedNoodle.value = ''
      selectedEggs.value = []
    }
  }
)

function toggleEgg(eggKey) {
  if (selectedEggs.value.includes(eggKey)) {
    selectedEggs.value = selectedEggs.value.filter((e) => e !== eggKey)
  } else {
    selectedEggs.value.push(eggKey)
  }
}

function handleAdd() {
  if (props.menu?.allowProtein && !selectedProtein.value) {
    alert('กรุณาเลือกเนื้อสัตว์')
    return
  }

  emit('add', {
    name: previewName.value || props.menu.name,
    price: totalPrice.value,
    menuKey: props.menu.key,
    protein: selectedProtein.value || null,
    noodle: selectedNoodle.value || null,
    eggs: selectedEggs.value,
  })
}
</script>

<template>
  <div v-if="open && menu" class="modal-backdrop" @click.self="emit('close')">
    <div class="modal-card">
      <div class="modal-head">
        <div>
          <h3 class="modal-title">{{ menu.name }}</h3>
          <p class="modal-subtitle">เลือกรายละเอียดก่อนเพิ่มลงบิล</p>
        </div>

        <button class="modal-close" @click="emit('close')">✕</button>
      </div>

      <div class="form-grid">
        <div v-if="menu.allowProtein" class="field">
          <label>เลือกเนื้อสัตว์</label>
          <div class="option-grid">
            <button
              v-for="protein in allowedProteins"
              :key="protein.key"
              type="button"
              class="option-btn"
              :class="{ active: selectedProtein === protein.key }"
              @click="selectedProtein = protein.key"
            >
              {{ protein.label }}
              <span v-if="protein.priceAdd > 0">+{{ protein.priceAdd }}</span>
            </button>
          </div>
        </div>

        <div v-if="menu.allowNoodle" class="field">
          <label>เลือกเส้น (ไม่เลือกก็ได้)</label>
          <div class="option-grid">
            <button
              v-for="noodle in noodles"
              :key="noodle.key"
              type="button"
              class="option-btn"
              :class="{ active: selectedNoodle === noodle.key }"
              @click="selectedNoodle = selectedNoodle === noodle.key ? '' : noodle.key"
            >
              {{ noodle.label }}
            </button>
          </div>
        </div>

        <div v-if="menu.allowEgg" class="field">
          <label>เพิ่มไข่</label>
          <div class="option-grid">
            <button
              v-for="egg in eggs"
              :key="egg.key"
              type="button"
              class="option-btn"
              :class="{ active: selectedEggs.includes(egg.key) }"
              @click="toggleEgg(egg.key)"
            >
              {{ egg.label }} +{{ egg.priceAdd }}
            </button>
          </div>
        </div>
      </div>

      <div class="modal-summary">
        <div class="summary-preview">{{ previewName || menu.name }}</div>
        <div class="summary-price">{{ totalPrice }} บาท</div>
      </div>

      <div class="form-actions">
        <button class="btn btn-secondary" @click="emit('close')">ยกเลิก</button>
        <button class="btn btn-primary" @click="handleAdd">เพิ่มลงบิล</button>
      </div>
    </div>
  </div>
</template>