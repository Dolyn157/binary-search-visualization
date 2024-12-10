<script setup lang="ts">
import { ref } from 'vue'
import { SortType} from "../main.ts";
import router from "../router/router.ts";

const activeIndex = ref('1')
const handleSelect = (key: string, keyPath: string[]) => {
  console.log(key, keyPath)
}

function jumpInto(uri: string, sortType?: string) {
  if(sortType){
    SortType.value = sortType as string
  }
  router.push(uri)
}
</script>

<template>
  <el-menu
      :default-active="activeIndex"
      class="el-menu-demo"
      mode="horizontal"
      :ellipsis="false"
      @select="handleSelect"
  >
    <el-menu-item index="0">
      <h3>朵琳的算法演示</h3>
    </el-menu-item>
    <el-menu-item index="1" @click="jumpInto('/home')">
      主页
    </el-menu-item>
    <el-sub-menu index="2">
      <template #title>算法演示</template>
      <el-menu-item index="2-1" @click="jumpInto('/demo')">
        二分查找
      </el-menu-item>
      <el-menu-item index="2-2" @click="jumpInto('/selection-sort', 'selection')">选择排序</el-menu-item>
      <el-menu-item index="2-3" @click="jumpInto('/bubble-sort', 'bubble')">冒泡排序</el-menu-item>
      <el-sub-menu index="2-4">
        <template #title>item four</template>
        <el-menu-item index="2-4-1">item one</el-menu-item>
        <el-menu-item index="2-4-2">item two</el-menu-item>
        <el-menu-item index="2-4-3">item three</el-menu-item>
      </el-sub-menu>
    </el-sub-menu>

  </el-menu>
</template>

<style scoped lang="sass">
.el-menu--horizontal > .el-menu-item:nth-child(1)
  margin-right: auto
</style>