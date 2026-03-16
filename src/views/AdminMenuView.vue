<script setup>
import { computed, onMounted, ref } from 'vue'
import { RouterLink, useRouter } from 'vue-router'
import { supabase } from '../lib/supabase'
import { fetchCurrentMenus } from '../lib/menuDataService'

const router = useRouter()

const loading = ref(false)
const saving = ref(false)
const menuList = ref([])

const searchText = ref('')
const selectedCategory = ref('ทั้งหมด')

const form = ref({
  id: null,
  name: '',
  price: '',
  base_price: '',
  category: 'ราดข้าว',
  active: true,
  source_type: 'fixed',
  allow_protein: false,
  protein_mode: 'none',
  allowed_proteins_text: '',
  allow_noodle: false,
  allow_egg: false,
  allow_ice: false,
  custom_price_rules_text: '[]',
})

const isEditing = computed(() => !!form.value.id)

const categories = computed(() => {
  const unique = [...new Set(menuList.value.map((item) => item.category).filter(Boolean))]
  const preset = ['ราดข้าว', 'กับข้าว', 'ยำ', 'ของทานเล่น', 'เครื่องดื่ม', 'ของหวาน']
  return ['ทั้งหมด', ...new Set([...preset, ...unique])]
})

const filteredMenuList = computed(() => {
  let items = [...menuList.value]

  if (selectedCategory.value !== 'ทั้งหมด') {
    items = items.filter((item) => item.category === selectedCategory.value)
  }

  if (searchText.value.trim()) {
    const keyword = searchText.value.trim().toLowerCase()
    items = items.filter((item) => item.name.toLowerCase().includes(keyword))
  }

  return items
})

async function fetchMenu() {
  loading.value = true
  try {
    menuList.value = await fetchCurrentMenus(false)
  } catch (error) {
    console.error(error)
    alert('โหลดเมนูไม่สำเร็จ')
  } finally {
    loading.value = false
  }
}

function resetForm() {
  form.value = {
    id: null,
    name: '',
    price: '',
    base_price: '',
    category: 'ราดข้าว',
    active: true,
    source_type: 'fixed',
    allow_protein: false,
    protein_mode: 'none',
    allowed_proteins_text: '',
    allow_noodle: false,
    allow_egg: false,
    allow_ice: false,
    custom_price_rules_text: '[]',
  }
}

function startEdit(item) {
  form.value = {
    id: item.id,
    name: item.name,
    price: Number(item.price),
    base_price: Number(item.base_price),
    category: item.category,
    active: item.active,
    source_type: item.source_type,
    allow_protein: item.allow_protein,
    protein_mode: item.protein_mode,
    allowed_proteins_text: (item.allowed_proteins || []).join(', '),
    allow_noodle: item.allow_noodle,
    allow_egg: item.allow_egg,
    allow_ice: item.allow_ice,
    custom_price_rules_text: JSON.stringify(item.custom_price_rules || [], null, 2),
  }
}

async function saveMenu() {
  const name = form.value.name.trim()
  const price = Number(form.value.price)
  const basePrice = Number(form.value.base_price || form.value.price)

  if (!name || !price || price <= 0 || !form.value.category) {
    alert('กรอกข้อมูลให้ครบและถูกต้อง')
    return
  }

  let customRules = []
  try {
    customRules = JSON.parse(form.value.custom_price_rules_text || '[]')
  } catch {
    alert('custom_price_rules ต้องเป็น JSON ที่ถูกต้อง')
    return
  }

  const payload = {
    name,
    price,
    base_price: basePrice,
    category: form.value.category,
    active: form.value.active,
    source_type: form.value.source_type,
    allow_protein: form.value.allow_protein,
    protein_mode: form.value.protein_mode,
    allowed_proteins: form.value.allowed_proteins_text
      ? form.value.allowed_proteins_text.split(',').map((x) => x.trim()).filter(Boolean)
      : [],
    allow_noodle: form.value.allow_noodle,
    allow_egg: form.value.allow_egg,
    allow_ice: form.value.allow_ice,
    custom_price_rules: customRules,
    is_current: true,
  }

  saving.value = true

  if (form.value.id) {
    const { error } = await supabase.from('menu').update(payload).eq('id', form.value.id)
    if (error) {
      alert(error.message || 'แก้ไขเมนูไม่สำเร็จ')
      saving.value = false
      return
    }
    alert('แก้ไขเมนูสำเร็จ')
  } else {
    const { error } = await supabase.from('menu').insert(payload)
    if (error) {
      alert(error.message || 'เพิ่มเมนูไม่สำเร็จ')
      saving.value = false
      return
    }
    alert('เพิ่มเมนูสำเร็จ')
  }

  resetForm()
  saving.value = false
  fetchMenu()
}

