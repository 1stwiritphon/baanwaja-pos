<script setup>
import { computed, onMounted, ref } from 'vue'
import { RouterLink, useRouter } from 'vue-router'
import { supabase } from '../lib/supabase'
import { getBusinessDate } from '../lib/businessDate'
import CustomMenuModal from '../components/CustomMenuModal.vue'
import { customMenus, fixedMenuItems } from '../data/menuOptions'
import DrinkOptionModal from '../components/DrinkOptionModal.vue'
import { drinkItems } from '../data/menuOptions'

const router = useRouter()
const user = JSON.parse(localStorage.getItem('user') || 'null')

const selectedCategory = ref('ทั้งหมด')
const searchText = ref('')
const dbMenu = ref([])
const cart = ref([])
const loading = ref(false)
const saving = ref(false)

const selectedCustomMenu = ref(null)
const customModalOpen = ref(false)

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

const selectedDrink = ref(null)
const drinkModalOpen = ref(false)

const allMenuItems = computed(() => [
  ...customMenus.map((item) => ({ ...item, source: 'custom-config' })),
  ...fixedMenuItems.map((item) => ({ ...item, source: 'fixed-direct' })),
  ...drinkItems.map((item)=>({...item,source:'drink-option'})),
  ...dbMenu.value.map((item) => ({
    key: item.id,
    name: item.name,
    category: item.category,
    price: Number(item.price),
    source: 'db-direct',
    id: item.id,
  })),
])

const categories = computed(() => {
  const unique = [...new Set(allMenuItems.value.map((item) => item.category))]
  return ['ทั้งหมด', ...unique]
})

const filteredMenu = computed(() => {
  let items = allMenuItems.value

  if (selectedCategory.value !== 'ทั้งหมด') {
    items = items.filter((item) => item.category === selectedCategory.value)
  }

  if (searchText.value.trim()) {
    const keyword = searchText.value.trim().toLowerCase()
    items = items.filter((item) => item.name.toLowerCase().includes(keyword))
  }

  return items
})

const totalItems = computed(() =>
  cart.value.reduce((sum, item) => sum + item.qty, 0)
)

const totalPrice = computed(() =>
  cart.value.reduce((sum, item) => sum + Number(item.price) * item.qty, 0)
)

async function fetchMenu() {
  loading.value = true

  const { data, error } = await supabase
    .from('menu')
    .select('*')
    .eq('active', true)
    .in('category', ['เครื่องดื่ม', 'ขนม', 'ไอติม'])
    .order('category', { ascending: true })
    .order('name', { ascending: true })

  if (error) {
    console.error(JSON.stringify(error, null, 2))
    alert(error?.message || 'โหลดเมนูไม่สำเร็จ')
  } else {
    dbMenu.value = data || []
  }

  loading.value = false
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

  if (error) {
    console.error(JSON.stringify(error, null, 2))
  } else {
    latestSavedBills.value = data || []
  }

  loadingLatestBills.value = false
}

function openMenuItem(item){

if(item.source==='custom-config'){
selectedCustomMenu.value=item
customModalOpen.value=true
return
}

if(item.source==='drink-option'){
selectedDrink.value=item
drinkModalOpen.value=true
return
}

addDirectItem(item.name,Number(item.price))

}

function addConfiguredDrink(payload){

addDirectItem(payload.name,payload.price)
drinkModalOpen.value=false
selectedDrink.value=null

}

function addDirectItem(name, price, menuId = null) {
  const found = cart.value.find(
    (i) => i.name === name && i.price === Number(price) && i.menu_id === menuId
  )

  if (found) {
    found.qty += 1
  } else {
    cart.value.push({
      type: menuId ? 'db' : 'custom',
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
  customModalOpen.value = false
  selectedCustomMenu.value = null
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
    console.error(JSON.stringify(saleError, null, 2))
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
    console.error(JSON.stringify(itemsError, null, 2))
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
    console.error(JSON.stringify(error, null, 2))
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
  fetchMenu()
  fetchLatestBills()
})
</script>

<template>
  <div class="page-shell">
    <header class="topbar">
      <div class="brand-header">
        <img src="/logo-baanwaja.jpeg" alt="บ้านวาจา" class="brand-header-logo" />
        <div>
          <p class="eyebrow">BAAN WAJA</p>
          <h1 class="page-title">หน้าขายสินค้า</h1>
          <p class="page-subtitle">เลือกเมนู บันทึกบิล แก้ไขบิล และยกเลิกบิล</p>
        </div>
      </div>

      <div class="topbar-actions">
        <RouterLink to="/expenses" class="btn btn-secondary">เพิ่มรายจ่าย</RouterLink>
        <RouterLink v-if="user?.role === 'admin'" to="/admin/dashboard" class="btn btn-secondary">แดชบอร์ด</RouterLink>
        <button class="btn btn-secondary" @click="handleLogout">ออกจากระบบ</button>
      </div>
    </header>

    <section class="pos-grid">
      <div class="pos-left-column">
        <div class="card">
          <div class="card-head">
            <div>
              <h2>เมนูทั้งหมด</h2>
              <p>เมนูอาหารเลือกตัวเลือกได้ และเครื่องดื่ม/ขนมกดได้เลย</p>
            </div>
          </div>

          <div class="field" style="margin-bottom: 16px;">
            <label>ค้นหาเมนู</label>
            <input v-model="searchText" type="text" placeholder="พิมพ์ชื่อเมนู" />
          </div>

          <template v-if="!loading">
            <div class="chip-row">
              <button
                v-for="category in categories"
                :key="category"
                class="chip"
                :class="{ 'chip-active': selectedCategory === category }"
                @click="selectedCategory = category"
              >
                {{ category }}
              </button>
            </div>
          </template>

          <div v-if="loading" class="empty-box">กำลังโหลดเมนู...</div>

          <div v-else class="menu-scroll-area">
            <div v-if="filteredMenu.length === 0" class="empty-box">ไม่พบเมนู</div>

            <div v-else class="menu-grid">
              <button
                v-for="item in filteredMenu"
                :key="item.key"
                class="menu-card"
                @click="openMenuItem(item)"
              >
                <div class="pill">
                  {{
                    item.source === 'custom-config'
                      ? 'เลือกตัวเลือก'
                      : item.source === 'fixed-direct'
                      ? 'กดได้เลย'
                      : item.category
                  }}
                </div>
                <div class="menu-card-name">{{ item.name }}</div>
                <div class="menu-card-price">
                  {{
                    item.source === 'custom-config'
                      ? `เริ่ม ${item.basePrice} บาท`
                      : `${Number(item.price)} บาท`
                  }}
                </div>
              </button>
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

          <div v-else-if="latestSavedBills.length === 0" class="empty-box">
            วันนี้ยังไม่มีบิล
          </div>

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
                <button
                  class="btn btn-small btn-secondary"
                  @click="router.push(`/bill/${bill.id}/edit`)"
                >
                  แก้ไขบิล
                </button>

                <button
                  class="btn btn-small btn-danger"
                  @click="cancelBill(bill.id)"
                >
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

    <CustomMenuModal
      :open="customModalOpen"
      :menu="selectedCustomMenu"
      @close="customModalOpen = false"
      @add="addConfiguredMenu"
    />

    <DrinkOptionModal
:open="drinkModalOpen"
:drink="selectedDrink"
@close="drinkModalOpen=false"
@add="addConfiguredDrink"
/>
  </div>
</template>