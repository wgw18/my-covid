import { createRouter, createWebHashHistory, RouteRecordRaw } from 'vue-router'
import Home from '../views/Home'
import World from '../views/World.vue'
import China from '../views/China.vue'
import Jwsr from '../views/Jwsr'
const routes = [
    {
        path:'/',
        component:World,
        name:'world',
        props:true
    },
    {
        path:'/china',
        component:China,
        name:'china',
        props:true
    },
    {
        path:'/jwsr',
        component:Jwsr,
        name:'jwsr',
        props:true
    }
]
const router = createRouter({
    history: createWebHashHistory(),
    routes
  })
  
export default router