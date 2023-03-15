<template>
    <dv-border-box-4 class="setWrapper" :color="['#5CA4C4', '#467DB1']">
    <div class="slider-demo-block">
        <span class="demonstration">自转速度</span>
        <el-slider class="slider" v-model="setData.rotationSpeed" :max="0.0005" :min="0" :step="0.00001"/>
    </div>
    </dv-border-box-4>
</template>

<script setup>
import { useSetDataStore } from '../store/index'
import { storeToRefs } from 'pinia'
const store = useSetDataStore()
const { setData } = storeToRefs(store)
const { updateSpeed } = store
</script>
<style lang="less" scoped>
.setWrapper{
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    .slider-demo-block{
        width: 70%;
        line-height: 100%;
        margin: 0 auto;
        color: white;
        display: flex;
        text-align: center;
        border: 1px solid white;
        .slider{
            width: 60%;
            margin-left: 5%
        }
    }
}
</style>