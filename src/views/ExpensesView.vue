<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { supabase } from '../lib/supabase'
import { getBusinessDate } from '../lib/businessDate'
import AppTopActions from '../components/AppTopActions.vue'
import {
showSuccess,
showError,
showWarning,
showConfirm,
showDeleteConfirm
} from "../lib/alertService"

const router = useRouter()
const user = JSON.parse(localStorage.getItem('user') || 'null')

const saving = ref(false)

const form = ref({
title: '',
amount: '',
category: '',
note: '',
})

async function saveExpense() {
const title = form.value.title.trim()
const amount = Number(form.value.amount)
const category = form.value.category.trim()
const note = form.value.note.trim()

if (!title || !amount || amount <= 0 || !category) {
showWarning('กรอกชื่อรายการ จำนวนเงิน และหมวดหมู่ให้ถูกต้อง')
return
}

saving.value = true

const { error } = await supabase.from('expenses').insert({
title,
amount,
category,
note: note || null,
business_date: getBusinessDate(),
created_by: user?.username || null,
})

if (error) {
showError(`บันทึกรายจ่ายไม่สำเร็จ: ${error.message}`)
saving.value = false
return
}

showSuccess('บันทึกรายจ่ายเรียบร้อย')

form.value = {
title: '',
amount: '',
category: '',
note: '',
}

saving.value = false

if (user?.role === 'admin') {
router.push('/admin/dashboard')
} else {
router.push('/pos')
}
}
</script>

<template>
<div class="page-shell pos-background">
<header class="topbar">
<div class="brand-header">
<img src="/logo-baanwaja.jpeg" alt="บ้านวาจา" class="brand-header-logo" />
<div>
<p class="eyebrow">BANVAJA</p>
<h1 class="page-title">ร้านอาหารบ้านวาจา</h1>
<p class="page-subtitle">ระบบบันทึกรายจ่าย</p>
</div>
</div>

<AppTopActions
page="expenses"
:role="user?.role || ''"
/>
</header>

<section class="expense-page-wrap">
<div class="expense-card">
<div class="expense-card-top">
<div class="expense-icon-badge">฿</div>
<div>
<h2>ฟอร์มบันทึกรายจ่าย</h2>
</div>
</div>

<div class="expense-form-grid">
<div class="field">
<label>ชื่อรายจ่าย</label>
<input
v-model="form.title"
type="text"
placeholder="กรอกชื่อรายจ่าย"
/>
</div>

<div class="field">
<label>จำนวนเงิน</label>
<input
v-model="form.amount"
type="number"
placeholder="กรอกจำนวนเงิน"
/>
</div>

<div class="field">
<label>หมวดหมู่</label>
<select v-model="form.category">
<option value="">เลือกหมวดหมู่</option>
<option value="วัตถุดิบ">วัตถุดิบ</option>
<option value="เครื่องดื่ม">เครื่องดื่ม</option>
<option value="ของใช้ในร้าน">ของใช้ในร้าน</option>
<option value="ค่าน้ำมัน">ค่าน้ำมัน</option>
<option value="ค่าแรง">ค่าแรง</option>
<option value="อื่นๆ">อื่นๆ</option>
</select>
</div>

<div class="field field-full">
<label>หมายเหตุ</label>
<textarea
v-model="form.note"
rows="4"
placeholder="รายละเอียดเพิ่มเติม เช่น ซื้ออะไรมาบ้าง (ไม่บังคับ)"
/>
</div>
</div>

<div class="expense-note-box">
ระบบบันทึกรายจ่ายเข้าของวันที่ตามรอบบิลอัตโนมัติ
</div>

<div class="form-actions expense-actions">
<button class="expense-save-btn" @click="saveExpense" :disabled="saving">
{{ saving ? 'กำลังบันทึก...' : 'บันทึกรายจ่าย' }}
</button>
</div>
</div>
</section>
</div>
</template>