<script setup lang="ts">
import { computed, ref, watch } from 'vue'

type TraversalType = 'preorder' | 'inorder' | 'postorder'
type TreeMode = 'complete' | 'incomplete'

type TreeNode = {
    id: number
    value: number
    level: number
    slot: number
    x: number
    y: number
}

const levels = ref(4)
const treeMode = ref<TreeMode>('complete')
const traversalType = ref<TraversalType>('preorder')
const nodes = ref<TreeNode[]>([])
const visitedIds = ref<number[]>([])
const currentId = ref<number | null>(null)
const isPlaying = ref(false)
const playbackText = ref('请选择遍历方式后开始演示')

const viewBoxWidth = 1000
const levelGap = 88
const topPadding = 44
const nodeRadius = 20
const viewBoxHeight = computed(() => topPadding * 2 + (levels.value - 1) * levelGap)
const nodeMap = computed(() => new Map(nodes.value.map(node => [node.id, node])))
const traversalOrder = computed(() => getTraversalOrder(traversalType.value))
const traversalLabels = computed(() => traversalOrder.value.map(id => nodeMap.value.get(id)?.value ?? id))

const traversalNames: Record<TraversalType, string> = {
    preorder: '前序遍历',
    inorder: '中序遍历',
    postorder: '后序遍历',
}

const edges = computed(() => {
    return nodes.value.flatMap((node) => {
        const childIds = [node.id * 2, node.id * 2 + 1]
        return childIds
            .map(childId => nodeMap.value.get(childId))
            .filter((child): child is TreeNode => child !== undefined)
            .map(child => ({
                id: `${node.id}-${child.id}`,
                x1: node.x,
                y1: node.y + nodeRadius,
                x2: child.x,
                y2: child.y - nodeRadius,
            }))
    })
})

function generateTree() {
    const nextNodes: TreeNode[] = []
    let value = 1

    for (let level = 0; level < levels.value; level++) {
        const count = 2 ** level
        const maxSlots = 2 ** (levels.value - 1)
        const slotWidth = viewBoxWidth / maxSlots

        for (let slot = 0; slot < count; slot++) {
            const id = 2 ** level + slot
            const parentExists = level === 0 || nextNodes.some(node => node.id === Math.floor(id / 2))
            const shouldCreate = treeMode.value === 'complete' || level === 0 || (parentExists && Math.random() > 0.32)

            if (!parentExists || !shouldCreate) {
                continue
            }

            const visualSlot = slot * (maxSlots / count)
            nextNodes.push({
                id,
                value,
                level,
                slot,
                x: (visualSlot + 0.5 * (maxSlots / count)) * slotWidth,
                y: topPadding + level * levelGap,
            })
            value++
        }
    }

    nodes.value = nextNodes
    resetPlayback()
}

function resetPlayback() {
    visitedIds.value = []
    currentId.value = null
    isPlaying.value = false
    playbackText.value = '请选择遍历方式后开始演示'
}

function getTraversalOrder(type: TraversalType) {
    const order: number[] = []

    function walk(id: number) {
        if (!nodeMap.value.has(id)) {
            return
        }

        if (type === 'preorder') {
            order.push(id)
        }

        walk(id * 2)

        if (type === 'inorder') {
            order.push(id)
        }

        walk(id * 2 + 1)

        if (type === 'postorder') {
            order.push(id)
        }
    }

    walk(1)
    return order
}

async function sleep(ms: number) {
    return new Promise<void>((resolve) => {
        setTimeout(resolve, ms)
    })
}

async function playTraversal() {
    if (isPlaying.value) {
        return
    }

    resetPlayback()
    isPlaying.value = true
    playbackText.value = `正在演示${traversalNames[traversalType.value]}`

    for (const id of traversalOrder.value) {
        currentId.value = id
        await sleep(700)
        visitedIds.value = [...visitedIds.value, id]
    }

    currentId.value = null
    isPlaying.value = false
    playbackText.value = `${traversalNames[traversalType.value]}完成`
}

function getNodeClass(node: TreeNode) {
    return {
        'is-current': currentId.value === node.id,
        'is-visited': visitedIds.value.includes(node.id),
    }
}

function getTraversalRule(type: TraversalType) {
    if (type === 'preorder') {
        return '根节点 -> 左子树 -> 右子树'
    }
    if (type === 'inorder') {
        return '左子树 -> 根节点 -> 右子树'
    }
    return '左子树 -> 右子树 -> 根节点'
}

watch([levels, treeMode], generateTree)
watch(traversalType, resetPlayback)

generateTree()
</script>

