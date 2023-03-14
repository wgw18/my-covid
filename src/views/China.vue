<template>
    <dv-loading class="loading" v-if="loadingFlag">Loading...</dv-loading>
    <div class="china" >
        <!-- <button @click="drawEveryProvince(allData.list[5].city)">btn</button> -->
        <div class="conLeft">
            <dv-border-box-1 class="flopWrapper" :color="['#5CA4C4', '#467DB1']" backgroundColor="white">
                <DigitalFlop class="digitalFlop" 
                :data="ecntain" title="累计确诊" 
                color="#FAE3DD" 
                :time="2">
                </DigitalFlop>
                <DigitalFlop class="digitalFlop" 
                :data="recure" title="累计治愈" 
                color="#C9EBE0" 
                :time="2">
                </DigitalFlop>
                <DigitalFlop class="digitalFlop" 
                :data="die" title="累计死亡" 
                color="#E4E6E9" 
                :time="2">
                </DigitalFlop>  
            </dv-border-box-1>
            
            <dv-border-box-6 class="mapWrapper" :color="['#5CA4C4', '#467DB1']" backgroundColor="white">
                <div class="map"></div>
            </dv-border-box-6>
            <div class="tips">双击具体省份查看详情</div>
        </div>
        <div class="formWrapper">
            <div class="addHistory formContainer1">
                <div class="addEveryday form1">
                </div>
            </div>   
            <div class="formContainer2">
                <div class="allCity form1">
                </div>
            </div>            
        </div>

    </div>
    
</template>

<script setup>
import DigitalFlop from '@/components/DigitalFlop.vue';
import * as echarts from 'echarts';
import "echarts/map/js/china.js";
import { useAllDataStore } from '../store/index'
import { storeToRefs } from 'pinia'
import { ref, computed, watch, onMounted,watchEffect } from 'vue';
import router from '../router/index'

const store = useAllDataStore()
const { allData } = storeToRefs(store)
const hashMap = ref(new Map())
let loadingFlag = ref(true),      //加载中flag
    ecntain = ref(0),
    recure = ref(0),
    die = ref(0)
