<script setup>
import { onMounted, ref, computed, watch } from 'vue'
import { RouterLink, useRouter } from 'vue-router'
import { supabase } from '../lib/supabase'
import { getBusinessDate } from '../lib/businessDate'
import WeeklySalesChart from '../components/WeeklySalesChart.vue'

const router = useRouter()

const summary = ref({
income: 0,
expenses: 0,
bills: 0,
profit: 0,
})

const selectedDate = ref(getBusinessDate())
const bills = ref([])
const selectedBill = ref(null)
const selectedBillItems = ref([])
const expenseList = ref([])
const loading = ref(false)

const weeklyChartLabels = ref([])
const weeklyChartValues = ref([])

const currentPage = ref(1)
const perPage = 5

const totalPages = computed(() => Math.ceil(bills.value.length / perPage))

const paginatedBills = computed(() => {
const start = (currentPage.value - 1) * perPage
const end = start + perPage
return bills.value.slice(start, end)
})

function formatThaiDate(dateString) {
if (!dateString) return '-'

const [year, month, day] = dateString.split('-').map(Number)
const date = new Date(year, month - 1, day)

const weekday = date.toLocaleDateString('th-TH', { weekday: 'long' })
const dayNum = date.getDate()
const monthName = date.toLocaleDateString('th-TH', { month: 'long' })
const yearBE = date.getFullYear() + 543

return `${weekday} ${dayNum} ${monthName} ${yearBE}`
}

function getStartOfWeek(dateString) {
const date = new Date(dateString)
const day = date.getDay()
const diff = day === 0 ? -6 : 1 - day
date.setDate(date.getDate() + diff)
date.setHours(0, 0, 0, 0)
return date
}

function formatDateKey(date) {
const year = date.getFullYear()
const month = String(date.getMonth() + 1).padStart(2, '0')
const day = String(date.getDate()).padStart(2, '0')
return `${year}-${month}-${day}`
}

function formatThaiShort(date) {
return date.toLocaleDateString('th-TH', {
weekday: 'short',
day: 'numeric',
month: 'short',
})
}

async function fetchWeeklySalesChart() {
const start = getStartOfWeek(selectedDate.value)
const end = new Date(start)
end.setDate(start.getDate() + 6)

const startKey = formatDateKey(start)
const endKey = formatDateKey(end)

const { data, error } = await supabase
.from('sales')
.select('business_date,total,status')
.gte('business_date', startKey)
.lte('business_date', endKey)
.eq('status', 'completed')

if (error) {
console.error(JSON.stringify(error, null, 2))
weeklyChartLabels.value = []
weeklyChartValues.value = []
return
}

const dayMap = {}

for (let i = 0; i < 7; i++) {
const d = new Date(start)
d.setDate(start.getDate() + i)
dayMap[formatDateKey(d)] = 0
}

;(data || []).forEach((item) => {
const key = item.business_date
dayMap[key] = (dayMap[key] || 0) + Number(item.total)
})

const labels = []
const values = []

for (let i = 0; i < 7; i++) {
const d = new Date(start)
d.setDate(start.getDate() + i)
const key = formatDateKey(d)
labels.push(formatThaiShort(d))
values.push(dayMap[key] || 0)
}

weeklyChartLabels.value = labels
weeklyChartValues.value = values
}

async function fetchDashboard() {
loading.value = true
currentPage.value = 1
selectedBill.value = null
selectedBillItems.value = []

const { data: allSalesData, error: allSalesError } = await supabase
.from('sales')
.select('*')
.eq('business_date', selectedDate.value)
.eq('status', 'completed')
.order('created_at', { ascending: false })

const { data: expensesData, error: expensesError } = await supabase
.from('expenses')
.select('*')
.eq('business_date', selectedDate.value)
.order('created_at', { ascending: false })

if (allSalesError) {
console.error(JSON.stringify(allSalesError, null, 2))
alert(allSalesError?.message || 'โหลดรายการบิลไม่สำเร็จ')
}

if (expensesError) {
console.error(JSON.stringify(expensesError, null, 2))
alert(expensesError?.message || 'โหลดข้อมูลรายจ่ายไม่สำเร็จ')
}

const income = (allSalesData || []).reduce((sum, item) => sum + Number(item.total), 0)
const expenseTotal = (expensesData || []).reduce((sum, item) => sum + Number(item.amount), 0)

summary.value = {
income,
expenses: expenseTotal,
bills: (allSalesData || []).length,
profit: income - expenseTotal,
}

bills.value = allSalesData || []
expenseList.value = expensesData || []

await fetchWeeklySalesChart()

loading.value = false
}

