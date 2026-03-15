export function getBangkokNow() {
  return new Date(
    new Date().toLocaleString('en-US', { timeZone: 'Asia/Bangkok' })
  )
}

export function getBusinessDate() {
  const now = getBangkokNow()
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const day = String(now.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

export function isWithinBusinessHours() {
  const now = getBangkokNow()
  const minutes = now.getHours() * 60 + now.getMinutes()
  const open = 7 * 60
  const close = 22 * 60
  return minutes >= open && minutes <= close
}