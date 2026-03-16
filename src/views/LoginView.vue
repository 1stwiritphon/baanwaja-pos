<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { supabase } from '../lib/supabase'
import {
showSuccess,
showError,
showWarning,
showConfirm,
showDeleteConfirm
} from "../lib/alertService"

const router = useRouter()

const username = ref('')
const password = ref('')
const loading = ref(false)

async function handleLogin() {
  if (!username.value || !password.value) {
    showWarning('กรอก username และ password')
    return
  }

  loading.value = true

  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('username', username.value)
    .eq('password', password.value)
    .eq('active', true)
    .single()

  if (error || !data) {
    console.error(error)
    showError('username หรือ password ไม่ถูกต้อง')
    loading.value = false
    return
  }

  localStorage.setItem('user', JSON.stringify(data))

  if (data.role === 'admin') {
    router.push('/admin/dashboard')
  } else {
    router.push('/pos')
  }

  loading.value = false
}
</script>

<template>
  <div class="auth-page pos-background">
    <div class="auth-card">
      <div class="auth-brand">
        <img
          src="/logo-baanwaja.jpeg"
          alt="บ้านวาจา"
          class="auth-logo"
        />
        <div class="auth-brand-text">
          <h1 class="auth-title">เข้าสู่ระบบ</h1>
          <p class="auth-subtitle">
            ระบบจัดการร้านอาหารบ้านวาจา
          </p>
        </div>
      </div>

      <div class="form-grid">
        <div class="field">
          <label>Username</label>
          <input
            v-model="username"
            type="text"
            placeholder="username"
          />
        </div>

        <div class="field">
          <label>Password</label>
          <input
            v-model="password"
            type="password"
            placeholder="password"
          />
        </div>
      </div>

      <div class="form-actions">
        <button class="btn btn-primary full-width" @click="handleLogin" :disabled="loading">
          {{ loading ? 'กำลังเข้าสู่ระบบ...' : 'เข้าสู่ระบบ' }}
        </button>
      </div>
    </div>
  </div>
</template>