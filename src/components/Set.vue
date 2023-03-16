<template>
    <dv-border-box-4 class="setWrapper" :color="['#5CA4C4', '#467DB1']">
        <h2>设置</h2>
    <el-form :model="form" 
        label-width="120px" 
        class="form-wrapper"
        size="500px"
        >
        <el-form-item label="自转速度：" class="form-item">
            <el-slider class="slider" v-model="setData.rotationSpeed" 
            :max="10" :min="0" 
            @change="changeSetData('rotationSpeed')"
            :step="0.1" style="--el-color-primary:#555555"/>
        </el-form-item>
        <el-form-item label="地球自转：" class="form-item">
            <el-switch v-model="setData.autoRotate" 
                style=" --el-switch-on-color: #555555" 
                @change="changeSetData('autoRotate')" >
            </el-switch>
        </el-form-item>
        <el-form-item label="地球拖拽：" class="form-item">
            <el-switch v-model="setData.isDrag" 
                style=" --el-switch-on-color: #555555"
                @change="changeSetData('isDrag')">
            </el-switch>
        </el-form-item>
        <el-form-item label="地球缩放：" class="form-item">
            <el-switch v-model="setData.isZoom" 
                style=" --el-switch-on-color: #555555"
                @change="changeSetData('isZoom')">
            </el-switch>
        </el-form-item>    
        <el-form-item label="涟漪效果：" class="form-item">
            <el-switch v-model="setData.isRippling" 
                style=" --el-switch-on-color: #555555"
                @change="changeSetData('isRippling')">
            </el-switch>
        </el-form-item>   
        <el-form-item label="光柱效果：" class="form-item">
            <el-switch v-model="setData.isBeam" 
                style=" --el-switch-on-color: #555555"
                @change="changeSetData('isBeam')">
            </el-switch>
        </el-form-item>   
    </el-form>

    </dv-border-box-4>
</template>

<script setup>
import { useSetDataStore } from '../store/index'
import { storeToRefs } from 'pinia'
const store = useSetDataStore()
const { setData } = storeToRefs(store)
// const { updateSpeed } = store

let emits = defineEmits(["changeSetData"])
function changeSetData(type) {
    emits("changeSetData", type)
}

</script>
<style lang="less" scoped>
h2{
    width: 100%;
    text-align: center;
    color: white;
    font-size: 32px;
    font-weight: 600;
    margin-top: 10%;
}
.form-wrapper{
    margin-top: 10%;
    .form-item{
        margin-top: 8%;
        
    }
}
</style>