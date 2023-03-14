<template>
  <div class="banner">
    <dv-border-box-11 title="新冠疫情可视化" class="title" :color="['#5CA4C4', '#467DB1']" >
      <!-- titleWidth="1" -->
      <!-- <dv-decoration-8 style="width:300px;height:50px;" /> -->
      <div class="description">
        数据统计截至{{ time }}
      </div>
      <!-- <dv-decoration-8 :reverse="true" style="width:300px;height:50px;" /> -->
    </dv-border-box-11>
    
  </div>
</template>

<script setup>
let props = defineProps({
  time:{
    type:String,
    default:'截至2月26日21时01分'
  }
})
</script>
<style lang="less" scoped>
.banner{
  width: 86%;
  height: 12%;
  margin-left: 7%;
  .title{
    background-color: rgba(255, 255, 255, 0.1);
    position: relative;

    .description{
      width: 25%;
      height: 5%;
      color: rgb(224, 137, 23);
      line-height: 100%;
      position: absolute;
      bottom: 35%;
      left:50%;
      transform: translateX(-50%);
      text-align: center;
      
    }
  }
}
</style>