<script setup>
import { ref } from 'vue'
import { useRouter, RouterLink } from 'vue-router'
import { supabase } from '../lib/supabase'
import { getBusinessDate } from '../lib/businessDate'

const router = useRouter()
const user = JSON.parse(localStorage.getItem('user') || 'null')

const form = ref({
  title: '',
  amount: '',
  category: '',
  note: '',
})

const saving = ref(false)

async function saveExpense() {
  const amount = Number(form.value.amount)

  if (!form.value.title.trim() || !amount || amount <= 0) {
    alert('กรอกชื่อรายการและจำนวนเงินให้ถูกต้อง')
    return
  }

  saving.value = true

  const { error } = await supabase.from('expenses').insert({
    title: form.value.title,
    amount,
    category: form.value.category || 'ทั่วไป',
    note: form.value.note || null,
    created_by: user?.username || null,
    business_date: getBusinessDate(),
  })

  if (error) {
    console.error(error)
    alert('บันทึกรายจ่ายไม่สำเร็จ')
    saving.value = false
    return
  }

  alert('บันทึกรายจ่ายสำเร็จ')
  form.value = {
    title: '',
    amount: '',
    category: '',
    note: '',
  }
  saving.value = false
}

function handleLogout() {
  localStorage.removeItem('user')
  router.push('/login')
}
</script>

<template>
  <div class="page-shell">
    <header class="topbar">
      <div>
        <h1 class="page-title">เพิ่มรายจ่าย</h1>
        <p class="page-subtitle">บันทึกค่าใช้จ่ายของร้านในแต่ละวัน</p>
      </div>

      <div class="topbar-actions">
        <RouterLink to="/pos" class="btn btn-secondary">กลับหน้า POS</RouterLink>
        <RouterLink v-if="user?.role === 'admin'" to="/admin/dashboard" class="btn btn-secondary">แดชบอร์ด</RouterLink>
        <button class="btn btn-secondary" @click="handleLogout">ออกจากระบบ</button>
      </div>
    </header>

    <div class="card" style="max-width: 640px;">
      <div class="form-grid">
        <div class="field">
          <label>รายการ</label>
          <input v-model="form.title" type="text" placeholder="เช่น ซื้อหมู ซื้อผัก ค่าน้ำแข็ง" />
        </div>

        <div class="field">
          <label>จำนวนเงิน</label>
          <input v-model="form.amount" type="number" placeholder="เช่น 250" />
        </div>

        <div class="field">
          <label>หมวดหมู่</label>
          <input v-model="form.category" type="text" placeholder="เช่น วัตถุดิบ / เครื่องปรุง / อื่นๆ" />
        </div>

        <div class="field">
          <label>หมายเหตุ</label>
          <input v-model="form.note" type="text" placeholder="ใส่หรือไม่ใส่ก็ได้" />
        </div>
      </div>

      <div class="form-actions">
        <button class="btn btn-primary" @click="saveExpense" :disabled="saving">
          {{ saving ? 'กำลังบันทึก...' : 'บันทึกรายจ่าย' }}
        </button>
      </div>
    </div>
  </div>
</template>