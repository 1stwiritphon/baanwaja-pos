export const proteins = [
  { key: 'หมู', label: 'หมู', priceAdd: 0 },
  { key: 'หมูสับ', label: 'หมูสับ', priceAdd: 0 },
  { key: 'ไก่', label: 'ไก่', priceAdd: 0 },
  { key: 'ไก่สับ', label: 'ไก่สับ', priceAdd: 0 },

  { key: 'เนื้อ', label: 'เนื้อ', priceAdd: 20 },
  { key: 'เนื้อสับ', label: 'เนื้อสับ', priceAdd: 20 },

  { key: 'หมูกรอบ', label: 'หมูกรอบ', priceAdd: 20 },
  { key: 'กุ้ง', label: 'กุ้ง', priceAdd: 20 },
  { key: 'หมึก', label: 'หมึก', priceAdd: 20 },
  { key: 'ปู', label: 'ปู', priceAdd: 20 },
  { key: 'ทะเล', label: 'ทะเล', priceAdd: 20 },
  { key: 'ปลากะพง', label: 'ปลากะพง', priceAdd: 20 },

  { key: 'ปลาสลิด', label: 'ปลาสลิด', priceAdd: 10 },
  { key: 'ปลาทู', label: 'ปลาทู', priceAdd: 10 },

  { key: 'หมูแดด', label: 'หมูแดด', priceAdd: 20 },
  { key: 'เนื้อแดด', label: 'เนื้อแดด', priceAdd: 30 },

  { key: 'ปลาเค็ม', label: 'ปลาเค็ม', priceAdd: 0 },
  { key: 'รวมมิตร', label: 'รวมมิตร', priceAdd: 20 },
]

export const noodles = [
  { key: 'วุ้นเส้น', label: 'วุ้นเส้น' },
  { key: 'เส้นใหญ่', label: 'เส้นใหญ่' },
  { key: 'เส้นเล็ก', label: 'เส้นเล็ก' },
  { key: 'เส้นหมี่', label: 'เส้นหมี่' },
  { key: 'หมี่กรอบ', label: 'หมี่กรอบ' },
  { key: 'มาม่า', label: 'มาม่า' },
]

export const eggs = [
  { key: 'ไข่ดาว', label: 'ไข่ดาว', priceAdd: 10 },
  { key: 'ไข่เจียว', label: 'ไข่เจียว', priceAdd: 10 },
  { key: 'ไข่ต้ม', label: 'ไข่ต้ม', priceAdd: 10 },
]