async function openBill(bill) {
selectedBill.value = bill

const { data, error } = await supabase
.from('sale_items')
.select('*')
.eq('sale_id', bill.id)

if (error) {
console.error(JSON.stringify(error, null, 2))
alert(error?.message || 'โหลดรายละเอียดบิลไม่สำเร็จ')
return
}

selectedBillItems.value = data || []
}

async function cancelBill(billId) {
const user = JSON.parse(localStorage.getItem('user') || 'null')
const ok = confirm('ต้องการยกเลิกบิลนี้หรือไม่')
if (!ok) return

const { error } = await supabase
.from('sales')
.update({
status: 'cancelled',
cancelled_by: user?.username || null,
cancelled_at: new Date().toISOString(),
})
.eq('id', billId)

if (error) {
console.error(JSON.stringify(error, null, 2))
alert(error?.message || 'ยกเลิกบิลไม่สำเร็จ')
return
}

alert('ยกเลิกบิลเรียบร้อย')
fetchDashboard()
}

function prevPage() {
if (currentPage.value > 1) currentPage.value -= 1
}

function nextPage() {
if (currentPage.value < totalPages.value) currentPage.value += 1
}

function goToPage(page) {
currentPage.value = page
}

function goToday() {
selectedDate.value = getBusinessDate()
}

function handleLogout() {
localStorage.removeItem('user')
router.push('/login')
}

watch(selectedDate, () => {
fetchDashboard()
})

onMounted(() => {
selectedDate.value = getBusinessDate()
fetchDashboard()
})
</script>

<template>
<div class="page-shell">
<header class="topbar">
<div class="brand-header">
<img src="/logo-baanwaja.jpeg" alt="บ้านวาจา" class="brand-header-logo" />
<div>
<h1 class="page-title">BANVAJA DASHBOARD</h1>
<p class="page-subtitle">ระบบหลังบ้านร้านอาหารบ้านวาจา</p>
</div>
</div>

<div class="topbar-actions">
<RouterLink to="/admin/menu" class="btn btn-secondary">จัดการเมนู</RouterLink>
<RouterLink to="/expenses" class="btn btn-secondary">เพิ่มรายจ่าย</RouterLink>
<button class="btn btn-secondary" @click="handleLogout">Log out</button>
</div>
</header>

<section class="card dashboard-chart-card">
<div class="card-head">
<div>
<h2>ยอดขายรายวัน/สัปดาห์</h2>
<p>แสดงยอดขายรายวันต่อสัปดาห์</p>
</div>
</div>

<WeeklySalesChart
:labels="weeklyChartLabels"
:values="weeklyChartValues"
/>
</section>

<div class="card dashboard-filter-card" style="margin-top: 20px;">
<div class="form-grid">
<div class="field">
<label>เลือกวันที่ของรอบบิล</label>
<input v-model="selectedDate" type="date" />
</div>
</div>

<div class="thai-date-display">
{{ formatThaiDate(selectedDate) }}
</div>

<div class="form-actions">
<button class="btn btn-primary" @click="fetchDashboard">รีเฟรชข้อมูล</button>
<button class="btn btn-secondary" @click="goToday">วันนี้</button>
</div>
</div>

<section class="stats-grid dashboard-stats">

<!-- รายรับ -->

<div class="stat-card stat-income">

<div class="stat-icon">
<svg viewBox="0 0 24 24">
<path d="M3 17l6-6 4 4 7-7"/>
</svg>
</div>

<span class="stat-label">รายรับของวัน</span>
<strong class="stat-value">{{ summary.income }}</strong>

</div>

<!-- รายจ่าย -->

<div class="stat-card stat-expense">

<div class="stat-icon">
<svg viewBox="0 0 24 24">
<path d="M3 7l6 6 4-4 7 7"/>
</svg>
</div>

<span class="stat-label">รายจ่ายของวัน</span>
<strong class="stat-value">{{ summary.expenses }}</strong>

</div>

<!-- กำไร -->

<div class="stat-card stat-profit">

<div class="stat-icon">
<svg viewBox="0 0 24 24">
<circle cx="12" cy="12" r="8"/>
</svg>
</div>

<span class="stat-label">กำไรของวัน</span>
<strong class="stat-value">{{ summary.profit }}</strong>

</div>

<!-- จำนวนบิล -->

<div class="stat-card stat-bills">

