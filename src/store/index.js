import { defineStore } from 'pinia';
import { ref} from 'vue';
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