export const customMenus = [
  {
    key: 'ผัดไทย',
    name: 'ผัดไทย',
    category: 'อาหารจานเดียว',
    basePrice: 70,
    allowProtein: true,
    proteinMode: 'all',
    allowNoodle: false,
    allowEgg: true,
    customPriceRules: [{ protein: 'กุ้ง', price: 80 }],
  },
  {
    key: 'ข้าวต้ม',
    name: 'ข้าวต้ม',
    category: 'อาหารจานเดียว',
    basePrice: 60,
    allowProtein: false,
    allowNoodle: false,
    allowEgg: false,
  },
  {
    key: 'ผัดขึ้นช่ายปลากะพง',
    name: 'ผัดขึ้นช่ายปลากะพง',
    category: 'อาหารจานเดียว',
    basePrice: 80,
    allowProtein: false,
    allowNoodle: false,
    allowEgg: false,
  },
  {
    key: 'กะเพรา',
    name: 'กะเพรา',
    category: 'อาหารจานเดียว',
    basePrice: 60,
    allowProtein: true,
    proteinMode: 'all',
    allowNoodle: false,
    allowEgg: true,
  },
  {
    key: 'คั่วพริกเกลือ ราดข้าว',
    name: 'คั่วพริกเกลือ ราดข้าว',
    category: 'อาหารจานเดียว',
    basePrice: 80,
    allowProtein: true,
    proteinMode: 'custom',
    allowedProteins: ['หมูกรอบ', 'ปลากะพง', 'หมึก', 'กุ้ง'],
    allowNoodle: false,
    allowEgg: false,
  },
  {
    key: 'ข้าวผัดคะน้า',
    name: 'ข้าวผัดคะน้า',
    category: 'อาหารจานเดียว',
    basePrice: 60,
    allowProtein: true,
    proteinMode: 'all',
    allowNoodle: false,
    allowEgg: true,
  },
  {
    key: 'ข้าวผัด',
    name: 'ข้าวผัด',
    category: 'อาหารจานเดียว',
    basePrice: 60,
    allowProtein: true,
    proteinMode: 'all',
    allowNoodle: false,
    allowEgg: true,
  },
  {
    key: 'ข้าวผัดป่า',
    name: 'ข้าวผัดป่า',
    category: 'อาหารจานเดียว',
    basePrice: 60,
    allowProtein: true,
    proteinMode: 'all',
    allowNoodle: false,
    allowEgg: true,
  },
  {
    key: 'ผัดพริกหยวก',
    name: 'ผัดพริกหยวก',
    category: 'อาหารจานเดียว',
    basePrice: 60,
    allowProtein: true,
    proteinMode: 'all',
    allowNoodle: false,
    allowEgg: true,
  },
  {
    key: 'ข้าวผัดเขียวหวาน',
    name: 'ข้าวผัดเขียวหวาน',
    category: 'อาหารจานเดียว',
    basePrice: 70,
    allowProtein: true,
    proteinMode: 'all',
    allowNoodle: false,
    allowEgg: true,
  },
  {
    key: 'ข้าวผัดต้มยำ',
    name: 'ข้าวผัดต้มยำ',
    category: 'อาหารจานเดียว',
    basePrice: 60,
    allowProtein: true,
    proteinMode: 'all',
    allowNoodle: false,
    allowEgg: true,
  },
  {
    key: 'กระเทียม',
    name: 'กระเทียม',
    category: 'อาหารจานเดียว',
    basePrice: 60,
    allowProtein: true,
    proteinMode: 'all',
    allowNoodle: false,
    allowEgg: true,
  },
  {
    key: 'ผัดพริกแกง',
    name: 'ผัดพริกแกง',
    category: 'อาหารจานเดียว',
    basePrice: 60,
    allowProtein: true,
    proteinMode: 'all',
    allowNoodle: false,
    allowEgg: true,
  },
  {
    key: 'ผัดซีอิ๊ว',
    name: 'ผัดซีอิ๊ว',
    category: 'อาหารจานเดียว',
    basePrice: 60,
    allowProtein: true,
    proteinMode: 'all',
    allowNoodle: true,
    allowEgg: false,
  },
  {
    key: 'ราดหน้า',
    name: 'ราดหน้า',
    category: 'อาหารจานเดียว',
    basePrice: 60,
    allowProtein: true,
    proteinMode: 'all',
    allowNoodle: true,
    allowEgg: false,
  },
  {
    key: 'ผัดขี้เมา',
    name: 'ผัดขี้เมา',
    category: 'อาหารจานเดียว',
    basePrice: 70,
    allowProtein: true,
    proteinMode: 'all',
    allowNoodle: true,
    allowEgg: false,
  },
  {
    key: 'สุกี้แห้ง',
    name: 'สุกี้แห้ง',
    category: 'อาหารจานเดียว',
    basePrice: 60,
    allowProtein: true,
    proteinMode: 'all',
    allowNoodle: true,
    allowEgg: false,
  },
  {
    key: 'สุกี้น้ำ',
    name: 'สุกี้น้ำ',
    category: 'อาหารจานเดียว',
    basePrice: 60,
    allowProtein: true,
    proteinMode: 'all',
    allowNoodle: true,
    allowEgg: false,
  },
  {
    key: 'ก๋วยเตี๋ยวคั่ว',
    name: 'ก๋วยเตี๋ยวคั่ว',
    category: 'อาหารจานเดียว',
    basePrice: 60,
    allowProtein: true,
    proteinMode: 'all',
    allowNoodle: false,
    allowEgg: false,
  },
  {
    key: 'สปาเกตตี้ซอสมะเขือ',
    name: 'สปาเกตตี้ซอสมะเขือ',
    category: 'อาหารจานเดียว',
    basePrice: 70,
    allowProtein: true,
    proteinMode: 'custom',
    allowedProteins: ['หมู', 'หมูสับ', 'ไก่', 'ไก่สับ', 'เนื้อ', 'เนื้อสับ'],
    allowNoodle: false,
    allowEgg: false,
  },
  {
    key: 'สปาเกตตี้ขี้เมา',
    name: 'สปาเกตตี้ขี้เมา',
    category: 'อาหารจานเดียว',
    basePrice: 70,
    allowProtein: true,
    proteinMode: 'all',
    allowNoodle: false,
    allowEgg: false,
  },
  {
    key: 'มักกะโรนี',
    name: 'มักกะโรนี',
    category: 'อาหารจานเดียว',
    basePrice: 70,
    allowProtein: true,
    proteinMode: 'all',
    allowNoodle: false,
    allowEgg: false,
  },
  {
    key: 'ยำวุ้นเส้น',
    name: 'ยำวุ้นเส้น',
    category: 'ยำ',
    basePrice: 60,
    allowProtein: true,
    proteinMode: 'all',
    allowNoodle: false,
    allowEgg: false,
  },
  {
    key: 'ยำมาม่า',
    name: 'ยำมาม่า',
    category: 'ยำ',
    basePrice: 60,
    allowProtein: true,
    proteinMode: 'all',
    allowNoodle: false,
    allowEgg: false,
  },
]

