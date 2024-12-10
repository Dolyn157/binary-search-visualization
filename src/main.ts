import {createApp, Ref, ref} from 'vue'
import './style.css'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import App from './App.vue'
import router from "./router/router.ts";
import 'virtual:uno.css'

export const SortType: Ref<string> = ref('')

const app = createApp(App)
app.use(ElementPlus)
app.use(router)
app.mount('#app')
