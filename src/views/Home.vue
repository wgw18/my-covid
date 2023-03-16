<template>
  <div class="home">
    <dv-border-box-9 class="mainBorder" :color="['#5CA4C4', '#467DB1']" backgroundColor="white">
      <Banner class="Banner" :time="time.toString()"></Banner>
      <router-view class="view"></router-view>
      <!-- <dv-border-box-8 class="footer"> -->
      <div class="header">
          <router-link :to="{name:'world'}" class="world subnav">
            <svg class="icon icon-header" aria-hidden="true" >
                <use xlink:href="#icon-icon-quanqiu"></use>
            </svg>
            <span>全球分析</span>
          </router-link>
          <router-link :to="{name:'china'}" class="China subnav">
            <svg class="icon icon-header" aria-hidden="true" >
                <use xlink:href="#icon-guoneiyou"></use>
            </svg>
            <span>国内分析</span>
          </router-link>
          <div class="subnav tableBtn" @click="clickDrawer()">
            <svg class="icon icon-header" aria-hidden="true" >
                <use xlink:href="#icon-biaoge"></use>
            </svg>
            <span>表格分析</span>
          </div>
          <router-link :to="{name:'jwsr'}" class="jwsr subnav">
            <svg class="icon icon-header" aria-hidden="true" >
                <use xlink:href="#icon-jingwairenyuan"></use>
            </svg>
            <span>境外输入</span>
          </router-link>
      </div>
    </dv-border-box-9>

    <!-- 表格抽屉 -->
    <el-drawer
    v-model="drawer"
    title="全国/全球疫情数据"
    direction="btt"
    size="90%"
    class="table"
    >
    <el-switch
        v-model="tableSwitch"
        size="large"
        active-text="全球数据"
        inactive-text="全国数据"
    />
    <el-input v-model="search" placeholder="回车搜索" clearable 
    @keyup.enter="enterSearch(search)"
    class="search"
    />
    <el-table :data="drawData"
      style="
      --el-table-bg-color:rgba(0,0,0,.8);
      --el-table-tr-bg-color:transparent;
      --el-table-header-bg-color:#333;
      --el-table-header-text-color:#fff;
      --el-table-text-color:#fff;
      --el-table-row-hover-bg-color:#333;
      --el-table-border-color:#333"
    >
      <el-table-column property="name" label="地区" width="150" />
      <el-table-column property="econNum" label="现存确诊"  sortable/>
      <el-table-column property="value" label="累计确诊"  sortable/>
      <el-table-column property="conadd" label="新增确诊"  sortable/>
      <el-table-column property="cureNum" label="累计治愈" sortable/>
      <el-table-column property="deathNum" label="累计死亡" sortable/>
      <el-table-column property="jwsrNum" label="境外输入" sortable v-if="!tableSwitch"/>
    </el-table>
  </el-drawer>

    </div>
</template>

<script setup>
import { ref, reactive,computed, watch, onMounted } from 'vue';
import { useRouter } from "vue-router"
import { useAllDataStore } from '../store/index'
import { storeToRefs } from 'pinia'
import router from '../router/index'
import {dataSource1} from '../api/request'
import Banner from '../components/Banner'

let sinaData = ref({}),            //疫情所有数据
    time = ref({}),
    history = ref([]),
    ip = ref({}),
    provincesData = ref([]),
    adddaily = ref([]),
    drawer = ref(false),
    drawData = ref([]),
    tableSwitch = ref(false),
    search = ref('')
const routerCur = useRouter()
onMounted(()=>{
  // router.push('/world')
  getMsg();
  console.log(allData.cityTableData);
})
watch(()=>tableSwitch.value,()=>{
  drawData.value = tableSwitch.value?allData.countryTableData:allData.cityTableData
})
const store = useAllDataStore()
const { allData } = storeToRefs(store)
const { updateData } = store


function decodingStr(str) {
  let repStr= str.replace(/\\/g, "%");//用%替换\
  let str1 = repStr.split("jsoncallback(")[1]
  let str2 = str1.split(");")[0]//截取出需要的字符串
  let unStr = unescape(str2);//解码出汉字(方法弃用)
  let jsonObj = JSON.parse(unStr);
  return jsonObj;
};
function getMsg(){
  dataSource1().then((res)=>{
    sinaData.value = decodingStr(res.data)
    let data = sinaData.value.data
    time.value = data.mtime
    updateData(data)
    // console.log(allData,'alldata');
 })

}
function clickDrawer(){
  drawer.value = true
  drawData.value = tableSwitch.value?allData.countryTableData:allData.cityTableData
}


function enterSearch(matchStr) {
    drawData.value = tableSwitch.value?allData.countryTableData:allData.cityTableData
    if (matchStr == "") {
        return
    }
    drawData.value  = drawData.value.filter(val=>{
      return val.name.search(matchStr) >= 0
    })
}


</script>
<style scoped lang="less">
.home{
    width: 100%;
    height: 100%;
    // background-color: rgb(226, 226, 248);
    position: relative;

    // .mainBorder{
    //   // position: absolute;
    // }
    .view{
      width: 100%;
      height: 100%;
      // z-index: 10;
    }
    .Banner{
      position: absolute;
      top: 1%;
      z-index: 20;
    }
    .btn{
      position: absolute;
      top:90%;
      left:20%;
      width: 100px;
      height: 50px;
    }
    .header{
      z-index: 30;
      width: 80%;
      height: 5%;
      // background-color: red;
      position: absolute;
      // top:80%;
      top:6%;
      left: 10%;
      // display: flex;
      .subnav{
        width: 10%;
        height: 100%;
        margin-left: 2.5%;
        margin-right:2.5%;
        border: 1px #798FD3 solid;
        background-color: #467DB1;
        border-radius: 4px;
        line-height: 280%;
        font-size: 100%;
        text-decoration: none;
        float: left;
        color: white;
        display: flex;
        .icon-header{
          width: 2vw;
          height: 100%;
          color: white;
          display: block;
          transform: translateX(30%);
        }
        span{
          transform: translateX(20%);
        }
      }
      .jwsr{
        float: right;
        // margin-right: 17.5%;
      }
      .tableBtn{
        float: right;
      }

    }
    /deep/.table{
      background-color: rgba(0,0,0,0.8);
    }
    /deep/.search{
      width: 20%;
    }
}

</style>