<div class="stat-icon">
<svg viewBox="0 0 24 24">
<rect x="4" y="5" width="16" height="14"/>
</svg>
</div>

<span class="stat-label">จำนวนบิล</span>
<strong class="stat-value">{{ summary.bills }}</strong>

</div>

</section>

<section class="admin-grid dashboard-grid" style="margin-top: 20px;">
<div class="card">
<div class="card-head">
<div>
<h2>บิลของวันนั้น</h2>
<p>{{ loading ? 'กำลังโหลด...' : 'แสดงหน้าละ 5 บิล' }}</p>
</div>
</div>

<div v-if="bills.length === 0" class="empty-box">
วันนั้นยังไม่มีบิล
</div>

<template v-else>
<div class="menu-admin-list">
<div v-for="bill in paginatedBills" :key="bill.id" class="menu-admin-item">
<div>
<div class="menu-admin-top">
<h3>บิล {{ bill.id.slice(0, 8) }}</h3>
</div>

<div class="menu-admin-meta">
<span>รวม {{ Number(bill.total) }} บาท</span>
<span>บ้านเลขที่: {{ bill.house_no || '-' }}</span>
<span>หมู่บ้าน: {{ bill.village || '-' }}</span>
<span>ซอย: {{ bill.soi || '-' }}</span>
</div>
</div>

<div class="menu-admin-actions">
<button class="btn btn-small btn-secondary" @click="openBill(bill)">ดูบิล</button>
<button class="btn btn-small btn-secondary" @click="router.push(`/bill/${bill.id}/edit`)">แก้ไขบิล</button>
<button class="btn btn-small btn-danger" @click="cancelBill(bill.id)">ยกเลิกบิล</button>
</div>
</div>
</div>

<div class="pagination" v-if="totalPages > 1">
<button class="btn btn-small btn-secondary" :disabled="currentPage === 1" @click="prevPage">
ก่อนหน้า
</button>

<button
v-for="page in totalPages"
:key="page"
class="btn btn-small"
:class="page === currentPage ? 'btn-primary' : 'btn-secondary'"
@click="goToPage(page)"
>
{{ page }}
</button>

<button class="btn btn-small btn-secondary" :disabled="currentPage === totalPages" @click="nextPage">
ถัดไป
</button>
</div>
</template>
</div>

<div class="card">
<div class="card-head">
<div>
<h2>รายละเอียดบิล</h2>
<p>เลือกบิลจากด้านซ้าย</p>
</div>
</div>

<div v-if="!selectedBill" class="empty-box">
ยังไม่ได้เลือกบิล
</div>

<template v-else>
<div class="bill-summary-box">
<strong>ยอดรวม:</strong> {{ Number(selectedBill.total) }} บาท<br />
<strong>บ้านเลขที่:</strong> {{ selectedBill.house_no || '-' }}<br />
<strong>หมู่บ้าน:</strong> {{ selectedBill.village || '-' }}<br />
<strong>ซอย:</strong> {{ selectedBill.soi || '-' }}
</div>

<div class="menu-admin-list">
<div v-for="item in selectedBillItems" :key="item.id" class="menu-admin-item">
<div>
<div class="menu-admin-top">
<h3>{{ item.item_name }}</h3>
</div>

<div class="menu-admin-meta">
<span>จำนวน {{ item.quantity }}</span>
<span>ราคา {{ Number(item.price) }}</span>
<span>รวม {{ Number(item.price) * item.quantity }}</span>
</div>
</div>
</div>
</div>
</template>
</div>
</section>

<section class="card dashboard-expense-card" style="margin-top: 20px;">
<div class="card-head">
<div>
<h2>รายจ่ายของวันนั้น</h2>
<p>รายการค่าใช้จ่ายที่ถูกบันทึกเข้ามาในระบบ</p>
</div>
</div>

<div v-if="expenseList.length === 0" class="empty-box">
วันนั้นยังไม่มีรายจ่าย
</div>

<div v-else class="menu-admin-list">
<div v-for="expense in expenseList" :key="expense.id" class="menu-admin-item">
<div>
<div class="menu-admin-top">
<h3>{{ expense.title || 'รายจ่าย' }}</h3>
</div>

<div class="menu-admin-meta">
<span>{{ Number(expense.amount) }} บาท</span>
<span>{{ expense.category || '-' }}</span>
<span>{{ expense.note || '-' }}</span>
<span>{{ expense.created_by || '-' }}</span>
</div>
</div>
</div>
</div>
</section>
</div>
</template>
