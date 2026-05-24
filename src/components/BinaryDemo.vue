<script setup lang="ts">
import {onBeforeUnmount, onMounted, ref, Ref} from 'vue'
import { sleep } from "./utils.ts";
import BinaryInstru from "./BinaryInstru.vue";

const array = ref<number[]>([1,3,10,12,35,41,50,54,59,66,88,92,108, 109])

const onResize = async () => {
  await handleResize()
}
const point1 = ref({x: 110, y: 110})
const point2 = ref({x: 0, y: 0})
const point3 = ref({x: 0, y: 0})
const isPlaying = ref(false)
const isPlayTexts = ref('请在下方文本框中输入要找的数字')

// Binary Search Variable
let leftIndex: number = 0
let rightIndex: number = array.value.length - 1
let mid: number = Math.floor((array.value.length - 1) / 2)
const goal = ref<number>(92)



onMounted( async() => {
  await handleResize()
  window.addEventListener('resize', onResize)
})

onBeforeUnmount(async() =>{
  window.removeEventListener('resize', onResize)
})

async function handleResize () {
  await setPosition(point1, leftIndex, true)
  await setPosition(point2, mid, true)
  await setPosition(point3, rightIndex, true)
}

async function play () {
  leftIndex = 0
  rightIndex = array.value.length - 1
  mid = Math.floor((array.value.length - 1) / 2)
  
  await handleResize()
  await sleep(50)
  await BinarySearch(array.value, goal.value)

}

async function BinarySearch (arr: Array<number>, target: number): Promise<boolean> {
  isPlaying.value = true
  isPlayTexts.value = "正在查找" + target
  leftIndex = 0
  rightIndex = arr.length - 1
  await setPosition(point1, leftIndex, false)
  await setPosition(point3, rightIndex, false)

  while (leftIndex <= rightIndex) {
    mid = Math.floor((leftIndex + rightIndex) /2)

    await setPosition(point2, mid, false)
    await sleep(2000)

    if (arr[mid] < target) {
      leftIndex = mid + 1; // 目标值在右侧
      await setPosition(point1, leftIndex, false)
      await sleep(2000)

    } else if (arr[mid] > target){
      rightIndex = mid - 1; // 目标值在左侧
      await setPosition(point3, rightIndex, false)
      await sleep(2000)

    } else if (arr[mid] === target) {
      alert("已找到目标")
      isPlaying.value = false
      isPlayTexts.value = "请在下方文本框中输入要找的数字"
      return true
    }
  }
  alert("找不到目标")
  isPlaying.value = false
  isPlayTexts.value = "请在下方文本框中输入要找的数字"
  return false
}


async function setPosition (point: Ref<{x:number, y:number}> ,id: number, immediate: boolean) {
  const label = document.getElementById(String(id))
  console.log(label + "标签ID")
  if (label == null) {
    return
  }
  let rect = label.getBoundingClientRect()
  const destX = rect.x + window.scrollX + 10
  const destY = rect.bottom + window.scrollY
  if (immediate) {
    point.value.x = destX
    point.value.y = destY
  }else {
    await moving(point, destX, destY)
  }
}

async function moving (point: Ref<{x:number, y:number}>, destX: number, destY: number) {

  let i:number
  const xMoveAmount = (destX - point.value.x) / 15
  const yMoveAmount = (destY - point.value.y) / 15
  for (i=0;i<15;i++){
    await sleep(50)
    point.value.x = point.value.x + xMoveAmount
    point.value.y = point.value.y + yMoveAmount
  }

}

</script>

<template>
  <binary-instru/>
<p>{{isPlayTexts}}</p>
<div class="demo">
  <div class="diving">
    <div v-for='(number, index) in array' :key="index" class="cards" :id='String(index)'>
        <p class="box">{{ number }}</p>
        <p  class="indexLabel">{{index}}</p>
    </div>
  </div>
  <div class="settings">
    <input id="input" v-model="goal" :disabled="isPlaying" type="number" min="1" max="100" step="0">
    <button id="start" :disabled="isPlaying" @click="play()">开始</button>
  </div>
</div>
  <div class="indexes">
    <img class="index" src="/vite.svg" alt="LEft" :style="{ left: point1.x + 'px', top: point1.y + 'px' }">
    <img class="index" src="../assets/vue.svg" alt="Mid" :style="{ left: point2.x + 'px', top: point2.y + 'px' }">
    <img class="Rindex" src="/vite.svg" alt="LEft"  :style="{ left: point3.x + 3 + 'px', top: point3.y + 'px' }" >
  </div>
</template>

<style scoped lang="sass">
.demo
  display: flex
  flex-direction: column
  justify-content: center
  
  .diving
    display: flex
    flex-direction: row
    flex-wrap: wrap
    justify-content: center
    .cards
      margin-bottom: 1.5em
      .box
        padding: 1.2rem
        outline: 1px solid black
      .indexLabel
        color: #535bf2
.settings
  margin-top: 2em
  display: flex
  flex-direction: column
  justify-content: center
#start
  align-self: center
  margin-top: 2em
  height: 2.5em
  width: 15%
#input
  width: 20%
  align-self: center
.indexes
  .index
    position: absolute
    rotate: 180deg
  .Rindex
    position: absolute
    filter: invert(1)
    transform: rotateY(180deg)
    rotate: 180deg

</style>