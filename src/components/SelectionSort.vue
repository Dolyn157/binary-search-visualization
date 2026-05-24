<script lang="ts" setup>
import { ref } from 'vue';
import { useSortControls } from '../composables/useSortControls';

const smallest = ref(0);
const current = ref(0);
const numbers = ref<{ num: number, order: number }[]>([])
const originalNumbers = ref<{ num: number, order: number }[]>([]);
const showSwapAnimation = ref(true);
const {
    started,
    paused,
    stepByStep,
    needReset,
    stepsCount,
    sleep,
    resetControls,
    pauseOrResume,
    breakPoint,
    onResetClicked,
} = useSortControls(reset);

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

function reset() {
    numbers.value = originalNumbers.value.map(n => ({ ...n }));
    smallest.value = 0;
    current.value = 0;
    showSwapAnimation.value = true;
    resetControls();
}



async function selectionSort() {
    if (started.value) {
        return;
    }
    started.value = true;

    for (let i = 0; i < numbers.value.length; i++) {
        smallest.value = i;
        for (let j = i; j < numbers.value.length; j++) {
            if (j !== i) {
                await breakPoint();
                if (needReset.value) {
                    reset()
                    return;
                }
            }

            current.value = j;
            if (numbers.value[j].num < numbers.value[smallest.value].num) {
                await breakPoint();
                if (needReset.value) {
                    reset()
                    return;
                }

                if (!stepByStep.value) {
                    await sleep(500);
                }

                smallest.value = j;
            }

            stepsCount.value++;
            await sleep(500);
        }

        await breakPoint();
        if (needReset.value) {
            reset()
            return;
        }

        // swap order for animation
        [numbers.value[i].order, numbers.value[smallest.value].order] = [numbers.value[smallest.value].order, numbers.value[i].order];

        await sleep(500);

        // disable animation
        showSwapAnimation.value = false;

        // swap
        [numbers.value[i], numbers.value[smallest.value]] = [numbers.value[smallest.value], numbers.value[i]];
        await sleep(125); // wait for vue to update

        // enable animation
        showSwapAnimation.value = true;

        await breakPoint();
        if (needReset.value) {
            reset()
            return;
        }
    }

    started.value = false;
}

</script>

<template>
    <div style="text-align: initial;" class="flex gap-2">
        <div>
            <div :style="{ transform: `translateY(${current * 3}rem)` }"
                class="items w-25 transition-transform duration-250ms ease-out">
                Current: {{ numbers[current].num }}</div>
        </div>
        <div>
            <div :style="{ transform: `translateY(${smallest * 3}rem)` }"
                class="items w-30 transition-transform duration-250ms ease-out">
                Smallest: {{ numbers[smallest].num }}</div>
        </div>
        <div class="h-120">
            <div v-for="n in numbers" :style="{ width: `${n.num / 4}rem`, transform: `translateY(${n.order * 3}rem)` }"
                :class="{
                    'transition-transform duration-250ms ease-out': showSwapAnimation,
                }" class="absolute items">
                {{ n.num }}</div>
        </div>
    </div>
    <div class="h-1px bg-black mb-4 @dark:bg-white"></div>
    <div class="flex justify-center gap-4">
        <div class="items">Steps count: {{ stepsCount }}</div>
        <div @click="selectionSort" class="items" v-if="!started">Start Sorting</div>
        <div @click="generateRandomNumbers();reset()" class="items" v-if="!started">Regenerate</div>
        <div @click="pauseOrResume" class="items" v-if="started">{{ paused ? 'Resume' : 'Pause' }}</div>
        <div @click="stepByStep = true; paused = false" class="items" v-if="paused">Next step</div>
        <div @click="onResetClicked" class="items" v-if="paused || !started">Reset</div>
    </div>
</template>

<style scoped>
.items {
    --at-apply: h-8 bg-white flex items-center px-4 text-black b-1 b-solid b-black;
}

@media screen and (prefers-color-scheme: dark) {
    .items {
        --at-apply: bg-black text-white b-white;
    }
}
</style>
