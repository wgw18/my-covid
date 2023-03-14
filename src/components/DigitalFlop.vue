<template>
    <div class="digitalWrapper">
        <div class="digitalMsg" @click="toggle" :style="`color:${props.color}`">{{ props.title }}</div>
        <!-- <dv-digital-flop :config="config" class="digitalFlop"/>{{ props.data }} -->
        <div  class="digitalFlop" :style="`color:${props.color}`">{{ numString }}</div>
    </div>

</template>

<script setup>
import { ref,reactive, computed, watch, watchEffect,onMounted } from 'vue';
let numString = ref('0')
let props = defineProps({
    data:{
        // type:Number,
        default:0
    },
    title:{
        type:String,
        default:''
    },
    color:{
        type:String,
        default:'black'
    },
    time:{
        type:Number,
        default:1
    }
})
// const config = reactive({
//   number: [props.data],//props.data,
//   content: `{nt}`,
//   formatter,
//   style:{
//     fill: props.color
//   }
// })
watch(()=>props.data,(newVal, oldVal)=>{
    // console.log(newVal, oldVal);
    if(isNaN((Number(newVal)))){
        numString.value = '待公布'
        return
    }
    let step = Math.floor((newVal - oldVal)/(10*props.time))
    let start = oldVal
    let t = setInterval(() => {
        start += step;
        if (start > newVal) {
            clearInterval(t);
            start = newVal;
            t = null;
        }
        numString.value = formatter(start)
        // console.log(numString);
    }, 10)
})
function formatter (number) {
  const numbers = number.toString().split('').reverse()
  const segs = []
  while (numbers.length) segs.push(numbers.splice(0, 3).join(''))
  return segs.join(',').split('').reverse().join('')
}
// function numberJump(){
//     let 
// }
function toggle(){
    console.log(formatter(123122));
    // config.number = [17981279]
}
</script>
<style lang="less" scoped>
.digitalWrapper{
    transform: translateZ(0);   //GPU加速

    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;
    flex: auto;
    .digitalMsg{
        width: 100%;
        height: 50%;
        padding-top: 5%;
        text-align: center;
        line-height: 100%;
        font-size: 30px;
        font-weight: 600;
    }
    .digitalFlop{
        width: 100%;
        height: 50%;
        text-align: center;
        line-height: 100%;
        font-size: 30px;
        font-weight: 600;
    }

}

</style>