<template>
    <section class="tree-page">
        <div class="toolbar">
            <div class="control-group">
                <span class="control-label">层数</span>
                <el-input-number v-model="levels" :min="1" :max="6" :disabled="isPlaying" />
            </div>

            <el-radio-group v-model="treeMode" :disabled="isPlaying">
                <el-radio-button label="complete">完全二叉树</el-radio-button>
                <el-radio-button label="incomplete">不完全二叉树</el-radio-button>
            </el-radio-group>

            <el-radio-group v-model="traversalType" :disabled="isPlaying">
                <el-radio-button label="preorder">前序</el-radio-button>
                <el-radio-button label="inorder">中序</el-radio-button>
                <el-radio-button label="postorder">后序</el-radio-button>
            </el-radio-group>

            <el-button type="primary" :disabled="isPlaying" @click="playTraversal">开始</el-button>
            <el-button :disabled="isPlaying" @click="generateTree">重新生成</el-button>
            <el-button :disabled="isPlaying" @click="resetPlayback">重置</el-button>
        </div>

        <div class="status-line">
            <span>{{ playbackText }}</span>
            <span>{{ traversalNames[traversalType] }}：{{ getTraversalRule(traversalType) }}</span>
        </div>

        <svg class="tree-stage" :viewBox="`0 0 ${viewBoxWidth} ${viewBoxHeight}`" role="img">
            <line
                v-for="edge in edges"
                :key="edge.id"
                class="edge"
                :x1="edge.x1"
                :y1="edge.y1"
                :x2="edge.x2"
                :y2="edge.y2"
            />

            <g
                v-for="node in nodes"
                :key="node.id"
                class="node"
                :class="getNodeClass(node)"
                :transform="`translate(${node.x}, ${node.y})`"
            >
                <circle :r="nodeRadius" />
                <text dominant-baseline="middle" text-anchor="middle">{{ node.value }}</text>
            </g>
        </svg>

        <div class="result-row">
            <span class="result-label">访问序列</span>
            <div class="sequence">
                <span
                    v-for="id in visitedIds"
                    :key="id"
                    class="sequence-item"
                >
                    {{ nodeMap.get(id)?.value }}
                </span>
                <span v-if="visitedIds.length === 0" class="empty-sequence">
                    {{ traversalLabels.join(' -> ') }}
                </span>
            </div>
        </div>
    </section>
</template>

<style scoped>
.tree-page {
    display: flex;
    flex-direction: column;
    gap: 18px;
    width: min(1100px, 100%);
    margin: 0 auto;
}

.toolbar {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    justify-content: center;
    gap: 12px;
}

.control-group {
    display: flex;
    align-items: center;
    gap: 8px;
}

.control-label,
.result-label {
    font-weight: 600;
    white-space: nowrap;
}

.status-line {
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    gap: 16px;
    color: #4b5563;
}

.tree-stage {
    width: 100%;
    min-height: 190px;
    border: 1px solid #d6dbe6;
    border-radius: 8px;
    background: #f8fafc;
}

.edge {
    stroke: #94a3b8;
    stroke-width: 3;
    stroke-linecap: round;
}

.node circle {
    fill: #ffffff;
    stroke: #1f2937;
    stroke-width: 3;
    transition: fill 180ms ease, stroke 180ms ease, transform 180ms ease;
}

.node text {
    fill: #111827;
    font-size: 18px;
    font-weight: 700;
    pointer-events: none;
}

.node.is-current circle {
    fill: #fde68a;
    stroke: #d97706;
}

.node.is-visited circle {
    fill: #bbf7d0;
    stroke: #16a34a;
}

.node.is-current text,
.node.is-visited text {
    fill: #111827;
}

.result-row {
    display: flex;
    align-items: flex-start;
    gap: 12px;
    text-align: left;
}

.sequence {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    min-height: 32px;
}

.sequence-item {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    min-width: 32px;
    height: 32px;
    padding: 0 10px;
    border: 1px solid #16a34a;
    border-radius: 6px;
    background: #dcfce7;
    color: #14532d;
    font-weight: 700;
}

.empty-sequence {
    color: #64748b;
    line-height: 32px;
}

@media screen and (prefers-color-scheme: dark) {
    .status-line {
        color: #cbd5e1;
    }

    .tree-stage {
        border-color: #475569;
        background: #111827;
    }

    .edge {
        stroke: #64748b;
    }

    .node circle {
        fill: #0f172a;
        stroke: #e5e7eb;
    }

    .node text {
        fill: #f8fafc;
    }

    .empty-sequence {
        color: #cbd5e1;
    }
}
</style>
