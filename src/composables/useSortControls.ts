import { ref, watch } from 'vue'

export function useSortControls(onReset: () => void) {
    const started = ref(false)
    const paused = ref(false)
    const stepByStep = ref(false)
    const needReset = ref(false)
    const stepsCount = ref(0)

    async function sleep(ms: number) {
        return new Promise<void>((resolve) => {
            setTimeout(resolve, ms)
        })
    }

    async function waitUntil(condition: () => boolean) {
        return new Promise<void>((resolve) => {
            const stop = watch(condition, (val) => {
                if (val) {
                    stop()
                    resolve()
                }
            })
        })
    }

    function resetControls() {
        started.value = false
        paused.value = false
        stepByStep.value = false
        needReset.value = false
        stepsCount.value = 0
    }

    async function pauseOrResume() {
        if (paused.value) {
            stepByStep.value = false
        }

        paused.value = !paused.value
    }

    async function breakPoint() {
        if (paused.value) {
            await waitUntil(() => !paused.value)
        }
        if (stepByStep.value) {
            paused.value = true
        }
    }

    function onResetClicked() {
        if (started.value) {
            needReset.value = true
            paused.value = false
        } else {
            onReset()
        }
    }

    return {
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
    }
}