onMounted(() => {
    draw()
    // console.log(allData);
})
watch(()=>allData.value.updated,()=>{
    console.log(allData.value.updated,allData.updated);
    draw()
})
function draw(){
    if(!allData.updated)return
    loadingFlag.value = false
    ecntain.value = allData.value.add_daily.addcon
    recure.value =  allData.value.add_daily.addcure
    die.value = allData.value.add_daily.adddeath    
    dispose('.addEveryday')
    dispose('.allCity')
    dispose('.map')
    drawAddEveryday()
    drawEveryProvince(allData.value.list)
    // drawEveryProvince(allData.value.list[3].city)
    drawChinaMap(allData.value.list)
}
function dispose(selector){
    document.querySelector(selector).removeAttribute('_echarts_instance_')
}
function drawAddEveryday(){
    let len = 350
    const addEveryday = echarts.init(document.querySelector('.addEveryday'));
    let option = {
    title: {
        text: '每日新增'
    },
    tooltip: {
        trigger: 'axis'
    },
    legend: {
        data: ['新增确诊', '新增治愈', '新增死亡','新增境外输入', 'Direct', 'Search Engine']
    },
    grid: {
        left: '3%',
        right: '4%',
        bottom: '25%',
        containLabel: true
    },
    toolbox: {
        feature: {
        dataZoom: {
            yAxisIndex: 'none'
        },
        restore: {},
        saveAsImage: {}
        }
    },
    dataZoom: [
    // {
    //   type: 'inside',
    //   start: 0,
    //   end: 20
    // },
    {
      start: 0,
      end: 50
    }
  ],
    xAxis: {
        type: 'category',
        boundaryGap: false,
        // data: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
        data: allData.value.historylist.slice(0,len).map((val)=>{
            return val.date
        }).reverse()
    },
    yAxis: {
        type: 'value'
    },
    series: [
        {//新增确诊
            name: '新增确诊',
            type: 'line',
            smooth: true,
            stack: 'Total',
            data:allData.value.historylist.slice(0,len).map((val)=>{
                return val.cn_conadd
            }).reverse()
        },
        {//新增治愈
            name: '新增治愈',
            type: 'line',
            smooth: true,
            stack: 'Total',
            data:allData.value.historylist.slice(0,len).map((val,index)=>{
                let temp = val.cn_cureNum - allData.value.historylist[index+1].cn_cureNum
                return temp>0?temp:allData.value.historylist[index-1].cn_cureNum-val.cn_cureNum 
            }).reverse()
        },
        {//新增死亡
            name: '新增死亡',
            type: 'line',
            smooth: true,
            stack: 'Total',
            data:allData.value.historylist.slice(0,len).map((val,index)=>{
                let temp = val.cn_deathNum - allData.value.historylist[index+1].cn_deathNum
                return temp>0?temp:allData.value.historylist[index-1].cn_deathNum-val.cn_deathNum 
            }).reverse()
        },
        {//新增境外输入
            name: '新增境外输入',
            type: 'line',
            smooth: true,
            stack: 'Total',
            data:allData.value.historylist.slice(0,len).map((val)=>{
                return val.cn_addjwsrNum
            }).reverse()
        },
    ]
    };
    option && addEveryday.setOption(option);
}
function drawEveryProvince(arr){
    let flag = true
    if(!arr[0].econNum)flag = false
    // console.log(arr[0].econNum||arr[0].conNum,flag);
    // 按照确诊数排序
    arr.sort((a,b)=>{
        if(flag){
            return Number(a.econNum) - Number(b.econNum) 
        }
        return Number(a.conNum) - Number(b.conNum) 
    })
    // console.log(arr);
    const addEveryday = echarts.init(document.querySelector('.allCity'));
    const option = {
            title: {
                text: '各省(区、县)确诊'
            },
            tooltip: {
                trigger: 'axis',
                axisPointer: {
                // Use axis to trigger tooltip
                type: 'shadow' // 'shadow' as default; can also be 'line' or 'shadow'
                }
            },
            toolbox: {
                feature: {
                dataZoom: {
                    // yAxisIndex: 'none'
                },
                restore: {},
                saveAsImage: {}
                }
            },
            legend: {  },
            grid: {
                left: '3%',
                right: '4%',
                bottom: '3%',
                containLabel: true
            },
            xAxis: {
                type: 'value',
                // splitLine: {
                //     lineStyle: {
                //         color: "#1F2535",
                //     },
                // },
                // axisLabel: {
                //     fontSize: 10,
                // },
                // axisTick: {
                //     show: true,
                // },
                // minInterval: 1,
                // axisLine: {
                //     show: true,
                // },
            },
            yAxis: [{
                type: "category",
                // axisLabel: {
                //     interval: 0,
                //     textStyle: {
                //         align: "left",
                //     },
                //     // margin: 20, //刻度标签与轴线之间的距离。
                // },
                // axisLine: {
                //     lineStyle: {
                //         color: "rgb(58,88,120)",
                //     },
                // },
                // axisTick: {
                //     show: false,
                // },
                data: arr.map((val)=>{
                    return val.name
                })
            },
           ],
            series: [
                {
                    name: '治愈数',
                    type: 'bar',
                    stack: 'total',
                    label: {
                        show: false
                    },
                    emphasis: {
                        focus: 'series'
                    },
                    data: arr.map((val)=>{
                        return val.cureNum
                    })
                },
                {
                    name: '死亡数',
                    type: 'bar',
                    stack: 'total',
                    label: {
                        show: false
                    },
                    emphasis: {
                        focus: 'series'
                    },
                    data: arr.map((val)=>{
                        return val.deathNum
                    })
                },
                {
                    name: '确诊数',
                    type: 'bar',
                    stack: 'total',
                    label: {
                        show: false
                    },
                    emphasis: {
                        focus: 'series'
                    },
                    data: arr.map((val)=>{
                        if(flag)return val.econNum
                        return val.conNum
                    })
                },
            ],
            dataZoom: [
                {
                    type: "slider",
                    show: true,//隐藏或显示（true）组件
                    // backgroundColor: "rgb(19, 63, 100)", // 组件的背景颜色。
                    // fillerColor: "rgb(16, 171, 198)", // 选中范围的填充颜色。
                    // borderColor: "rgb(19, 63, 100)", // 边框颜色
                    showDetail: false, //是否显示detail，即拖拽时候显示详细数值信息
                    startValue: arr.length>10?arr.length-10:0,//Math.floor(arr.length / 2) , // 数据窗口范围的起始数值
                    endValue: arr.length, // 数据窗口范围的结束数值（一页显示多少条数据）
                    yAxisIndex: 0,//控制哪个轴，如果是 number 表示控制一个轴，如果是 Array 表示控制多个轴。此处控制第二根轴
                    filterMode: "empty",
                    width: 8, //滚动条高度
                    height: "80%", //滚动条显示位置
                    right: 3, // 距离右边
                    handleSize: 0,//控制手柄的尺寸
                    zoomLoxk: true, // 是否锁定选择区域（或叫做数据窗口）的大小
                    top: "middle",
                },
                {
                    //没有下面这块的话，只能拖动滚动条，鼠标滚轮在区域内不能控制外部滚动条
                    type: "inside",
                    yAxisIndex: 0,//控制哪个轴，如果是 number 表示控制一个轴，如果是 Array 表示控制多个轴。此处控制第二根轴
                    zoomOnMouseWheel: false, //滚轮是否触发缩放
                    moveOnMouseMove: true, //鼠标移动能否触发平移
                    moveOnMouseWheel: true,//鼠标滚轮能否触发平移
                },
            ],
        };

    addEveryday.setOption(option)
}
function drawChinaMap(arr){
    let mapChina = echarts.init(document.querySelector('.map'));
    let datalist = arr.map(val=>{
        hashMap.value.set(val.name,val.city)
        return {
            name:val.name,
            value:val.value,
            econNum:val.econNum,
            deathNum:val.deathNum,
            cureNum:val.cureNum,
            conadd:val.conadd,
            jwsrNum:val.jwsrNum
        }
    })
    datalist.push({
        name: "南海诸岛"
    })
    const option = {
    title: {
      text: '中国各省实时数据', // 主标题文本，支持使用 \n 换行
      //top: 20, // 定位 值: 'top', 'middle', 'bottom' 也可以是具体的值或者百分比
    //   left: 'center', // 值: 'left', 'center', 'right' 同上
        top:'50px',
        left:'center',
        textStyle: { // 文本样式
        fontSize: 28,
        fontWeight: 600,
        color: 'black'
      }
    },
    tooltip: {
        padding: 10,
        enterable: true,
        transitionDuration: 1,//动画时间
        backgroundColor: "rgb(0,0,0,.8)",
        borderRadius: 0,
        textStyle: {
            color: '#fff',
        },
        formatter: function (params) {
        let tipString = "";
        if (params.data.value) {
          tipString =
            "<div style='font-size:25px;font-weight:900;margin:10px 0px'>" + params.data.name + "</div>" +
            "<div style='color:#f00;font-weight:900;'>现存：" + params.data.econNum + "</div>" +
            "<div style='color:#888;font-weight:900;'>累计：" + params.data.value + "</div>" +
            "<div style='color:#888;font-weight:900;'>死亡：" + params.data.deathNum + "</div>" +
            "<div style='color:#888;font-weight:900;'>治愈：" + params.data.cureNum + "</div>" +
            "<div style='color:#888;font-weight:900;'>较昨日新增：" + params.data.conadd + "</div>" +
            "<div style='color:#888;font-weight:900;'>境外输入：" + params.data.jwsrNum + "</div>"
        }
        return tipString;
      }
    },
    visualMap: {
        min: 0,
        max: 10000,
        left: '5%',
        top: '58%',
        text: ['高','低'],//取值范围的文字
        textStyle: {
            color: 'black',
        },
        calculable: true,
        realtime: false, // 拖拽时，是否实时更新
        inRange: {
            color: ['#fff4e6', '#dd2002']//取值范围的颜色
        },
        show:true,//图注
        type:'piecewise'
    },
    geo: {
        map: 'china',
        roam: true,//开启缩放和平移
        scaleLimit: {
            min: 1.2,//缩放限制
            max: 2
        },
        // zoom:1.23,//视角缩放比例
        label: {
            normal: {
                show: true,
                fontSize:'10',//注意：地图省份名字字体如果过大会导致字体重叠
                color: 'rgba(0,0,0,0.7)'
            }
        },
        itemStyle: {
            normal:{
                borderColor: 'rgba(0, 0, 0, 0.2)'
            },
            emphasis:{
                areaColor: '#F3B329',//鼠标选择区域颜色
                shadowOffsetX: 0,
                shadowOffsetY: 0,
                shadowBlur: 20,
                borderWidth: 0,
                shadowColor: 'rgba(0, 0, 0, 0.5)'
            }
        }
    },
    series : [
        {
            name: '信息量',
            type: 'map',
            geoIndex: 0,
            data:datalist
        }
        
    ],
    
    }

    mapChina.setOption(option);
    mapChina.on('dblclick', function (params) {
        // console.log(params,hashMap.value.get(params.name))
        drawEveryProvince(hashMap.value.get(params.name))
    })
    
    mapChina.getZr().on('click', function(params) {
        // console.log(params.target);
        if(!params.target)drawEveryProvince(allData.value.list)            
    })

}
</script>
<style lang="less" scoped>
.loading{
    width: 100%;
    height: 100%;
    position: absolute;
  }
