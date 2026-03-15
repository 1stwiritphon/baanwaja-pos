<script setup>
import { computed, onMounted, ref } from 'vue'
import { RouterLink, useRouter } from 'vue-router'
import { supabase } from '../lib/supabase'

const router = useRouter()

const form = ref({
  name: '',
  price: '',
  category: 'อาหาร',
})

const menu = ref([])
const editingId = ref(null)
const loading = ref(false)
const saving = ref(false)

const totalMenu = computed(() => menu.value.length)
const activeMenu = computed(() => menu.value.filter(item => item.active).length)

async function fetchMenu() {
  loading.value = true

  const { data, error } = await supabase
    .from('menu')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) {
    console.error(error)
    alert('โหลดเมนูไม่สำเร็จ')
  } else {
    menu.value = data || []
  }

  loading.value = false
}

function resetForm() {
  form.value = {
    name: '',
    price: '',
    category: 'อาหาร',
  }
  editingId.value = null
}

async function submitMenu() {
  const name = form.value.name.trim()
  const price = Number(form.value.price)

  if (!name || !price || price <= 0) {
    alert('กรอกชื่อเมนูและราคาให้ถูกต้อง')
    return
  }

  saving.value = true

  if (editingId.value) {
    const { error } = await supabase
      .from('menu')
      .update({
        name,
        price,
        category: form.value.category,
      })
      .eq('id', editingId.value)

    if (error) {
      console.error(error)
      alert('แก้ไขเมนูไม่สำเร็จ')
      saving.value = false
      return
    }
  } else {
    const { error } = await supabase
      .from('menu')
      .insert({
        name,
        price,
        category: form.value.category,
        active: true,
      })

    if (error) {
      console.error(error)
      alert('เพิ่มเมนูไม่สำเร็จ')
      saving.value = false
      return
    }
  }

  resetForm()
  await fetchMenu()
  saving.value = false
}

function editMenu(item) {
  editingId.value = item.id
  form.value = {
    name: item.name,
    price: item.price,
    category: item.category,
  }
}

async function deleteMenu(id) {
  const ok = confirm('ต้องการลบเมนูนี้หรือไม่')
  if (!ok) return

  const { error } = await supabase
    .from('menu')
    .delete()
    .eq('id', id)

  if (error) {
    console.error(error)
    alert('ลบเมนูไม่สำเร็จ')
    return
  }

  if (editingId.value === id) resetForm()
  await fetchMenu()
}

async function toggleActive(item) {
  const { error } = await supabase
    .from('menu')
    .update({ active: !item.active })
    .eq('id', item.id)

  if (error) {
    console.error(error)
    alert('เปลี่ยนสถานะไม่สำเร็จ')
    return
  }

  await fetchMenu()
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
      <div>
        <p class="eyebrow">ADMIN PAGE</p>
        <h1 class="page-title">จัดการเมนูร้าน</h1>
      </div>

      <div class="topbar-actions">
        <RouterLink to="/admin/dashboard" class="btn btn-secondary">Dashboard</RouterLink>
        <button class="btn btn-secondary" @click="handleLogout">Log out</button>
      </div>
    </header>

    <section class="stats-grid">
      <div class="stat-card">
        <span class="stat-label">เมนูทั้งหมด</span>
        <strong class="stat-value">{{ totalMenu }}</strong>
      </div>

      <div class="stat-card">
        <span class="stat-label">เมนูที่เปิดขาย</span>
        <strong class="stat-value">{{ activeMenu }}</strong>
      </div>
    </section>

    <section class="admin-grid">
      <div class="card">
        <div class="card-head">
          <div>
            <h2>{{ editingId ? 'แก้ไขเมนู' : 'เพิ่มเมนูใหม่' }}</h2>
            <p>กรอกข้อมูลเมนูให้ครบแล้วกดบันทึก</p>
          </div>
        </div>

        <div class="form-grid">
          <div class="field">
            <label>ชื่อเมนู</label>
            <input v-model="form.name" type="text" placeholder="เช่น ชาเขียว" />
          </div>

          <div class="field">
            <label>ราคา</label>
            <input v-model="form.price" type="number" placeholder="เช่น 35" />
          </div>

          <div class="field">
            <label>หมวดหมู่</label>
            <select v-model="form.category">
              <option>อาหาร</option>
              <option>เครื่องดื่ม</option>
              <option>ขนม</option>
              <option>ยำ</option>
              <option>กับข้าว</option>
              <option>ของทานเล่น</option>
            </select>
          </div>
        </div>

        <div class="form-actions">
          <button class="btn btn-primary" @click="submitMenu" :disabled="saving">
            {{ saving ? 'กำลังบันทึก...' : (editingId ? 'บันทึกการแก้ไข' : 'เพิ่มเมนู') }}
          </button>
          <button class="btn btn-secondary" @click="resetForm">ล้างฟอร์ม</button>
        </div>
      </div>

      <div class="card">
        <div class="card-head">
          <div>
            <h2>รายการเมนู</h2>
            <p>จัดการเมนูทั้งหมดของร้าน</p>
          </div>
        </div>

        <div v-if="loading" class="empty-box">กำลังโหลดข้อมูล...</div>

        <div v-else-if="menu.length === 0" class="empty-box">
          ยังไม่มีเมนูในระบบ
        </div>

        <div v-else class="menu-admin-list">
          <div v-for="item in menu" :key="item.id" class="menu-admin-item">
            <div class="menu-admin-main">
              <div class="menu-admin-top">
                <h3>{{ item.name }}</h3>
                <span class="pill">{{ item.category }}</span>
              </div>

              <div class="menu-admin-meta">
                <span>{{ Number(item.price) }} บาท</span>
                <span :class="item.active ? 'status-on' : 'status-off'">
                  {{ item.active ? 'เปิดขาย' : 'ปิดขาย' }}
                </span>
              </div>
            </div>

            <div class="menu-admin-actions">
              <button class="btn btn-small btn-secondary" @click="editMenu(item)">แก้ไข</button>
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