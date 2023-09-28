import { createRouter, createWebHashHistory, RouteRecordRaw } from 'vue-router'
import pinia from '../store/store.js' 
import {  useUserStore  } from '../store/index'
import { storeToRefs } from 'pinia'

const store = useUserStore(pinia)
const { userMsg } = storeToRefs(store)

const Home = () => import(/* webpackChunkName: "home" */ "@/views/Home.vue"),
    World = () => import(/* webpackChunkName: "world" */ "@/views/World.vue"),
    China = () => import(/* webpackChunkName: "china" */ "@/views/China.vue"),
    Jwsr = () => import(/* webpackChunkName: "jwsr" */ "@/views/Jwsr.vue"),
    Login = ()=>import(/* webpackChunkName: "Login" */ "@/views/Login.vue")
// import Home from '../views/Home'
// import World from '../views/World.vue'
// import China from '../views/China.vue'
// import Jwsr from '../views/Jwsr'
const routes = [
    {
        path:'/',
        redirect: '/login'
    },
    {
        path:'/login',
        component:Login,
        name:'login',
        props:true
    },    
    {
        path:'/home',
        redirect: '/home/world',
        component:Home,
        children:[
            {
                path:'world',
                component:World,
                name:'world',
                props:true
            },
            {
                path:'china',
                component:China,
                name:'china',
                props:true
            },
            {
                path:'jwsr',
                component:Jwsr,
                name:'jwsr',
                props:true
            },
        ]
    },
]
const router = createRouter({
    history: createWebHashHistory(),
    routes
  })

// router.beforeEach((to, from, next) => {
//     if (to.name !== 'login' && !userMsg.value.loginFlag) next({ name: 'login' })
//     else next()
// })

router.beforeEach((to, from, next) => {
    if(sessionStorage.getItem('token') || to.name === 'login'){
        next()
    }else{
        next({ name: 'login' })
    }
})
export default router