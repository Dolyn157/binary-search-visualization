<script lang="ts" setup>
import {onMounted, ref, watch} from 'vue';

const current = ref(0);
const next = ref(0);
const round = ref(0);
const numbers = ref<{ num: number, order: number }[]>([])
const originalNumbers = ref<{ num: number, order: number }[]>([]);
const started = ref(false);
const paused = ref(false);
const stepByStep = ref(false);
const showSwapAnimation = ref(true);
const needReset = ref(false);
const stepsCount = ref(0);

function generateRandomNumbers() {
    numbers.value = [];
    for (let i = 0; i < 10; i++) {
        numbers.value.push({
            num: Math.floor(Math.random() * 100),
            order: i
        });
    }

    originalNumbers.value = numbers.value.map(n => ({ ...n }));
}

generateRandomNumbers()

onMounted(()=>{
  reset()
})


async function sleep(ms: number) {
    return new Promise<void>((resolve) => {
        setTimeout(resolve, ms);
    });
}

async function waitUntil(condition: () => boolean) {
    return new Promise<void>((resolve) => {
        const handle = watch([condition], (val) => {
            if (val) {
                handle.stop();
                resolve();
            }
        });
    });
}

function reset() {
    numbers.value = originalNumbers.value.map(n => ({ ...n }));
    current.value = 0;
    next.value = 0;
    round.value = 0;
    started.value = false;
    paused.value = false;
    stepByStep.value = false;
    showSwapAnimation.value = true;
    needReset.value = false;
    stepsCount.value = 0;
}

async function pauseOrResume() {
    if (paused.value) {
        stepByStep.value = false;
        console.log('resume');
    }

    paused.value = !paused.value;
}

async function breakPoint() {
    if (paused.value) {
        await waitUntil(() => !paused.value);
    }
    if (stepByStep.value) {
        paused.value = true;
    }
}

function onResetClicked() {
    if (started.value) {
        needReset.value = true;
        paused.value = false;
    } else {
        reset();
    }
}

function isCompare(n: number, current: number): boolean {
  if (n == current || n == current + 1) {
    return true;
  }
  return false;
}
async function bubbleSort(){

  // current = j; smallest = remain = i
  if (started.value) {
    return;
  }
  started.value = true;

  for (let i = 0; i < numbers.value.length - 1; i++) {
    round.value = i;
    for (let j = 0; j < numbers.value.length - 1 - i; j++) {
      current.value = numbers.value[j].order
      // array swap
      if (numbers.value[j].num > numbers.value[j + 1].num) {

        // swap order for animation
        [numbers.value[j].order, numbers.value[j + 1].order] = [numbers.value[j + 1].order, numbers.value[j].order];

        await sleep(125);
        // disable animation
        showSwapAnimation.value = false;

        [numbers.value[j], numbers.value[j + 1]] = [numbers.value[j + 1], numbers.value[j]];
        await sleep(875); // wait for vue to update
        // enable animation
        showSwapAnimation.value = true;

        await breakPoint();
        if (needReset.value) {
          reset()
          return;
        }
      }else{
        await sleep(1000)
        await breakPoint();
        if (needReset.value) {
          reset()
          return;
        }
      }
      current.value = numbers.value[j].order
      stepsCount.value++;
    }
    await sleep(1000);
  }
  started.value = false;
}

</script>

<template>
    <div style="text-align: initial;" class="flex gap-2">
        <div>
            <div :style="{ transform: `translateY(${round * 3}rem)` }"
                class="items w-25 transition-transform duration-250ms ease-out">
                Round: {{ round }}</div>
        </div>
        <div class="h-120">
            <div v-for="n in numbers" :style="{ width: `${n.num / 4}rem`, transform: `translateY(${n.order * 3}rem)` }"
                :class="{
                    'transition-transform duration-250ms ease-out': showSwapAnimation,
                    'isComparison': isCompare(n.order, current),
                }" class="absolute items" :id="String(n.order)">
                {{ n.num }}</div>
        </div>
    </div>
    <div class="h-1px bg-black mb-4 @dark:bg-white"></div>
    <div class="flex justify-center gap-4">
        <div class="items">Steps count: {{ stepsCount }}</div>
        <div @click="bubbleSort" class="items" v-if="!started">Start Sorting</div>
        <div @click="generateRandomNumbers();reset()" class="items" v-if="!started">Regenerate</div>
        <div @click="pauseOrResume" class="items" v-if="started">{{ paused ? 'Resume' : 'Pause' }}</div>
        <div @click="stepByStep = true; paused = false" class="items" v-if="paused">Next step</div>
        <div @click="onResetClicked" class="items" v-if="paused || !started">Reset</div>
    </div>
</template>

<style scoped>
.isComparison {
  border-width: 2px !important;
  border-color: #67c23a !important;
}

.items {
    --at-apply: h-8 bg-white flex items-center px-4 text-black b-1 b-solid b-black;
}

@media screen and (prefers-color-scheme: dark) {
    .items {
        --at-apply: bg-black text-white b-white;
    }
}
</style>
