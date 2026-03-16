<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { supabase } from '../lib/supabase'
import {
showError,
showWarning,
showSuccess,
} from '../lib/alertService'

const router = useRouter()

const form = ref({
username: '',
password: '',
})

const loading = ref(false)

async function handleLogin() {
const username = form.value.username.trim()
const password = form.value.password.trim()

if (!username || !password) {
showWarning('กรอกชื่อผู้ใช้และรหัสผ่านให้ครบ')
return
}

loading.value = true

const { data, error } = await supabase
.from('users')
.select('*')
.eq('username', username)
.eq('password', password)
.single()

loading.value = false

if (error || !data) {
showError('ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง')
return
}

localStorage.setItem(
'user',
JSON.stringify({
id: data.id,
username: data.username,
role: data.role,
})
)



if (data.role === 'admin') {
router.push('/admin/dashboard')
} else {
router.push('/pos')
}
}
</script>

<template>
<div class="auth-page pos-background">
<div class="auth-card">
<div class="auth-brand">
<img src="/logo-baanwaja.jpeg" alt="บ้านวาจา" class="auth-logo" />
<div>
<h1 class="auth-title">ร้านอาหารบ้านวาจา</h1>
<p class="auth-subtitle">ระบบหลังบ้านร้านอาหารบ้านวาจา</p>
</div>
</div>

<div class="form-grid">
<div class="field">
<label>ชื่อผู้ใช้</label>
<input
v-model="form.username"
type="text"
placeholder="กรอกชื่อผู้ใช้"
@keyup.enter="handleLogin"
/>
</div>

<div class="field">
<label>รหัสผ่าน</label>
<input
v-model="form.password"
type="password"
placeholder="กรอกรหัสผ่าน"
@keyup.enter="handleLogin"
/>
</div>
</div>

<div class="form-actions" style="margin-top: 20px;">
<button class="btn btn-primary full-width" @click="handleLogin" :disabled="loading">
{{ loading ? 'กำลังเข้าสู่ระบบ...' : 'เข้าสู่ระบบ' }}
</button>
</div>
</div>
</div>
</template>