.china{
    width: 100%;
    height: 100%;
    // background-color: #515151;
    padding-top: 10%;
    padding-left: 2%;
    padding-right: 2%;
    display: flex;
    opacity: 1;
    .conLeft{
        width: 48%;
        height: 100%;
        position: relative;
        // display: flex;
        // flex-direction: column;
        // border: 1px solid black;
        .flopWrapper{
            width: 100%;
            height: 15%;
            // display: flex;
            // flex-direction: row;
            // position: absolute;
            // top: 0;
            // left: 0;
            .border-box-content{
                width: 100%;
                height: 100%;
                .digitalFlop{
                width: 20%;
                height: 80%;
                float: left;
                margin-left: 8%;
                margin-top: 2%;
                // border: 1px black solid;
                }   
            }
            

        }
        .tips{
            width: 30%;
            height: 10%;
            position: absolute;
            top:28%;
            left:35%;
            color: black;
            text-align: center;;
            line-height: 100%;
            color: rgb(94, 94, 95);
            // z-index: 106;
        }
        .mapWrapper{
            width: 95%;
            height: 63%;
            margin-top: 2%;
            padding-left: 2%;
            .map{
                width: 100%;
                height: 100%;
            }            
        }


    }
    .formWrapper{
        width: 48%;
        height: 83%;
        // border: 1px solid yellow;
        .formContainer1{
            width: 100%;
            height: 35%;
            // border: 1px solid yellow;
            .formTitle1{
                width: 100%;
                height: 15%;
                font-size: 16px;
                text-align: center;
                line-height: 100%;
                border-bottom: 1px solid black;

            }
            .form1{
                width: 100%;
                height: 100%;
            }
        }
        .formContainer2{
            width: 100%;
            height: 75%;
            // height: 800px;
            margin-right: 5px;
            // overflow: scroll;
            // border: 1px solid yellow;
            .allCity{
                width: 100%;
                height: 90%;
            }
        }        
    }
 

    button{
        width: 100px;
        height: 100px;
        position: absolute;
        top: 100px;
    }
}
</style>