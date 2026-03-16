<script setup>
import { computed, onMounted, ref } from 'vue'
import { supabase } from '../lib/supabase'
import { fetchCurrentMenus } from '../lib/menuDataService'
import AppTopActions from '../components/AppTopActions.vue'
import {
showSuccess,
showError,
showWarning,
showConfirm,
showDeleteConfirm
} from "../lib/alertService"

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
})

const isEditing = computed(() => !!form.value.id)
const isConfigurable = computed(() => form.value.source_type === 'configurable')
const showAllowedProteins = computed(
() => isConfigurable.value && form.value.allow_protein && form.value.protein_mode === 'custom'
)

const categories = computed(() => {
const unique = [...new Set(menuList.value.map((item) => item.category).filter(Boolean))]
const preset = ['ราดข้าว', 'กับข้าว', 'ยำ', 'ของทานเล่น', 'เครื่องดื่ม', 'ของหวาน']
return ['ทั้งหมด', ...new Set([...preset, ...unique])]
})

const totalMenuCount = computed(() => menuList.value.length)

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

const filteredMenuCount = computed(() => filteredMenuList.value.length)

async function fetchMenu() {
loading.value = true
try {
menuList.value = await fetchCurrentMenus(false)
} catch (error) {
console.error(error)
showError('โหลดเมนูไม่สำเร็จ')
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
}
}

function startEdit(item) {
form.value = {
id: item.id,
name: item.name,
price: Number(item.price),
base_price: Number(item.base_price || item.price),
category: item.category,
active: item.active,
source_type: item.source_type || 'fixed',
allow_protein: item.allow_protein || false,
protein_mode: item.protein_mode || 'none',
allowed_proteins_text: (item.allowed_proteins || []).join(', '),
allow_noodle: item.allow_noodle || false,
allow_egg: item.allow_egg || false,
allow_ice: item.allow_ice || false,
}
}

async function saveMenu() {
const name = form.value.name.trim()
const price = Number(form.value.price)
const basePrice = Number(form.value.base_price || form.value.price)

if (!name || !price || price <= 0 || !form.value.category) {
showWarning('กรอกชื่อเมนู ราคา และหมวดหมู่ให้ถูกต้อง')
return
}

const payload = {
name,
price,
base_price: basePrice,
category: form.value.category,
active: form.value.active,
source_type: form.value.source_type,
allow_protein: isConfigurable.value ? form.value.allow_protein : false,
protein_mode: isConfigurable.value ? form.value.protein_mode : 'none',
allowed_proteins:
isConfigurable.value && form.value.allowed_proteins_text
? form.value.allowed_proteins_text.split(',').map((x) => x.trim()).filter(Boolean)
: [],
allow_noodle: isConfigurable.value ? form.value.allow_noodle : false,
allow_egg: isConfigurable.value ? form.value.allow_egg : false,
allow_ice: isConfigurable.value ? form.value.allow_ice : false,
custom_price_rules: [],
is_current: true,
}

saving.value = true

if (form.value.id) {
const { error } = await supabase
.from('menu')
.update(payload)
.eq('id', form.value.id)

if (error) {
showError(error.message || 'แก้ไขเมนูไม่สำเร็จ')
saving.value = false
return
}

showSuccess('แก้ไขเมนูสำเร็จ')
} else {
const { error } = await supabase
.from('menu')
.insert(payload)

if (error) {
showError(error.message || 'เพิ่มเมนูไม่สำเร็จ')
saving.value = false
return
}

showSuccess('เพิ่มเมนูสำเร็จ')
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
showError('เปลี่ยนสถานะเมนูไม่สำเร็จ')
return
}

fetchMenu()
}


async function deleteMenu(id) {
const ok = await showDeleteConfirm('ต้องการลบเมนูนี้หรือไม่')
if (!ok) return

const { error } = await supabase
.from('menu')
.update({
active: false,
is_current: false,
})
.eq('id', id)

if (error) {
showError(error.message || 'ลบเมนูไม่สำเร็จ')
return
}

showSuccess('ลบเมนูเรียบร้อย')
fetchMenu()
}


