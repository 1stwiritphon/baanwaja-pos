export function buildReceipt(bill, items) {
  let text = ""

  text += "      บ้านวาจา (BANVAJA)\n"
  text += "--------------------------------\n"

  // ส่วนที่อยู่ (แสดงเฉพาะถ้ามีข้อมูล)
  if (bill.village || bill.house_no || bill.soi) {
    text += "ที่อยู่จัดส่ง:\n"
    if (bill.village)  text += `หมู่บ้าน: ${bill.village}\n`
    if (bill.house_no) text += `เลขที่: ${bill.house_no} `
    if (bill.soi)      text += `ซอย: ${bill.soi}`
    if (bill.house_no || bill.soi) text += "\n"
    text += "--------------------------------\n"
  }

  // รายการอาหาร
  text += "รายการอาหาร:\n"
  items.forEach(item => {
    text += `${item.item_name} x${item.quantity}\n`
    text += `                ${(item.price * item.quantity).toLocaleString()} บาท\n`
  })

  text += "--------------------------------\n"

  // ส่วนหมายเหตุ
  if (bill.note) {
    text += `*หมายเหตุ: ${bill.note}\n`
    text += "--------------------------------\n"
  }

  text += `รวมทั้งสิ้น:      ${bill.total.toLocaleString()} บาท\n`
  text += "--------------------------------\n"
  text += "        ขอบคุณที่ใช้บริการ\n"
  text += "\n\n"

  return text
}