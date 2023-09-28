import { defineStore , createPinia} from 'pinia';
import { ref} from 'vue';

export const useUserStore = defineStore('userMsg', () => {
  const userMsg = ref({
    loginFlag:false

  })
  function loginCallback() {
    userMsg.value.loginFlag = true
  }

  return { userMsg, loginCallback }
})

export const useAllDataStore = defineStore('allData', () => {
  const allData = ref({
    updated : false
  })
  function updateData(obj) {
    allData.value = obj
    allData.updated = true
    allData.cityTableData = obj.list.map((val)=>{
      return {
        name:val.name,
        cureNum:Number(val.cureNum),
        deathNum:Number(val.deathNum),
        econNum:Number(val.econNum),   //现存确诊
        jwsrNum:Number(val.jwsrNum),
        conadd:val.conadd === '待公布'?0:Number(val.conadd),
        value:Number(val.value),      //累计确诊
      }
    })
    allData.countryTableData = obj.worldlist.map((val)=>{
      return {
        name:val.name,
        cureNum:Number(val.cureNum),
        deathNum:Number(val.deathNum),
        econNum:Number(val.econNum),   //现存确诊
        conadd:isNaN(Number(val.conadd))?0:Number(val.conadd),
        value:Number(val.value),      //累计确诊
      }
    })
    
  }

  return { allData, updateData }
})

export const useSetDataStore = defineStore('setData', () => {
  const setData = ref({
    rotationSpeed : 1,  
    autoRotate:true,
    isDrag:true,
    isZoom:true,
    isRippling:true,
    isBeam:true,
    earthType:'grain',   //night day grain

  })
  function updateSpeed(s) {
    setData.value.rotationSpeed = s
  }

  return { setData, updateSpeed }
})
