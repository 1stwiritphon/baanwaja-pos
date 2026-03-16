<script setup>
import { computed, onMounted, ref } from 'vue'
import { RouterLink, useRoute, useRouter } from 'vue-router'
import { supabase } from '../lib/supabase'
import { fetchCurrentMenus, fetchMenuOptions } from '../lib/menuDataService'
import MenuOptionModal from '../components/MenuOptionModal.vue'
import AppTopActions from '../components/AppTopActions.vue'

const route = useRoute()
const router = useRouter()
const user = JSON.parse(localStorage.getItem('user') || 'null')
const billId = route.params.id

const loading = ref(false)
const saving = ref(false)

const bill = ref(null)
const cart = ref([])

const menuList = ref([])
const proteins = ref([])
const noodles = ref([])
const extras = ref([])

const searchText = ref('')
const selectedCategory = ref('ทั้งหมด')

const selectedMenu = ref(null)
const optionModalOpen = ref(false)

const customItemForm = ref({
  name: '',
  price: '',
})

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
  filteredMenu.value.forEach((item) => {
    if (!grouped[item.category]) grouped[item.category] = []
    grouped[item.category].push(item)
  })
  return grouped
})

const totalItems = computed(() => cart.value.reduce((sum, item) => sum + item.qty, 0))
const totalPrice = computed(() => cart.value.reduce((sum, item) => sum + Number(item.price) * item.qty, 0))

async function loadMenuData() {
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
  }
}

async function fetchBill() {
  loading.value = true

  const { data: billData, error: billError } = await supabase
    .from('sales')
    .select('*')
    .eq('id', billId)
    .single()

  if (billError || !billData) {
    alert('โหลดบิลไม่สำเร็จ')
    loading.value = false
    return
  }

  if (billData.status === 'cancelled') {
    alert('บิลนี้ถูกยกเลิกแล้ว')
    router.back()
    return
  }

  bill.value = billData

  const { data: itemsData, error: itemsError } = await supabase
    .from('sale_items')
    .select('*')
    .eq('sale_id', billId)
    .order('created_at', { ascending: true })

  if (itemsError) {
    alert('โหลดรายการในบิลไม่สำเร็จ')
    loading.value = false
    return
  }

  cart.value = (itemsData || []).map((item) => ({
    id: item.id,
    menu_id: item.menu_id,
    name: item.item_name || item.name,
    price: Number(item.price),
    qty: item.quantity,
  }))

  loading.value = false
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
      id: `new-${Date.now()}-${Math.random()}`,
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

async function saveBillChanges() {
  if (!bill.value) return

  if (!cart.value.length) {
    alert('บิลต้องมีอย่างน้อย 1 รายการ')
    return
  }

  saving.value = true

  const { error: billError } = await supabase
    .from('sales')
    .update({
      total: totalPrice.value,
      village: bill.value.village || null,
      house_no: bill.value.house_no || null,
      soi: bill.value.soi || null,
    })
    .eq('id', billId)

  if (billError) {
    alert('อัปเดตบิลไม่สำเร็จ')
    saving.value = false
    return
  }

  const { error: deleteError } = await supabase
    .from('sale_items')
    .delete()
    .eq('sale_id', billId)

  if (deleteError) {
    alert('ลบรายการเดิมไม่สำเร็จ')
    saving.value = false
    return
  }

  const itemsPayload = cart.value.map((item) => ({
    sale_id: billId,
    menu_id: item.menu_id || null,
    item_name: item.name,
    quantity: item.qty,
    price: item.price,
  }))

  const { error: insertError } = await supabase
    .from('sale_items')
    .insert(itemsPayload)

  if (insertError) {
    alert('บันทึกรายการใหม่ไม่สำเร็จ')
    saving.value = false
    return
  }

  alert('แก้ไขบิลสำเร็จ')
  router.push(user?.role === 'admin' ? '/admin/dashboard' : '/pos')
}

function handleLogout() {
  localStorage.removeItem('user')
  router.push('/login')
}

onMounted(async () => {
  await Promise.all([loadMenuData(), fetchBill()])
})
</script>

<template>
  <div class="page-shell pos-background">
    <header class="topbar">
      <div class="brand-header">
        <img src="/logo-baanwaja.jpeg" alt="บ้านวาจา" class="brand-header-logo" />
        <div>
          <p class="eyebrow">BAAN WAJA</p>
          <h1 class="page-title">แก้ไขบิล</h1>
          <p class="page-subtitle">ใช้เมนูและตัวเลือกจากฐานข้อมูล</p>
        </div>
      </div>

      <AppTopActions
page="pos"
:role="user?.role || ''"
/>
    </header>

    <div v-if="loading" class="card">
      <div class="empty-box">กำลังโหลดข้อมูลบิล...</div>
    </div>

    <section v-else class="pos-grid">
      <div class="pos-left-column">
        <div class="card">
          <div class="card-head">
            <div>
              <h2>เพิ่มเมนูลงบิล</h2>
              <p>ดึงเมนูจากฐานข้อมูล</p>
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

          <div class="menu-scroll-area">
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
      </div>

      <div class="card sticky-card">
        <div class="card-head">
          <div>
            <h2>บิลที่กำลังแก้ไข</h2>
            <p>{{ totalItems }} รายการ</p>
          </div>
        </div>

        <div class="form-grid" style="margin-bottom:16px;" v-if="bill">
          <div class="field">
            <label>ชื่อหมู่บ้าน</label>
            <input v-model="bill.village" type="text" placeholder="ไม่กรอกก็ได้" />
          </div>
          <div class="field">
            <label>บ้านเลขที่</label>
            <input v-model="bill.house_no" type="text" placeholder="ไม่กรอกก็ได้" />
          </div>
          <div class="field">
            <label>ซอย</label>
            <input v-model="bill.soi" type="text" placeholder="ไม่กรอกก็ได้" />
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

          <button class="btn btn-primary full-width" @click="saveBillChanges" :disabled="saving">
            {{ saving ? 'กำลังบันทึก...' : 'บันทึกการแก้ไขบิล' }}
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