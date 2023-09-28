import { createApp } from 'vue'
import App from './App.vue'
// import ElementPlus from 'element-plus'
// import 'element-plus/dist/index.css'
import './assets/reset.css'
import  dataV  from "@jiaminghi/data-view";
import router from './router'
import  pinia from "./store/store.js"
// import "./assets/font/iconfont.css"
import "./assets/font/iconfont"

const app = createApp(App)
app.use(dataV)
    .use(router)
    .use(pinia)
// app.use(ElementPlus)
app.mount('#app')
