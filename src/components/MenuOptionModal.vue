<script setup>
import { computed, ref, watch } from 'vue'

const props = defineProps({
  open: Boolean,
  menu: Object,
  proteins: {
    type: Array,
    default: () => [],
  },
  noodles: {
    type: Array,
    default: () => [],
  },
  extras: {
    type: Array,
    default: () => [],
  },
})

const emit = defineEmits(['close', 'add'])

const selectedProtein = ref('')
const selectedNoodle = ref('')
const selectedEggs = ref([])
const addIce = ref(false)

const eggExtras = computed(() => props.extras.filter((e) => e.extra_type === 'egg'))
const drinkExtras = computed(() => props.extras.filter((e) => e.extra_type === 'drink'))

const allowedProteins = computed(() => {
  if (!props.menu?.allow_protein) return []
  if (props.menu.protein_mode === 'all') return props.proteins
  if (props.menu.protein_mode === 'custom') {
    return props.proteins.filter((p) => props.menu.allowed_proteins?.includes(p.name))
  }
  return []
})

const customRules = computed(() => {
  try {
    if (Array.isArray(props.menu?.custom_price_rules)) return props.menu.custom_price_rules
    return JSON.parse(props.menu?.custom_price_rules || '[]')
  } catch {
    return []
  }
})

function toggleEgg(name) {
  if (selectedEggs.value.includes(name)) {
    selectedEggs.value = selectedEggs.value.filter((x) => x !== name)
  } else {
    selectedEggs.value.push(name)
  }
}

function calculatePrice() {
  if (!props.menu) return 0

  let total = Number(props.menu.base_price || props.menu.price || 0)

  const rule = customRules.value.find((r) => r.protein === selectedProtein.value)
  if (rule?.price != null) {
    total = Number(rule.price)
  } else if (selectedProtein.value) {
    const protein = props.proteins.find((p) => p.name === selectedProtein.value)
    if (protein) total += Number(protein.price_add || 0)
  }

  selectedEggs.value.forEach((eggName) => {
    const egg = eggExtras.value.find((e) => e.name === eggName)
    if (egg) total += Number(egg.price_add || 0)
  })

  if (addIce.value) {
    const ice = drinkExtras.value.find((e) => e.name === 'น้ำแข็ง')
    total += Number(ice?.price_add || 5)
  }

  return total
}

function buildName() {
  if (!props.menu) return ''

  const parts = []

  if (selectedProtein.value) parts.push(selectedProtein.value)
  if (selectedNoodle.value) parts.push(selectedNoodle.value)

  let name = props.menu.name
  if (parts.length) {
    name += ` (${parts.join(', ')})`
  }

  if (selectedEggs.value.length) {
    name += ` + ${selectedEggs.value.join(' + ')}`
  }

  if (addIce.value) {
    name += ' + น้ำแข็ง'
  }

  return name
}

const previewName = computed(() => buildName())
const previewPrice = computed(() => calculatePrice())

function handleAdd() {
  if (props.menu?.allow_protein && !selectedProtein.value) {
    alert('กรุณาเลือกเนื้อสัตว์')
    return
  }

  emit('add', {
    name: previewName.value,
    price: previewPrice.value,
  })
}

watch(
  () => props.open,
  (isOpen) => {
    if (isOpen) {
      selectedProtein.value = ''
      selectedNoodle.value = ''
      selectedEggs.value = []
      addIce.value = false
    }
  }
)
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
        <div v-if="menu.allow_protein" class="field">
          <label>เลือกเนื้อสัตว์</label>
          <div class="option-grid">
            <button
              v-for="protein in allowedProteins"
              :key="protein.id"
              type="button"
              class="option-btn"
              :class="{ active: selectedProtein === protein.name }"
              @click="selectedProtein = protein.name"
            >
              {{ protein.name }}
              <span v-if="Number(protein.price_add) > 0">+{{ Number(protein.price_add) }}</span>
            </button>
          </div>
        </div>

        <div v-if="menu.allow_noodle" class="field">
          <label>เลือกเส้น (ไม่เลือกก็ได้)</label>
          <div class="option-grid">
            <button
              v-for="noodle in noodles"
              :key="noodle.id"
              type="button"
              class="option-btn"
              :class="{ active: selectedNoodle === noodle.name }"
              @click="selectedNoodle = selectedNoodle === noodle.name ? '' : noodle.name"
            >
              {{ noodle.name }}
            </button>
          </div>
        </div>

        <div v-if="menu.allow_egg" class="field">
          <label>เพิ่มไข่</label>
          <div class="option-grid">
            <button
              v-for="egg in eggExtras"
              :key="egg.id"
              type="button"
              class="option-btn"
              :class="{ active: selectedEggs.includes(egg.name) }"
              @click="toggleEgg(egg.name)"
            >
              {{ egg.name }} +{{ Number(egg.price_add) }}
            </button>
          </div>
        </div>

        <div v-if="menu.allow_ice" class="field">
          <label>ตัวเลือกเพิ่มเติม</label>
          <div class="option-grid">
            <button
              type="button"
              class="option-btn"
              :class="{ active: addIce }"
              @click="addIce = !addIce"
            >
              น้ำแข็ง +5
            </button>
          </div>
        </div>
      </div>

      <div class="modal-summary">
        <div class="summary-preview">{{ previewName }}</div>
        <div class="summary-price">{{ previewPrice }} บาท</div>
      </div>

      <div class="form-actions">
        <button class="btn btn-secondary" @click="emit('close')">ยกเลิก</button>
        <button class="btn btn-primary" @click="handleAdd">เพิ่มลงบิล</button>
      </div>
    </div>
  </div>
</template>