export const fixedMenuItems = [
  { key: 'ข้าวผัดปลาหมึกไข่เค็ม', name: 'ข้าวผัดปลาหมึกไข่เค็ม', category: 'อาหารจานเดียว', price: 80 },
  { key: 'ข้าวผัดน้ำพริกลงเรือ', name: 'ข้าวผัดน้ำพริกลงเรือ', category: 'อาหารจานเดียว', price: 80 },
  { key: 'ข้าวผัดน้ำพริกกะปิปลาทู', name: 'ข้าวผัดน้ำพริกกะปิปลาทู', category: 'อาหารจานเดียว', price: 70 },
  { key: 'ข้าวคลุกกะปิ', name: 'ข้าวคลุกกะปิ', category: 'อาหารจานเดียว', price: 80 },
  { key: 'กุ้งทอดซอสมะขาม ราดข้าว', name: 'กุ้งทอดซอสมะขาม ราดข้าว', category: 'อาหารจานเดียว', price: 80 },

  { key: 'ยำปลาสลิด', name: 'ยำปลาสลิด', category: 'ยำ', price: 80 },
  { key: 'ยำหมูกรอบ', name: 'ยำหมูกรอบ', category: 'ยำ', price: 100 },
  { key: 'ยำถั่วพลูกุ้งสด', name: 'ยำถั่วพลูกุ้งสด', category: 'ยำ', price: 80 },
  { key: 'ยำมะเขือยาว', name: 'ยำมะเขือยาว', category: 'ยำ', price: 80 },
  { key: 'ยำเนื้อมะเขือเปราะ', name: 'ยำเนื้อมะเขือเปราะ', category: 'ยำ', price: 100 },
  { key: 'ยำหมูย่าง', name: 'ยำหมูย่าง', category: 'ยำ', price: 80 },
  { key: 'ยำเนื้อย่าง', name: 'ยำเนื้อย่าง', category: 'ยำ', price: 100 },
  { key: 'หมูมะนาว', name: 'หมูมะนาว', category: 'ยำ', price: 80 },
  { key: 'เนื้อมะนาว', name: 'เนื้อมะนาว', category: 'ยำ', price: 120 },
  { key: 'เมี่ยงสปริง', name: 'เมี่ยงสปริง', category: 'ยำ', price: 120 },

  { key: 'ข้าวเปล่า', name: 'ข้าวเปล่า', category: 'อาหารจานเดียว', price: 10 },

  { key: 'ผัดไทยกุ้งสด', name: 'ผัดไทยกุ้งสด', category: 'อาหารจานเดียว', price: 80 },
  { key: 'ผัดไทยโบราณ', name: 'ผัดไทยโบราณ', category: 'อาหารจานเดียว', price: 60 },
  { key: 'ผัดไทยห่อไข่', name: 'ผัดไทยห่อไข่', category: 'อาหารจานเดียว', price: 80 },
  { key: 'ข้าวผัดแฮม', name: 'ข้าวผัดแฮม', category: 'อาหารจานเดียว', price: 60 },
  { key: 'ข้าวผัดแหนม', name: 'ข้าวผัดแหนม', category: 'อาหารจานเดียว', price: 60 },
  { key: 'ข้าวผัดเบคอน', name: 'ข้าวผัดเบคอน', category: 'อาหารจานเดียว', price: 70 },

  { key: 'มะระตุ๋น', name: 'มะระตุ๋น', category: 'แกง/ต้ม', price: 60 },
  { key: 'ต้มผักกาดดอง', name: 'ต้มผักกาดดอง', category: 'แกง/ต้ม', price: 60 },
  { key: 'ไข่พะโล้', name: 'ไข่พะโล้', category: 'แกง/ต้ม', price: 80 },

  { key: 'แกงจืดเต้าหู้สาหร่ายหมูสับ', name: 'แกงจืดเต้าหู้สาหร่ายหมูสับ', category: 'แกง/ต้ม', price: 60 },
  { key: 'ต้มโคล้งปลาสลิด/ปลากรอบ', name: 'ต้มโคล้งปลาสลิด/ปลากรอบ', category: 'แกง/ต้ม', price: 80 },
  { key: 'ต้มข่าไก่', name: 'ต้มข่าไก่', category: 'แกง/ต้ม', price: 80 },
  { key: 'แกงเขียวหวานหมู/ไก่', name: 'แกงเขียวหวานหมู/ไก่', category: 'แกง/ต้ม', price: 80 },
  { key: 'ต้มยำทะเล', name: 'ต้มยำทะเล', category: 'แกง/ต้ม', price: 120 },
  { key: 'แกงส้มชะอมกุ้ง', name: 'แกงส้มชะอมกุ้ง', category: 'แกง/ต้ม', price: 80 },
  { key: 'แกงส้มผักรวมกุ้ง', name: 'แกงส้มผักรวมกุ้ง', category: 'แกง/ต้ม', price: 80 },
  { key: 'แกงเลียงกุ้งสด', name: 'แกงเลียงกุ้งสด', category: 'แกง/ต้ม', price: 80 },
  { key: 'แกงเผ็ดหมู/ไก่', name: 'แกงเผ็ดหมู/ไก่', category: 'แกง/ต้ม', price: 80 },
  { key: 'แกงป่าหมู/ไก่', name: 'แกงป่าหมู/ไก่', category: 'แกง/ต้ม', price: 80 },

  { key: 'กุ้งทอดซอสมะขาม', name: 'กุ้งทอดซอสมะขาม', category: 'อาหารจานเดียว', price: 150 },
  { key: 'หมูกรอบคั่วพริกเกลือ', name: 'หมูกรอบคั่วพริกเกลือ', category: 'อาหารจานเดียว', price: 100 },
  { key: 'ปลาหมึกผัดพริกเกลือ', name: 'ปลาหมึกผัดพริกเกลือ', category: 'อาหารจานเดียว', price: 150 },
  { key: 'ไก่ผัดเม็ดมะม่วง', name: 'ไก่ผัดเม็ดมะม่วง', category: 'ของทานเล่น', price: 100 },
  { key: 'ขออีกจาน', name: 'ขออีกจาน', category: 'ของทานเล่น', price: 100 },
  { key: 'ปีกไก่ทอดเกลือ', name: 'ปีกไก่ทอดเกลือ', category: 'ของทานเล่น', price: 70 },
  { key: 'หมูแดดเดียว', name: 'หมูแดดเดียว', category: 'ของทานเล่น', price: 80 },
  { key: 'เนื้อแดดเดียว', name: 'เนื้อแดดเดียว', category: 'ของทานเล่น', price: 100 },
  { key: 'กุ้งแช่น้ำปลา', name: 'กุ้งแช่น้ำปลา', category: 'ยำ', price: 120 },

  { key: 'เฟรนฟรายทอด', name: 'เฟรนฟรายทอด', category: 'ของทานเล่น', price: 60 },
  { key: 'ไส้กรอกทอดราดซอส', name: 'ไส้กรอกทอดราดซอส', category: 'ของทานเล่น', price: 60 },
  { key: 'นักเก็ตทอด', name: 'นักเก็ตทอด', category: 'ของทานเล่น', price: 60 },
  { key: 'ข้าวเกรียบทอด', name: 'ข้าวเกรียบทอด', category: 'ของทานเล่น', price: 60 },
  { key: 'ยำเม็ดมะม่วง', name: 'ยำเม็ดมะม่วง', category: 'ของทานเล่น', price: 70 },
  { key: 'ไก่ตีแปลง', name: 'ไก่ตีแปลง', category: 'ของทานเล่น', price: 80 },
  
]

