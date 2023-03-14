import { createApp } from 'vue'
import App from './App.vue'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import './assets/reset.css'
import  dataV  from "@jiaminghi/data-view";
import router from './router'
import { createPinia } from 'pinia'

const app = createApp(App)
app.use(dataV)
app.use(router)
app.use(createPinia())
app.use(ElementPlus)
app.mount('#app')