async function toggleActive(item) {
  const { error } = await supabase.from('menu').update({ active: !item.active }).eq('id', item.id)
  if (error) {
    alert('เปลี่ยนสถานะเมนูไม่สำเร็จ')
    return
  }
  fetchMenu()
}

async function deleteMenu(id) {
  const ok = confirm('ต้องการลบเมนูนี้หรือไม่')
  if (!ok) return

  const { error } = await supabase.from('menu').delete().eq('id', id)
  if (error) {
    alert(error.message || 'ลบเมนูไม่สำเร็จ')
    return
  }

  alert('ลบเมนูเรียบร้อย')
  fetchMenu()
}

function handleLogout() {
  localStorage.removeItem('user')
  router.push('/login')
}

onMounted(fetchMenu)
</script>

<template>
  <div class="page-shell">
    <header class="topbar">
      <div class="brand-header">
        <img src="/logo-baanwaja.jpeg" alt="บ้านวาจา" class="brand-header-logo" />
        <div>
          <p class="eyebrow">BAAN WAJA</p>
          <h1 class="page-title">จัดการเมนูร้าน</h1>
          <p class="page-subtitle">เมนูทั้งหมดมาจากฐานข้อมูล</p>
        </div>
      </div>

      <div class="topbar-actions">
        <RouterLink to="/admin/dashboard" class="btn btn-secondary">แดชบอร์ด</RouterLink>
        <RouterLink to="/expenses" class="btn btn-secondary">เพิ่มรายจ่าย</RouterLink>
        <RouterLink to="/pos" class="btn btn-secondary">POS</RouterLink>
        <button class="btn btn-secondary" @click="handleLogout">ออกจากระบบ</button>
      </div>
    </header>

    <section class="admin-grid">
      <div class="card admin-menu-form-card">
        <div class="card-head">
          <div>
            <h2>{{ isEditing ? 'แก้ไขเมนู' : 'เพิ่มเมนูใหม่' }}</h2>
            <p>เชื่อมกับ Supabase โดยตรง</p>
          </div>
        </div>

        <div class="form-grid">
          <div class="field">
            <label>ชื่อเมนู</label>
            <input v-model="form.name" type="text" />
          </div>

          <div class="field">
            <label>ราคา final</label>
            <input v-model="form.price" type="number" />
          </div>

          <div class="field">
            <label>ราคา base</label>
            <input v-model="form.base_price" type="number" />
          </div>

          <div class="field">
            <label>หมวดหมู่</label>
            <select v-model="form.category">
              <option value="ราดข้าว">ราดข้าว</option>
              <option value="กับข้าว">กับข้าว</option>
              <option value="ยำ">ยำ</option>
              <option value="ของทานเล่น">ของทานเล่น</option>
              <option value="เครื่องดื่ม">เครื่องดื่ม</option>
              <option value="ของหวาน">ของหวาน</option>
            </select>
          </div>

          <div class="field">
            <label>ประเภทเมนู</label>
            <select v-model="form.source_type">
              <option value="fixed">fixed</option>
              <option value="configurable">configurable</option>
            </select>
          </div>

          <div class="field">
            <label>สถานะขาย</label>
            <select v-model="form.active">
              <option :value="true">เปิดขาย</option>
              <option :value="false">ปิดขาย</option>
            </select>
          </div>

          <div class="field">
            <label>protein_mode</label>
            <select v-model="form.protein_mode">
              <option value="none">none</option>
              <option value="all">all</option>
              <option value="custom">custom</option>
            </select>
          </div>

          <div class="field">
            <label>allowed_proteins (คั่นด้วย ,)</label>
            <input v-model="form.allowed_proteins_text" type="text" />
          </div>

          <div class="field">
            <label><input v-model="form.allow_protein" type="checkbox" /> allow_protein</label>
          </div>

          <div class="field">
            <label><input v-model="form.allow_noodle" type="checkbox" /> allow_noodle</label>
          </div>

          <div class="field">
            <label><input v-model="form.allow_egg" type="checkbox" /> allow_egg</label>
          </div>

          <div class="field">
            <label><input v-model="form.allow_ice" type="checkbox" /> allow_ice</label>
          </div>

          <div class="field" style="grid-column: 1 / -1;">
            <label>custom_price_rules (JSON)</label>
            <textarea v-model="form.custom_price_rules_text" rows="5"></textarea>
          </div>
        </div>

        <div class="form-actions">
          <button class="btn btn-primary" @click="saveMenu" :disabled="saving">
            {{ saving ? 'กำลังบันทึก...' : isEditing ? 'บันทึกการแก้ไข' : 'เพิ่มเมนู' }}
          </button>

          <button v-if="isEditing" class="btn btn-secondary" @click="resetForm">
            ยกเลิกการแก้ไข
          </button>
        </div>
      </div>

      <div class="card admin-menu-list-card">
        <div class="card-head">
          <div>
            <h2>รายการเมนูทั้งหมด</h2>
            <p>ค้นหาและกรองหมวดหมู่ได้</p>
          </div>
        </div>

        <div class="form-grid" style="margin-bottom: 16px;">
          <div class="field">
            <label>ค้นหาเมนู</label>
            <input v-model="searchText" type="text" placeholder="พิมพ์ชื่อเมนู" />
          </div>

          <div class="field">
            <label>หมวดหมู่</label>
            <select v-model="selectedCategory">
              <option v-for="category in categories" :key="category" :value="category">
                {{ category }}
              </option>
            </select>
          </div>
        </div>

        <div v-if="loading" class="empty-box">กำลังโหลดเมนู...</div>
        <div v-else-if="filteredMenuList.length === 0" class="empty-box">ไม่พบเมนู</div>

        <div v-else class="menu-admin-list">
          <div
            v-for="(item, index) in filteredMenuList"
            :key="item.id"
            class="menu-admin-item admin-menu-striped-item"
            :class="{ 'is-alt': index % 2 === 0 }"
          >
            <div>
              <div class="menu-admin-top">
                <h3>{{ item.name }}</h3>
                <span class="pill" :class="{ 'pill-muted': !item.active }">
                  {{ item.active ? 'เปิดขาย' : 'ปิดขาย' }}
                </span>
              </div>

              <div class="menu-admin-meta">
                <span>{{ Number(item.price) }} บาท</span>
                <span>{{ item.category }}</span>
                <span>{{ item.source_type }}</span>
              </div>
            </div>

            <div class="menu-admin-actions">
              <button class="btn btn-small btn-secondary" @click="startEdit(item)">แก้ไข</button>
              <button class="btn btn-small btn-secondary" @click="toggleActive(item)">
                {{ item.active ? 'ปิดขาย' : 'เปิดขาย' }}
              </button>
              <button class="btn btn-small btn-danger" @click="deleteMenu(item.id)">ลบ</button>
            </div>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>