export function getAllowedProteins(menu) {
  if (!menu?.allowProtein) return []
  if (menu.proteinMode === 'all') return proteins
  if (menu.proteinMode === 'custom') {
    return proteins.filter((p) => menu.allowedProteins?.includes(p.key))
  }
  return []
}

export const drinkItems = [
  { key:'น้ำเปล่า',name:'น้ำเปล่า',category:'เครื่องดื่ม',price:10,allowIce:true },
  { key:'น้ำด่าง',name:'น้ำด่าง',category:'เครื่องดื่ม',price:25,allowIce:true },
  { key:'น้ำมะพร้าว',name:'น้ำมะพร้าว',category:'เครื่องดื่ม',price:30,allowIce:true },
  { key:'โออิชิ',name:'โออิชิ',category:'เครื่องดื่ม',price:25,allowIce:true },
  { key:'คาพิสแลคโตะ',name:'คาพิสแลคโตะ',category:'เครื่องดื่ม',price:20,allowIce:true },
  { key:'โค้ก ซีโร่',name:'โค้ก ซีโร่',category:'เครื่องดื่ม',price:20,allowIce:true },
  { key:'โค้ก ฝาแดง',name:'โค้ก ฝาแดง',category:'เครื่องดื่ม',price:20,allowIce:true },
  { key:'โค้ก ขวดแก้ว',name:'โค้ก ขวดแก้ว',category:'เครื่องดื่ม',price:20,allowIce:true },
  { key:'น้ำเขียว',name:'น้ำเขียว',category:'เครื่องดื่ม',price:20,allowIce:true },
  { key:'น้ำแดง',name:'น้ำแดง',category:'เครื่องดื่ม',price:20,allowIce:true },
  { key:'น้ำส้ม',name:'น้ำส้ม',category:'เครื่องดื่ม',price:20,allowIce:true },
  { key:'สไปร์ท',name:'สไปร์ท',category:'เครื่องดื่ม',price:20,allowIce:true },
  { key:'สแปรช',name:'สแปรช',category:'เครื่องดื่ม',price:15,allowIce:true },
  { key:'A&W',name:'A&W',category:'เครื่องดื่ม',price:20,allowIce:true },
  { key:'เกตเรต',name:'เกตเรต',category:'เครื่องดื่ม',price:30,allowIce:true },
  { key:'ชาเย็น',name:'ชาเย็น',category:'เครื่องดื่ม',price:25,allowIce:true },
  { key:'โอเลี้ยง',name:'โอเลี้ยง',category:'เครื่องดื่ม',price:25,allowIce:true },
  { key:'มะตูม',name:'มะตูม',category:'เครื่องดื่ม',price:15,allowIce:true },
  { key:'เก็กฮวย',name:'เก็กฮวย',category:'เครื่องดื่ม',price:15,allowIce:true },
  { key:'กระเจี๊ยบ',name:'กระเจี๊ยบ',category:'เครื่องดื่ม',price:15,allowIce:true },
  { key:'เบียร์ช้าง',name:'เบียร์ช้าง',category:'เครื่องดื่ม',price:60,allowIce:true },
  { key:'เบียร์สิงห์',name:'เบียร์สิงห์',category:'เครื่องดื่ม',price:70,allowIce:true },
]

export function buildDrinkName(drink, addIce) {
  return addIce ? `${drink.name} + น้ำแข็ง` : drink.name
}

export function calculateDrinkPrice(drink, addIce) {
  return Number(drink.price) + (addIce ? 5 : 0)
}

export function calculateCustomMenuPrice(menu, proteinKey, selectedEggKeys = []) {
  let price = menu.basePrice

  const rule = menu.customPriceRules?.find((r) => r.protein === proteinKey)
  if (rule) {
    price = rule.price
  } else if (proteinKey) {
    const protein = proteins.find((p) => p.key === proteinKey)
    if (protein) price += protein.priceAdd
  }

  selectedEggKeys.forEach((eggKey) => {
    const egg = eggs.find((e) => e.key === eggKey)
    if (egg) price += egg.priceAdd
  })

  return price
}

export function buildCustomMenuName(menu, proteinKey, noodleKey, selectedEggKeys = []) {
  const parts = []
  if (proteinKey) parts.push(proteinKey)
  if (noodleKey) parts.push(noodleKey)

  let name = menu.name
  if (parts.length) {
    name += ` (${parts.join(', ')})`
  }

  if (selectedEggKeys.length) {
    name += ` + ${selectedEggKeys.join(' + ')}`
  }

  return name
}