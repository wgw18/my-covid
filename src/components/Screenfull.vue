<template>
  <div id="sctrrnFull" ref='shcontainer' @click="toggleFull()">
    <svg class="icon icon-quanping" aria-hidden="true" v-show="fullFlag">
        <use xlink:href="#icon-quanping"></use>
    </svg> 
    <svg class="icon icon-quxiaoquanping" aria-hidden="true" v-show="!fullFlag">
        <use xlink:href="#icon-quxiaoquanping"></use>
    </svg> 
  </div>
</template>

<script setup>
import {ref} from 'vue'
let fullFlag = ref('true')
function toggleFull(){
  if(fullFlag.value){
    if(document.documentElement.RequestFullScreen){
      document.documentElement.RequestFullScreen();
    }
    //兼容火狐
    console.log(document.documentElement.mozRequestFullScreen)
    if(document.documentElement.mozRequestFullScreen){
      document.documentElement.mozRequestFullScreen();
    }
    //兼容谷歌等可以webkitRequestFullScreen也可以webkitRequestFullscreen
    if(document.documentElement.webkitRequestFullScreen){
      document.documentElement.webkitRequestFullScreen();
    }
    //兼容IE,只能写msRequestFullscreen
    if(document.documentElement.msRequestFullscreen){
      document.documentElement.msRequestFullscreen();
    }
  }else{
    if(document.exitFullScreen){
      document.exitFullscreen()
    }
    //兼容火狐
    console.log(document.mozExitFullScreen)
    if(document.mozCancelFullScreen){
      document.mozCancelFullScreen()
    }
    //兼容谷歌等
    if(document.webkitExitFullscreen){
      document.webkitExitFullscreen()
    }
    //兼容IE
    if(document.msExitFullscreen){
      document.msExitFullscreen()
    }
  }
  fullFlag.value=!fullFlag.value  
}

</script>
<style lang="less" scoped>
.icon{
  width: 100%;
  height: 100%;
  color: #8DC8E8;
}
</style>