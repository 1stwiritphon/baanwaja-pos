<script setup>
import { computed, onMounted, ref } from 'vue'
import { RouterLink, useRouter } from 'vue-router'
import { supabase } from '../lib/supabase'

const router = useRouter()
const user = JSON.parse(localStorage.getItem('user') || 'null')

const loading = ref(false)
const saving = ref(false)
const menuList = ref([])

const searchText = ref('')
const selectedCategory = ref('ทั้งหมด')

const form = ref({
id: null,
name: '',
price: '',
category: '',
active: true,
})

const isEditing = computed(() => !!form.value.id)

const categories = computed(() => {
const unique = [...new Set(menuList.value.map(item => item.category).filter(Boolean))]
return ['ทั้งหมด', ...unique]
})

const filteredMenuList = computed(() => {
let items = [...menuList.value]

if (selectedCategory.value !== 'ทั้งหมด') {
items = items.filter(item => item.category === selectedCategory.value)
}

if (searchText.value.trim()) {
const keyword = searchText.value.trim().toLowerCase()
items = items.filter(item => item.name.toLowerCase().includes(keyword))
}

return items
})

async function fetchMenu() {
loading.value = true

const { data, error } = await supabase
.from('menu')
.select('*')
.order('category', { ascending: true })
.order('name', { ascending: true })

if (error) {
console.error(JSON.stringify(error, null, 2))
alert(error.message || 'โหลดเมนูไม่สำเร็จ')
} else {
menuList.value = data || []
}

loading.value = false
}

function resetForm() {
form.value = {
id: null,
name: '',
price: '',
category: '',
active: true,
}
}

function startEdit(item) {
form.value = {
id: item.id,
name: item.name,
price: Number(item.price),
category: item.category,
active: item.active,
}
}

async function saveMenu() {
const name = form.value.name.trim()
const price = Number(form.value.price)
const category = form.value.category.trim()

if (!name || !price || price <= 0 || !category) {
alert('กรอกชื่อเมนู ราคา และหมวดหมู่ให้ถูกต้อง')
return
}

saving.value = true

if (form.value.id) {
const { error } = await supabase
.from('menu')
.update({
name,
price,
category,
active: form.value.active,
})
.eq('id', form.value.id)

if (error) {
console.error(JSON.stringify(error, null, 2))
alert(error.message || 'แก้ไขเมนูไม่สำเร็จ')
saving.value = false
return
}

alert('แก้ไขเมนูสำเร็จ')
} else {
const { error } = await supabase
.from('menu')
.insert({
name,
price,
category,
active: form.value.active,
})

if (error) {
console.error(JSON.stringify(error, null, 2))
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
const { error } = await supabase
.from('menu')
.update({ active: !item.active })
.eq('id', item.id)

if (error) {
console.error(JSON.stringify(error, null, 2))
alert('เปลี่ยนสถานะเมนูไม่สำเร็จ')
return
}

fetchMenu()
}

async function deleteMenu(id) {
const ok = confirm('ต้องการลบเมนูนี้หรือไม่')
if (!ok) return

const { error } = await supabase
.from('menu')
.delete()
.eq('id', id)

if (error) {
console.error(JSON.stringify(error, null, 2))
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

onMounted(() => {
fetchMenu()
})
</script>

<template>
<div class="page-shell">
<header class="topbar">
<div class="brand-header">
<img src="/logo-baanwaja.jpeg" alt="บ้านวาจา" class="brand-header-logo" />
<div>
<h1 class="page-title">จัดการเมนูร้าน</h1>

</div>
</div>

<div class="topbar-actions">
<RouterLink to="/admin/dashboard" class="btn btn-secondary">Dashboard</RouterLink>
<RouterLink to="/expenses" class="btn btn-secondary">เพิ่มรายจ่าย</RouterLink>
<button class="btn btn-secondary" @click="handleLogout">Log out</button>
</div>
</header>

<section class="admin-grid">
<div class="card">
<div class="card-head">
<div>
<h2>{{ isEditing ? 'แก้ไขเมนู' : 'เพิ่มเมนูใหม่' }}</h2>
<p>กรอกข้อมูลเมนูของร้าน</p>
</div>
</div>

<div class="form-grid">
<div class="field">
<label>ชื่อเมนู</label>
<input v-model="form.name" type="text" placeholder="เช่น ชาเย็น" />
</div>

<div class="field">
<label>ราคา</label>
<input v-model="form.price" type="number" placeholder="เช่น 25" />
</div>

<div class="field">
<label>หมวดหมู่</label>
<input v-model="form.category" type="text" placeholder="เช่น เครื่องดื่ม / ขนม / ไอติม" />
</div>

<div class="field">
<label>สถานะขาย</label>
<select v-model="form.active">
<option :value="true">เปิดขาย</option>
<option :value="false">ปิดขาย</option>
</select>
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

<div class="card">
<div class="card-head">
<div>
<h2>รายการเมนูทั้งหมด</h2>
<p>ค้นหาและกรองหมวดหมู่เพื่อจัดการได้ง่ายขึ้น</p>
</div>
</div>

<div class="form-grid" style="margin-bottom: 16px;">
<div class="field">
<label>ค้นหาเมนู</label>
<input
v-model="searchText"
type="text"
placeholder="พิมพ์ชื่อเมนูที่ต้องการหา"
/>
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

<div v-else-if="filteredMenuList.length === 0" class="empty-box">
ไม่พบเมนูตามเงื่อนไขที่ค้นหา
</div>

<div v-else class="menu-admin-list">
<div v-for="item in filteredMenuList" :key="item.id" class="menu-admin-item">
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
</div>
</div>

<div class="menu-admin-actions">
<button class="btn btn-small btn-secondary" @click="startEdit(item)">
แก้ไข
</button>

<button class="btn btn-small btn-secondary" @click="toggleActive(item)">
{{ item.active ? 'ปิดขาย' : 'เปิดขาย' }}
</button>

<button class="btn btn-small btn-danger" @click="deleteMenu(item.id)">
ลบ
</button>
</div>
</div>
</div>
</div>
</section>
</div>
</template>