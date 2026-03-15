<script setup>
import {
Chart as ChartJS,
Title,
Tooltip,
Legend,
LineElement,
PointElement,
CategoryScale,
LinearScale,
Filler,
} from 'chart.js'
import { Line } from 'vue-chartjs'
import { computed } from 'vue'

ChartJS.register(
Title,
Tooltip,
Legend,
LineElement,
PointElement,
CategoryScale,
LinearScale,
Filler
)

const props = defineProps({
labels: {
type: Array,
default: () => [],
},
values: {
type: Array,
default: () => [],
},
})

const pointColors = [
'#f2c94c', // จันทร์ เหลือง
'#ff6fae', // อังคาร ชมพู
'#6fcf97', // พุธ เขียว
'#f2994a', // พฤหัส ส้ม
'#56ccf2', // ศุกร์ ฟ้า
'#9b51e0', // เสาร์ ม่วง
'#eb5757', // อาทิตย์ แดง
]

const chartData = computed(() => ({
labels: props.labels,
datasets: [
{
label: 'ยอดขายรายวัน',
data: props.values,
tension: 0.45,
fill: true,
borderWidth: 4,
pointRadius: 6,
pointHoverRadius: 8,
pointBorderWidth: 3,
pointBackgroundColor: pointColors,
pointBorderColor: '#ffffff',
pointHoverBackgroundColor: pointColors,
pointHoverBorderColor: '#ffffff',
segment: {
borderColor: (ctx) => {
const i = ctx.p0DataIndex
return pointColors[i] || '#c94f7c'
},
},
backgroundColor: (context) => {
const chart = context.chart
const { ctx, chartArea } = chart
if (!chartArea) return 'rgba(255, 111, 174, 0.12)'

const gradient = ctx.createLinearGradient(0, chartArea.top, 0, chartArea.bottom)
gradient.addColorStop(0, 'rgba(255, 111, 174, 0.20)')
gradient.addColorStop(0.45, 'rgba(155, 81, 224, 0.14)')
gradient.addColorStop(1, 'rgba(86, 204, 242, 0.03)')
return gradient
},
},
],
}))

const chartOptions = computed(() => ({
responsive: true,
maintainAspectRatio: false,
interaction: {
mode: 'index',
intersect: false,
},
animation: {
duration: 1400,
easing: 'easeOutQuart',
},
plugins: {
legend: {
display: true,
labels: {
boxWidth: 12,
usePointStyle: true,
pointStyle: 'circle',
color: '#5c4b3f',
font: {
size: 12,
weight: '700',
},
},
},
title: {
display: false,
},
tooltip: {
backgroundColor: 'rgba(46, 34, 52, 0.94)',
padding: 12,
cornerRadius: 12,
displayColors: true,
callbacks: {
title(items) {
return items[0]?.label || ''
},
label(context) {
return `ยอดขาย ${Number(context.raw).toLocaleString()} บาท`
},
},
},
},
scales: {
y: {
beginAtZero: true,
ticks: {
color: '#7d6d66',
callback(value) {
return `${Number(value).toLocaleString()}`
},
font: {
size: 11,
weight: '600',
},
},
grid: {
color: 'rgba(170, 150, 160, 0.12)',
drawBorder: false,
},
border: {
display: false,
},
},
x: {
ticks: {
color: '#7d6d66',
font: {
size: 11,
weight: '700',
},
},
grid: {
display: false,
},
border: {
display: false,
},
},
},
}))
</script>

<template>
<div class="chart-wrap">
<Line :data="chartData" :options="chartOptions" />
</div>
</template>