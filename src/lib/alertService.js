import Swal from "sweetalert2"

const baseConfig = {
background: "#fffdf9",
color: "#4a4038",

confirmButtonColor: "#9d4750",
cancelButtonColor: "#b7afa5",

reverseButtons: true,
buttonsStyling: false,

customClass: {
popup: "bw-alert-popup",
title: "bw-alert-title",
htmlContainer: "bw-alert-text",
confirmButton: "bw-alert-confirm",
cancelButton: "bw-alert-cancel",
actions: "bw-alert-actions",
icon: "bw-alert-icon",
},

showClass: {
popup: "bw-swal-show",
backdrop: "bw-swal-backdrop-show",
icon: "bw-swal-icon-show",
},

hideClass: {
popup: "bw-swal-hide",
backdrop: "bw-swal-backdrop-hide",
icon: "bw-swal-icon-hide",
},
}

export function showSuccess(message) {
return Swal.fire({
...baseConfig,
icon: "success",
title: "สำเร็จ",
text: message,
confirmButtonText: "ตกลง",
timer: 1800,
timerProgressBar: true,
})
}

export function showError(message) {
return Swal.fire({
...baseConfig,
icon: "error",
title: "เกิดข้อผิดพลาด",
text: message,
confirmButtonText: "ตกลง",
})
}

export function showWarning(message) {
return Swal.fire({
...baseConfig,
icon: "warning",
title: "แจ้งเตือน",
text: message,
confirmButtonText: "ตกลง",
})
}

export async function showConfirm(message, title = "ยืนยันการทำรายการ") {
const result = await Swal.fire({
...baseConfig,
icon: "warning",
title,
text: message,
showCancelButton: true,
confirmButtonText: "ยืนยัน",
cancelButtonText: "ยกเลิก",
focusCancel: true,
})

return result.isConfirmed
}

export async function showDeleteConfirm(message) {
const result = await Swal.fire({
...baseConfig,
icon: "warning",
title: "ต้องการลบข้อมูล ?",
text: message,
showCancelButton: true,
confirmButtonText: "ลบ",
cancelButtonText: "ยกเลิก",
confirmButtonColor: "#c7484d",
focusCancel: true,
})

return result.isConfirmed
}