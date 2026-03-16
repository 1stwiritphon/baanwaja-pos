export function buildReceipt(bill, items) {

let text = ""

text += "BANVAJA\n"
text += "----------------------\n"

items.forEach(item => {
text += `${item.item_name} x${item.quantity}\n`
text += `${item.price * item.quantity} บาท\n`
})

text += "----------------------\n"
text += `รวม ${bill.total} บาท\n`
text += "\n\n"

return text
}