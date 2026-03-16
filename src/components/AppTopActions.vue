<script setup>
import { computed } from 'vue'
import { RouterLink, useRouter } from 'vue-router'

const props = defineProps({
page: {
type: String,
required: true,
},
role: {
type: String,
default: '',
},
})

const router = useRouter()

function logout() {
localStorage.removeItem('user')
router.push('/login')
}

const showPos = computed(() => {
if (props.page === 'expenses' && props.role === 'staff') return true
return false
})

const showExpenses = computed(() => {
if (props.page === 'pos') return true
if (props.page === 'dashboard') return true
return false
})

const showDashboard = computed(() => {
if (props.page === 'menu') return true
if (props.page === 'expenses' && props.role === 'admin') return true
return false
})

const showMenuAdmin = computed(() => {
if (props.page === 'dashboard') return true
return false
})
</script>

<template>
<div class="top-menu">
<RouterLink
v-if="showPos"
to="/pos"
class="menu-btn menu-btn-green"
>
กลับหน้า POS
</RouterLink>

<RouterLink
v-if="showExpenses"
to="/expenses"
class="menu-btn menu-btn-green"
>
เพิ่มรายจ่าย
</RouterLink>

<RouterLink
v-if="showDashboard"
to="/admin/dashboard"
class="menu-btn menu-btn-green"
>
Dashboard
</RouterLink>

<RouterLink
v-if="showMenuAdmin"
to="/admin/menu"
class="menu-btn menu-btn-green"
>
จัดการเมนู
</RouterLink>

<button class="menu-btn menu-btn-logout" @click="logout" title="ออกจากระบบ">
<svg viewBox="0 0 24 24" aria-hidden="true">
<path d="M10 17l5-5-5-5M15 12H3" />
<path d="M21 3v18H9" />
</svg>
</button>
</div>
</template>
