<script setup>
import {ref,computed,watch} from 'vue'
import {buildDrinkName,calculateDrinkPrice} from '../data/menuOptions'

const props=defineProps({
open:Boolean,
drink:Object
})

const emit=defineEmits(['close','add'])

const addIce=ref(false)

watch(()=>props.open,(v)=>{
if(v) addIce.value=false
})

const previewName=computed(()=>{
if(!props.drink) return ''
return buildDrinkName(props.drink,addIce.value)
})

const totalPrice=computed(()=>{
if(!props.drink) return 0
return calculateDrinkPrice(props.drink,addIce.value)
})

function addDrink(){
emit('add',{
name:previewName.value,
price:totalPrice.value
})
}
</script>

<template>

<div v-if="open && drink" class="modal-backdrop">

<div class="modal-card">

<h2>{{drink.name}}</h2>

<div class="option-grid">

<button
class="option-btn"
:class="{active:!addIce}"
@click="addIce=false"
>
ไม่ใส่น้ำแข็ง
</button>

<button
class="option-btn"
:class="{active:addIce}"
@click="addIce=true"
>
ใส่น้ำแข็ง +5
</button>

</div>

<div class="modal-summary">
{{previewName}} - {{totalPrice}} บาท
</div>

<div class="form-actions">

<button class="btn btn-secondary" @click="emit('close')">
ยกเลิก
</button>

<button class="btn btn-primary" @click="addDrink">
เพิ่มลงบิล
</button>

</div>

</div>

</div>

</template>