onMounted(fetchMenu)
</script>

<template>
<div class="page-shell admin-menu-background">
<header class="topbar">
<div class="brand-header">
<img src="/logo-baanwaja.jpeg" alt="บ้านวาจา" class="brand-header-logo" />
<div>
<p class="eyebrow">BAAN WAJA</p>
<h1 class="page-title">จัดการเมนูร้าน</h1>
<p class="page-subtitle">เมนูทั้งหมดมาจากฐานข้อมูล</p>
</div>
</div>

<AppTopActions page="menu" />
</header>

<section class="admin-grid">
<div class="card admin-menu-form-card">
<div class="card-head">
<div>
<h2>{{ isEditing ? 'แก้ไขเมนู' : 'เพิ่มเมนูใหม่' }}</h2>
<p>เพิ่ม ลบ แก้ไขเมนูจากฐานข้อมูลโดยตรง</p>
</div>
</div>

<div class="form-grid">
<div class="field">
<label>ชื่อเมนู</label>
<input v-model="form.name" type="text" placeholder="เช่น กะเพรา" />
</div>

<div class="field">
<label>ราคา</label>
<input v-model="form.price" type="number" placeholder="เช่น 60" />
</div>

<div class="field">
<label>ราคา base</label>
<input v-model="form.base_price" type="number" placeholder="เช่น 60" />
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
<option value="fixed">ไม่มีตัวเลือก</option>
<option value="configurable">มีตัวเลือก</option>
</select>
</div>

<div class="field">
<label>สถานะขาย</label>
<select v-model="form.active">
<option :value="true">เปิดขาย</option>
<option :value="false">ปิดขาย</option>
</select>
</div>

<template v-if="isConfigurable">
<div class="field field-full">
<label>ตัวเลือกเพิ่มเติมของเมนู</label>

<div class="admin-option-grid">
<label class="admin-option-card">
<input v-model="form.allow_protein" type="checkbox" />
<span>เลือกเนื้อสัตว์ได้</span>
</label>

<label class="admin-option-card">
<input v-model="form.allow_noodle" type="checkbox" />
<span>เลือกเส้นได้</span>
</label>

<label class="admin-option-card">
<input v-model="form.allow_egg" type="checkbox" />
<span>เพิ่มไข่ได้</span>
</label>

<label class="admin-option-card">
<input v-model="form.allow_ice" type="checkbox" />
<span>เพิ่มน้ำแข็งได้</span>
</label>
</div>
</div>

<div class="field" v-if="form.allow_protein">
<label>รูปแบบเนื้อสัตว์</label>
<select v-model="form.protein_mode">
<option value="none">ไม่มี</option>
<option value="all">เลือกได้ทั้งหมด</option>
<option value="custom">เลือกเฉพาะบางอย่าง</option>
</select>
</div>

<div class="field" v-if="showAllowedProteins">
<label>เนื้อสัตว์ที่อนุญาต (คั่นด้วย ,)</label>
<input
v-model="form.allowed_proteins_text"
type="text"
placeholder="เช่น หมู, ไก่, กุ้ง"
/>
</div>
</template>
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
<div class="card-head admin-menu-head">
<div>
<h2>รายการเมนูทั้งหมด</h2>
<p>ค้นหาและจัดการเมนูในร้านได้จากด้านล่าง</p>
</div>

<div class="menu-count-wrap" v-if="!loading">
<div class="menu-count-card total">
<span class="menu-count-label">เมนูทั้งหมด</span>
<strong class="menu-count-value">{{ totalMenuCount }}</strong>
</div>

<div class="menu-count-card filtered">
<span class="menu-count-label">กำลังแสดง</span>
<strong class="menu-count-value">{{ filteredMenuCount }}</strong>
</div>
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

<div class="admin-menu-scroll">
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
<span>{{ item.source_type === 'configurable' ? 'มีตัวเลือก' : 'ไม่มีตัวเลือก' }}</span>
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
</div>
</section>
</div>
</template>