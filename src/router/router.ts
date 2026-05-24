import { createWebHashHistory, createRouter } from 'vue-router'

import Welcome from "../components/Welcome.vue";
import BinaryDemo from "../components/BinaryDemo.vue";
import SelectionSort from '../components/SelectionSort.vue';
import BubbleSort from "../components/BubbleSort.vue";
import BinaryTreeTraversal from "../components/BinaryTreeTraversal.vue";

const routes = [
    {path: '/', redirect: 'home'},
    {path: '/home', name:'Home',component: Welcome},
    {path: '/demo', name: 'Demo',component: BinaryDemo},
    {path: '/selection-sort', name: 'SelectionSort', component: SelectionSort},
    {path: '/bubble-sort', name: 'BubbleSort',component: BubbleSort},
    {path: '/binary-tree-traversal', name: 'BinaryTreeTraversal', component: BinaryTreeTraversal},
]

const router = createRouter({
    history: createWebHashHistory(),
    routes,
})

export default router
