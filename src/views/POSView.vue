<script setup>
import { computed, onMounted, ref } from 'vue'
import { RouterLink, useRouter } from 'vue-router'
import { supabase } from '../lib/supabase'
import { getBusinessDate } from '../lib/businessDate'
import { fetchCurrentMenus, fetchMenuOptions } from '../lib/menuDataService'
import MenuOptionModal from '../components/MenuOptionModal.vue'
import AppTopActions from '../components/AppTopActions.vue'

const router = useRouter()
const user = JSON.parse(localStorage.getItem('user') || 'null')

const menuList = ref([])
const proteins = ref([])
const noodles = ref([])
const extras = ref([])

const loading = ref(false)
const saving = ref(false)

const selectedCategory = ref('ทั้งหมด')
const searchText = ref('')

const selectedMenu = ref(null)
const optionModalOpen = ref(false)

const cart = ref([])

const billInfo = ref({
  village: '',
  house_no: '',
  soi: '',
})

const customItemForm = ref({
  name: '',
  price: '',
})

const latestSavedBills = ref([])
const loadingLatestBills = ref(false)

const categories = computed(() => {
  const unique = [...new Set(menuList.value.map((item) => item.category))]
  return ['ทั้งหมด', ...unique]
})

const filteredMenu = computed(() => {
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

const menuByCategory = computed(() => {

const grouped = {}

menuList.value.forEach(menu => {

if (!grouped[menu.category]) {
grouped[menu.category] = []
}

grouped[menu.category].push(menu)

})

const order = [
'ราดข้าว',
'กับข้าว',
'ยำ',
'ของทานเล่น',
'เครื่องดื่ม',
'ของหวาน'
]

const sorted = {}

order.forEach(cat => {
if (grouped[cat]) {
sorted[cat] = grouped[cat]
}
})

Object.keys(grouped).forEach(cat => {
if (!sorted[cat]) {
sorted[cat] = grouped[cat]
}
})

return sorted

})


const totalItems = computed(() => cart.value.reduce((sum, item) => sum + item.qty, 0))
const totalPrice = computed(() => cart.value.reduce((sum, item) => sum + Number(item.price) * item.qty, 0))

async function loadMenuData() {
  loading.value = true
  try {
    const [menus, options] = await Promise.all([
      fetchCurrentMenus(true),
      fetchMenuOptions(),
    ])

    menuList.value = menus
    proteins.value = options.proteins
    noodles.value = options.noodles
    extras.value = options.extras
  } catch (error) {
    console.error(error)
    alert('โหลดเมนูไม่สำเร็จ')
  } finally {
    loading.value = false
  }
}

async function fetchLatestBills() {
  loadingLatestBills.value = true

  const { data, error } = await supabase
    .from('sales')
    .select('*')
    .eq('business_date', getBusinessDate())
    .eq('status', 'completed')
    .order('created_at', { ascending: false })
    .limit(10)

  if (!error) {
    latestSavedBills.value = data || []
  }

  loadingLatestBills.value = false
}

function openMenuItem(item) {
  if (item.source_type === 'configurable') {
    selectedMenu.value = item
    optionModalOpen.value = true
    return
  }

  addDirectItem(item.name, Number(item.price), item.id)
}

function addDirectItem(name, price, menuId = null) {
  const found = cart.value.find(
    (i) => i.name === name && Number(i.price) === Number(price) && i.menu_id === menuId
  )

  if (found) {
    found.qty += 1
  } else {
    cart.value.push({
      id: `item-${Date.now()}-${Math.random()}`,
      menu_id: menuId,
      name,
      price: Number(price),
      qty: 1,
    })
  }
}

function addConfiguredMenu(payload) {
  addDirectItem(payload.name, payload.price, null)
  optionModalOpen.value = false
  selectedMenu.value = null
}

function addCustomItem() {
  const name = customItemForm.value.name.trim()
  const price = Number(customItemForm.value.price)

  if (!name || !price || price <= 0) {
    alert('กรอกชื่อและราคาเมนูพิเศษให้ถูกต้อง')
    return
  }

  addDirectItem(name, price, null)
  customItemForm.value = { name: '', price: '' }
}

function increaseQty(id) {
  const item = cart.value.find((i) => i.id === id)
  if (item) item.qty += 1
}

function decreaseQty(id) {
  const item = cart.value.find((i) => i.id === id)
  if (!item) return
  if (item.qty > 1) item.qty -= 1
  else removeItem(id)
}

function removeItem(id) {
  cart.value = cart.value.filter((i) => i.id !== id)
}

async function saveSale() {
  if (!cart.value.length) {
    alert('กรุณาเลือกเมนูก่อน')
    return
  }

  saving.value = true

  const { data: saleData, error: saleError } = await supabase
    .from('sales')
    .insert({
      total: totalPrice.value,
      village: billInfo.value.village || null,
      house_no: billInfo.value.house_no || null,
      soi: billInfo.value.soi || null,
      business_date: getBusinessDate(),
      status: 'completed',
    })
    .select()
    .single()

  if (saleError) {
    alert(`บันทึกยอดขายไม่สำเร็จ: ${saleError.message}`)
    saving.value = false
    return
  }

  const itemsPayload = cart.value.map((item) => ({
    sale_id: saleData.id,
    menu_id: item.menu_id || null,
    item_name: item.name,
    quantity: item.qty,
    price: item.price,
  }))

  const { error: itemsError } = await supabase
    .from('sale_items')
    .insert(itemsPayload)

  if (itemsError) {
    alert(`บันทึกรายการสินค้าไม่สำเร็จ: ${itemsError.message}`)
    saving.value = false
    return
  }

  alert(`บันทึกบิลสำเร็จ รวม ${totalPrice.value} บาท`)
  cart.value = []
  billInfo.value = { village: '', house_no: '', soi: '' }
  saving.value = false
  fetchLatestBills()
}

async function cancelBill(billId) {
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
    alert('ยกเลิกบิลไม่สำเร็จ')
    return
  }

  alert('ยกเลิกบิลเรียบร้อย')
  fetchLatestBills()
}

function handleLogout() {
  localStorage.removeItem('user')
  router.push('/login')
}

onMounted(() => {
  loadMenuData()
  fetchLatestBills()
})
</script>

<template>
  <div class="page-shell pos-background">
    <header class="topbar">
      <div class="brand-header">
        <img src="/logo-baanwaja.jpeg" alt="บ้านวาจา" class="brand-header-logo" />
        <div>
          <p class="eyebrow">BAAN WAJA</p>
          <h1 class="page-title">หน้าขายสินค้า</h1>
          <p class="page-subtitle">ดึงเมนูทั้งหมดจากฐานข้อมูล</p>
        </div>
      </div>

      <AppTopActions
page="pos"
:role="user?.role || ''"
/>
    </header>

    <section class="pos-grid">
      <div class="pos-left-column">
        <div class="card">
          <div class="card-head">
            <div>
              <h2>เมนูทั้งหมด</h2>
              <p>เมนูและตัวเลือกมาจาก Supabase</p>
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

          <div v-else class="menu-scroll-area">
            <div v-if="filteredMenu.length === 0" class="empty-box">ไม่พบเมนู</div>

            <div v-else>
              <div v-for="(menus, category) in menuByCategory" :key="category" style="margin-bottom: 18px;">
                <div class="subsection-title">{{ category }}</div>

                <div class="menu-grid">
                  <button
                    v-for="item in menus"
                    :key="item.id"
                    class="menu-card"
                    @click="openMenuItem(item)"
                  >
                    <div class="pill">
                      {{ item.source_type === 'configurable' ? 'เลือกตัวเลือก' : 'กดได้เลย' }}
                    </div>
                    <div class="menu-card-name">{{ item.name }}</div>
                    <div class="menu-card-price">
                      {{ item.source_type === 'configurable' ? `เริ่ม ${Number(item.base_price)} บาท` : `${Number(item.price)} บาท` }}
                    </div>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="card" style="padding: 18px;">
          <div class="card-head" style="margin-bottom: 12px;">
            <div>
              <h2 style="font-size:20px;">เพิ่มเมนูพิเศษ</h2>
              <p>กรณีลูกค้าสั่งนอกเมนู</p>
            </div>
          </div>

          <div class="form-grid">
            <div class="field">
              <label>ชื่อเมนูพิเศษ</label>
              <input v-model="customItemForm.name" type="text" placeholder="ชื่อเมนู" />
            </div>
            <div class="field">
              <label>ราคา</label>
              <input v-model="customItemForm.price" type="number" placeholder="ราคา" />
            </div>
          </div>

          <div class="form-actions">
            <button class="btn btn-primary" @click="addCustomItem">เพิ่มเข้าบิล</button>
          </div>
        </div>

        <div class="card" style="padding: 18px;">
          <div class="card-head">
            <div>
              <h2 style="font-size:20px;">บิลล่าสุดของวันนี้</h2>
              <p>ใช้ดู แก้ไข หรือยกเลิกบิลได้</p>
            </div>
          </div>

          <div v-if="loadingLatestBills" class="empty-box">กำลังโหลด...</div>
          <div v-else-if="latestSavedBills.length === 0" class="empty-box">วันนี้ยังไม่มีบิล</div>

          <div v-else class="menu-admin-list">
            <div v-for="bill in latestSavedBills" :key="bill.id" class="menu-admin-item">
              <div>
                <div class="menu-admin-top">
                  <h3>บิล {{ bill.id.slice(0, 8) }}</h3>
                  <span class="pill">บิลปกติ</span>
                </div>

                <div class="menu-admin-meta">
                  <span>รวม {{ Number(bill.total) }} บาท</span>
                  <span>บ้านเลขที่: {{ bill.house_no || '-' }}</span>
                  <span>หมู่บ้าน: {{ bill.village || '-' }}</span>
                </div>
              </div>

              <div class="menu-admin-actions">
                <button class="btn btn-small btn-secondary" @click="router.push(`/bill/${bill.id}/edit`)">
                  แก้ไขบิล
                </button>
                <button class="btn btn-small btn-danger" @click="cancelBill(bill.id)">
                  ยกเลิกบิล
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="card sticky-card">
        <div class="card-head">
          <div>
            <h2>บิลปัจจุบัน</h2>
            <p>{{ totalItems }} รายการ</p>
          </div>
        </div>

        <div class="form-grid" style="margin-bottom:16px;">
          <div class="field">
            <label>ชื่อหมู่บ้าน</label>
            <input v-model="billInfo.village" type="text" placeholder="ไม่กรอกก็ได้" />
          </div>
          <div class="field">
            <label>บ้านเลขที่</label>
            <input v-model="billInfo.house_no" type="text" placeholder="ไม่กรอกก็ได้" />
          </div>
          <div class="field">
            <label>ซอย</label>
            <input v-model="billInfo.soi" type="text" placeholder="ไม่กรอกก็ได้" />
          </div>
        </div>

        <div v-if="cart.length === 0" class="empty-box">ยังไม่มีสินค้าในบิล</div>

        <div v-else class="cart-list">
          <div v-for="item in cart" :key="item.id" class="cart-item">
            <div>
              <div class="cart-name">{{ item.name }}</div>
              <div class="cart-sub">{{ item.price }} บาท / ชิ้น</div>
            </div>

            <div class="qty-wrap">
              <button class="qty-btn" @click="decreaseQty(item.id)">−</button>
              <span class="qty-text">{{ item.qty }}</span>
              <button class="qty-btn" @click="increaseQty(item.id)">+</button>
            </div>

            <div class="cart-total">{{ item.price * item.qty }} บาท</div>
            <button class="text-danger" @click="removeItem(item.id)">ลบ</button>
          </div>
        </div>

        <div class="cart-footer">
          <div class="summary-line">
            <span>รวมทั้งหมด</span>
            <strong>{{ totalPrice }} บาท</strong>
          </div>

          <button class="btn btn-primary full-width" @click="saveSale" :disabled="saving">
            {{ saving ? 'กำลังบันทึก...' : 'บันทึกยอดขาย' }}
          </button>
        </div>
      </div>
    </section>

    <MenuOptionModal
      :open="optionModalOpen"
      :menu="selectedMenu"
      :proteins="proteins"
      :noodles="noodles"
      :extras="extras"
      @close="optionModalOpen = false"
      @add="addConfiguredMenu"
    />
  </div>
</template>