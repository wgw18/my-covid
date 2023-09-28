<template>
  <dv-loading class="loading" v-if="loadingFlag">Loading...</dv-loading>
  <div class="jwsrWrapper">
    <div class="jwsrLeft">
      <dv-border-box-1 class="jwsrNum" :color="['#5CA4C4', '#467DB1']" backgroundColor="white">
        <DigitalFlop class="digitalFlop" 
        :data="certain" title="现存确诊" 
        color="#FAE3DD" 
        :time="1"></DigitalFlop>
        <DigitalFlop class="digitalFlop" 
        :data="ecertain" 
        title="累计确诊" 
        color="#F7CBCA" 
        :time="1"></DigitalFlop>
        <DigitalFlop class="digitalFlop" 
        :data="die" 
        title="死亡" 
        color="#E4E6E9" 
        :time="1"></DigitalFlop>
        <DigitalFlop class="digitalFlop" 
        :data="recure" 
        title="治愈" 
        color="#C9EBE0" 
        :time="1"></DigitalFlop>
      </dv-border-box-1>        
      <dv-border-box-6 class="mapWrapper" :color="['#5CA4C4', '#467DB1']" backgroundColor="white">
        <div class="jwsr"></div>
      </dv-border-box-6>
    </div>
    <div class="jwsrRight">
      <dv-decoration-6 style="width:300px;height:70px;" />
      <!-- <dv-decoration-7 style="width:150px;height:30px;">境外输入TOP20</dv-decoration-7> -->
      <el-switch
        v-model="switchScroll"
        size="large"
        class="mb-2"
        active-text="国家TOP10"
        inactive-text="省份TOP10"
      />
      <dv-scroll-ranking-board :config="switchScroll?configC:configP" class="scrollTop"/>
      <!-- <dv-scroll-ranking-board :config="configP" class="scrollTop"/> -->
    </div>

    <!-- <button @click = 'fn()'>btn</button>     -->
  </div>
</template>

<script setup>
import DigitalFlop from '@/components/DigitalFlop.vue';
import { ref, computed, watch, watchEffect,onMounted } from 'vue';
import { useAllDataStore } from '../store/index'
import { storeToRefs } from 'pinia'
import router from '../router/index'
import { dataSource2 } from '../api/request'
import * as echarts from 'echarts';
import "echarts/map/js/world.js";
const switchScroll = ref(true)
let jwsrData = ref({}),         //所有数据
    placeOrigin = ref([]),      //飞线图起点
    destination = ref([]),      //飞线图起点
    lineData = ref([]),         //飞线
    dataMapC = ref(new Map()),   //输入国家的map
    dataMapP = ref(new Map()),   //输入省份的map
    datalist = ref([]),         //各国境外输入
    loadingFlag = ref(true),      //加载中flag
    jwsrTopP = ref({}),         //境外输入省份top
    certain = ref(0),
    ecertain = ref(0),
    die = ref(0),
    recure = ref(0)

    const configC = computed(()=>{
      // console.log(Array.from(dataMapC.value) ,Array.from(dataMapP.value));
      let jwsrTopC =  Array.from(dataMapC.value).sort((a,b)=>b[1]-a[1]).slice(0,20).map((val)=>{
        return {
          name:val[0],
          value:val[1]
        }
      })
      return {
        data:jwsrTopC,
        rowNum:10,
        unit: '',
        valueFormatter ({ value }) {
          console.warn(arguments)
          const reverseNumber = (value + '').split('').reverse()
          let valueStr = ''

          while (reverseNumber.length) {
            const seg = reverseNumber.splice(0, 3).join('')
            valueStr += seg
            if (seg.length === 3) valueStr += ','
          }

          return valueStr.split('').reverse().join('')
        }        
      }
    }),
    configP = computed(()=>{
      let jwsrTopP =  Array.from(dataMapP.value).sort((a,b)=>b[1]-a[1]).slice(0,20).map((val)=>{
        return {
          name:val[0],
          value:val[1]
        }
      })
      return {
        data:jwsrTopP,
        rowNum:10,
        unit: '',
        valueFormatter ({ value }) {
          console.warn(arguments)
          const reverseNumber = (value + '').split('').reverse()
          let valueStr = ''

          while (reverseNumber.length) {
            const seg = reverseNumber.splice(0, 3).join('')
            valueStr += seg
            if (seg.length === 3) valueStr += ','
          }

          return valueStr.split('').reverse().join('')
        }        
      }
    })
onMounted(() => {
  getMsg();
  //  drawWorld();
})
watchEffect(()=>{
  drawWorld();
  // console.log(jwsrData);
})
// watchEffect(()=>{
//   let jwsrTopC =  Array.from(dataMapC).sort((a,b)=>b[1]-a[1]).slice(0,20).map((val)=>{
//         return {
//           name:val[0],
//           value:val[1]
//         }
//       })
//   console.log(jwsrTopC,Array.from(dataMapC),dataMapC);
// })
import staticJwsrData from "@/assets/json/jwsr.json"
function getMsg() {
  dataSource2().then((res) => {
    // console.log('d2',res);
    // if(res.data.result.data.length === 0){
    //   jwsrData.value = staticJwsrData
    //   console.log("境外输入api停用，暂时使用离线数据");
    // }else{
    //   jwsrData.value = res.data.result
    // }
    jwsrData.value = res.data
    loadingFlag.value = false
  })

}
function drawWorld() {
  if ( !jwsrData.value.hasOwnProperty('status') || jwsrData.value.status.msg !== 'succ')return
  const worldChart = echarts.init(document.querySelector('.jwsr'))
  let maxNum = 0, 
      minNum = Infinity
  // console.log( jwsrData,jwsrData.value.data,jwsrData.value.hasOwnProperty('status'),jwsrData.value.status.msg !== 'succ');
  jwsrData.value.data.forEach((val) => {
    certain.value += Number(val.certain)
    ecertain.value += Number(val.ecertain)
    die.value += Number(val.die)
    recure.value += Number(val.recure)
    if(val.certain != '0'){
      //起点
      placeOrigin.value.push({
        name:val.from,
        value:[val.fromlong,val.fromlat],
        certain:val.certain
      })
      //终点
      destination.value.push({
        name:val.to,
        value:[val.tolong,val.tolat],
        certain:val.certain
      })        
      // 飞线
      lineData.value.push({
        fromName: val.from,
        toName: val.to,
        coords: [[val.fromlong,val.fromlat],[val.tolong,val.tolat]],
        value: val.certain                                             //累计境外输入
      })        
    }
    dataMapC.value.set(val.from,(dataMapC.value.get(val.from) || 0) + Number(val.certain))
    dataMapP.value.set(val.to,(dataMapP.value.get(val.to) || 0) + Number(val.certain))
  })
  dataMapC.value.forEach((val,key)=>{
    maxNum = Math.max(maxNum, val)
    minNum = Math.min(minNum,val)
    datalist.value.push({
      name:key,
      value:val
    })
  })
  lineData.value.sort((a,b)=>a.value-b.value)
  // console.log(datalist,maxNum,minNum,lineData.slice(-10));
  

  let nameMap = {
    Afghanistan: '阿富汗',
    Singapore: '新加坡',
    Angola: '安哥拉',
    Albania: '阿尔巴尼亚',
    'United Arab Emirates': '阿联酋',
    Argentina: '阿根廷',
    Armenia: '亚美尼亚',
    'French Southern and Antarctic Lands':
      '法属南半球和南极领地',
    Australia: '澳大利亚',
    Austria: '奥地利',
    Azerbaijan: '阿塞拜疆',
    Burundi: '布隆迪',
    Belgium: '比利时',
    Benin: '贝宁',
    'Burkina Faso': '布基纳法索',
    Bangladesh: '孟加拉国',
    Bulgaria: '保加利亚',
    'The Bahamas': '巴哈马',
    'Bosnia and Herzegovina': '波斯尼亚和黑塞哥维那',
    Belarus: '白俄罗斯',
    Belize: '伯利兹',
    Bermuda: '百慕大',
    Bolivia: '玻利维亚',
    Brazil: '巴西',
    Brunei: '文莱',
    Bhutan: '不丹',
    Botswana: '博茨瓦纳',
    'Central African Republic': '中非共和国',
    Canada: '加拿大',
    Switzerland: '瑞士',
    Chile: '智利',
    China: '中国',
    'Ivory Coast': '象牙海岸',
    Cameroon: '喀麦隆',
    'Democratic Republic of the Congo': '刚果民主共和国',
    'Republic of the Congo': '刚果共和国',
    Colombia: '哥伦比亚',
    'Costa Rica': '哥斯达黎加',
    Cuba: '古巴',
    'Northern Cyprus': '北塞浦路斯',
    Cyprus: '塞浦路斯',
    'Czech Republic': '捷克共和国',
    Germany: '德国',
    Djibouti: '吉布提',
    Denmark: '丹麦',
    'Dominican Republic': '多明尼加共和国',
    Algeria: '阿尔及利亚',
    Ecuador: '厄瓜多尔',
    Egypt: '埃及',
    Eritrea: '厄立特里亚',
    Spain: '西班牙',
    Estonia: '爱沙尼亚',
    Ethiopia: '埃塞俄比亚',
    Finland: '芬兰',
    Fiji: '斐',
    'Falkland Islands': '福克兰群岛',
    France: '法国',
    Gabon: '加蓬',
    'United Kingdom': '英国',
    Georgia: '格鲁吉亚',
    Ghana: '加纳',
    Guinea: '几内亚',
    Gambia: '冈比亚',
    'Guinea Bissau': '几内亚比绍',
    Greece: '希腊',
    Greenland: '格陵兰',
    Guatemala: '危地马拉',
    'French Guiana': '法属圭亚那',
    Guyana: '圭亚那',
    Honduras: '洪都拉斯',
    Croatia: '克罗地亚',
    Haiti: '海地',
    Hungary: '匈牙利',
    Indonesia: '印度尼西亚',
    India: '印度',
    Ireland: '爱尔兰',
    Iran: '伊朗',
    Iraq: '伊拉克',
    Iceland: '冰岛',
    Israel: '以色列',
    Italy: '意大利',
    Jamaica: '牙买加',
    Jordan: '约旦',
    Japan: '日本',
    Kazakhstan: '哈萨克斯坦',
    Kenya: '肯尼亚',
    Kyrgyzstan: '吉尔吉斯斯坦',
    Cambodia: '柬埔寨',
    Kosovo: '科索沃',
    Kuwait: '科威特',
    Laos: '老挝',
    Lebanon: '黎巴嫩',
    Liberia: '利比里亚',
    Libya: '利比亚',
    'Sri Lanka': '斯里兰卡',
    Lesotho: '莱索托',
    Lithuania: '立陶宛',
    Luxembourg: '卢森堡',
    Latvia: '拉脱维亚',
    Morocco: '摩洛哥',
    Moldova: '摩尔多瓦',
    Madagascar: '马达加斯加',
    Mexico: '墨西哥',
    Macedonia: '马其顿',
    Mali: '马里',
    Myanmar: '缅甸',
    Montenegro: '黑山',
    Mongolia: '蒙古',
    Mozambique: '莫桑比克',
    Mauritania: '毛里塔尼亚',
    Malawi: '马拉维',
    Malaysia: '马来西亚',
    Namibia: '纳米比亚',
    'New Caledonia': '新喀里多尼亚',
    Niger: '尼日尔',
    Nigeria: '尼日利亚',
    Nicaragua: '尼加拉瓜',
    Netherlands: '荷兰',
    Norway: '挪威',
    Nepal: '尼泊尔',
    'New Zealand': '新西兰',
    Oman: '阿曼',
    Pakistan: '巴基斯坦',
    Panama: '巴拿马',
    Peru: '秘鲁',
    Philippines: '菲律宾',
    'Papua New Guinea': '巴布亚新几内亚',
    Poland: '波兰',
    'Puerto Rico': '波多黎各',
    'North Korea': '北朝鲜',
    Portugal: '葡萄牙',
    Paraguay: '巴拉圭',
    Qatar: '卡塔尔',
    Romania: '罗马尼亚',
    Russia: '俄罗斯',
    Rwanda: '卢旺达',
    'Western Sahara': '西撒哈拉',
    'Saudi Arabia': '沙特阿拉伯',
    Sudan: '苏丹',
    'South Sudan': '南苏丹',
    Senegal: '塞内加尔',
    'Solomon Islands': '所罗门群岛',
    'Sierra Leone': '塞拉利昂',
    'El Salvador': '萨尔瓦多',
    Somaliland: '索马里兰',
    Somalia: '索马里',
    'Republic of Serbia': '塞尔维亚',
    Suriname: '苏里南',
    Slovakia: '斯洛伐克',
    Slovenia: '斯洛文尼亚',
    Sweden: '瑞典',
    Swaziland: '斯威士兰',
    Syria: '叙利亚',
    Chad: '乍得',
    Togo: '多哥',
    Thailand: '泰国',
    Tajikistan: '塔吉克斯坦',
    Turkmenistan: '土库曼斯坦',
    'East Timor': '东帝汶',
    'Trinidad and Tobago': '特里尼达和多巴哥',
    Tunisia: '突尼斯',
    Turkey: '土耳其',
    'United Republic of Tanzania': '坦桑尼亚',
    Uganda: '乌干达',
    Ukraine: '乌克兰',
    Uruguay: '乌拉圭',
    'United States': '美国',
    Uzbekistan: '乌兹别克斯坦',
    Venezuela: '委内瑞拉',
    Vietnam: '越南',
    Vanuatu: '瓦努阿图',
    'West Bank': '西岸',
    Yemen: '也门',
    'South Africa': '南非',
    Zambia: '赞比亚',
    Korea: '韩国',
    Tanzania: '坦桑尼亚',
    Zimbabwe: '津巴布韦',
    Congo: '刚果',
    'Central African Rep.': '中非',
    Serbia: '塞尔维亚',
    'Bosnia and Herz.': '波黑',
    'Czech Rep.': '捷克',
    'W. Sahara': '西撒哈拉',
    'Lao PDR': '老挝',
    'Dem.Rep.Korea': '朝鲜',
    'Falkland Is.': '福克兰群岛',
    'Timor-Leste': '东帝汶',
    'Solomon Is.': '所罗门群岛',
    Palestine: '巴勒斯坦',
    'N. Cyprus': '北塞浦路斯',
    Aland: '奥兰群岛',
    'Fr. S. Antarctic Lands': '法属南半球和南极陆地',
    Mauritius: '毛里求斯',
    Comoros: '科摩罗',
    'Eq. Guinea': '赤道几内亚',
    'Guinea-Bissau': '几内亚比绍',
    'Dominican Rep.': '多米尼加',
    'Saint Lucia': '圣卢西亚',
    Dominica: '多米尼克',
    'Antigua and Barb.': '安提瓜和巴布达',
    'U.S. Virgin Is.': '美国原始岛屿',
    Montserrat: '蒙塞拉特',
    Grenada: '格林纳达',
    Barbados: '巴巴多斯',
    Samoa: '萨摩亚',
    Bahamas: '巴哈马',
    'Cayman Is.': '开曼群岛',
    'Faeroe Is.': '法罗群岛',
    'IsIe of Man': '马恩岛',
    Malta: '马耳他共和国',
    Jersey: '泽西',
    'Cape Verde': '佛得角共和国',
    'Turks and Caicos Is.': '特克斯和凯科斯群岛',
    'St. Vin. and Gren.': '圣文森特和格林纳丁斯'
  }
  const option = {
    // 图表主标题
    // title: {
    //   text: '中国境外输入来源', // 主标题文本，支持使用 \n 换行
    //   //top: 20, // 定位 值: 'top', 'middle', 'bottom' 也可以是具体的值或者百分比
    //   top:'4%',
    //   left: 'center', // 值: 'left', 'center', 'right' 同上
    //   textStyle: { // 文本样式
    //     fontSize: 28,
    //     fontWeight: 600,
    //     color: 'black'
    //   }
    // },
    grid: {
      width:'100%',
      height:'100%',
      left: '0%',
      right: '0%',
      bottom: '0%',
      containLabel: true
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
      trigger: 'item',
      formatter: function (params) {
        if (params.name) {
          // console.log(params);
          if(params.componentSubType === 'map'){      //终点或者飞线则不显示
            return params.name + ' : ' + (isNaN(params.value) ? 0 : parseInt(params.value));
          }else{
            return params.name
          }
        }
      }
    },
    // 视觉映射组件
    
    visualMap: {
      min: minNum,
      max: maxNum,//maxNum,
      left: '5%',
      top: '55%',
      text: ['高', '低'],//取值范围的文字
      textStyle: {
        fontSize: 14,
        color: 'black',
      },
      calculable: true,// 是否显示拖拽用的手柄
      realtime: false, // 拖拽时，是否实时更新
      inRange: {
        color: ['#fff4e6', '#dd2002']//取值范围的颜色
      },
      show: true, // 是否显示 visualMap-continuous 组件 如果设置为 false，不会显示，但是数据映射的功能还存在
      // 指定 visualMapContinuous 组件的允许的最小/大值。'min'/'max' 必须用户指定。
      // [visualMap.min, visualMax.max] 形成了视觉映射的『定义域』
      type: 'piecewise', // continuous 类型为连续型  piecewise 类型为分段型
      seriesIndex:[0],   //只对series的第一组数据生效
    },
    geo: {
      map: 'world',
      roam: false,//开启缩放和平移  'scale' 或者 'move' false true
      scaleLimit: {
          min: 1.23,//缩放限制
          max: 2
        },
      label: {
        normal: {
          show: false,
          fontSize: '10',//注意：地图名字字体如果过大会导致字体重叠
          color: 'rgba(0,0,0,0.7)'
        }
      },
      itemStyle: {
        normal: {
          borderColor: 'rgba(0, 0, 0, 0.2)'
        },
        emphasis: {
          areaColor: '#F3B329',//鼠标选择区域颜色
          shadowOffsetX: 0,
          shadowOffsetY: 0,
          shadowBlur: 20,
          borderWidth: 0,
          shadowColor: 'rgba(0, 0, 0, 0.5)'
        }
      },
      // animationDurationUpdate:0,
      nameMap: nameMap,
      // regions: [{
      //     name: '中国',
      //     itemStyle: {
      //         areaColor: '#f0c9cf',
      //         color: '#FFD700'
      //     }
      // }],
      animationDurationUpdate:0
    },
    series: [
      //输入到中国的人数
      {
        name: 'World',
        type: 'map',
        mapType: 'world',
        roam: false,
        scaleLimit: {
          min: 1.23,//缩放限制
          max: 2
        },
        itemStyle: {
          // areaColor: '#fff4e6', // 地图区域的颜色 如果设置了visualMap，areaColor属性将不起作用
          borderWidth: 0.5, // 描边线宽 为 0 时无描边
          borderColor: '#000', // 图形的描边颜色 支持的颜色格式同 color，不支持回调函数
          borderType: 'solid', // 描边类型，默认为实线，支持 'solid', 'dashed', 'dotted'
          emphasis: { label: { show: true } }
        },
        label: {
          show: false // 是否显示对应地名
        },
        data: datalist.value,
        nameMap: nameMap,
        // animationDurationUpdate:0,
      },
    //终点
    {
        type: 'effectScatter',
        coordinateSystem: 'geo',
        zlevel: 2,
        rippleEffect: {
            period: 8,
            brushType: 'stroke',
            scale: 2
        },
        label: {
            normal: {
                show: false,
                position: 'right', //显示位置
                offset: [5, 0], //偏移设置
                // formatter: '', //圆环显示文字
            },
            // emphasis: {
            //     show: true
            // }
        },
        symbol: 'circle',
        symbolSize: function(val) {
            return 5; //圆环大小
        },
        itemStyle: {
            normal: {
                show: true,
                color: '#FF9300',
            }
        },
        data: destination.value
    },
    //起点
    {
        type: 'effectScatter',
        coordinateSystem: 'geo',
        zlevel: 2,
        rippleEffect: {
            //涟漪特效
            period: 4, //动画时间，值越小速度越快
            brushType: 'stroke', //波纹绘制方式 stroke, fill
            scale: 4 //波纹圆环最大限制，值越大波纹越大
        },
        label: {
            normal: {
                show: false,
                position: 'right', //显示位置
                offset: [5, 0], //偏移设置
                // formatter: '{b}', //圆环显示文字
                textStyle: {
                    color: 'red'
                }
            },
            // emphasis: {
            //     show: true
            // }
        },
        symbol: 'circle',
        symbolSize: function(val) {
            return 5; //圆环大小
        },
        itemStyle: {
            normal: {
                show: false,
                color: '#E0C896',
            }
        },
        data: placeOrigin.value
    },
    //飞线
    {
      type: 'lines',
      zlevel: 2,
      effect: {
          show: true,
          period: 6,
          delay:1000,
          trailLength: 0,
          symbol: 'arrow',
          symbolSize: 8,
          color:'#ff8800',
          loop:true
      },
      lineStyle: {
          normal: {
              color:'#8A91BA',
              type:'dashed', // 虚线
              width: 2,
              opacity: 1,
              curveness: 0.2, // 弯曲度
          },
          emphasis: {
              color: '#FF9600' //飞线悬浮颜色
          }
      },
      label: {
          normal: {
              show: true,
              position: 'middle',
              formatter: '{b}'
          },
          formatter:()=>{
            // console.log(1);
          }
      },
      data: lineData.value.slice(-10)
    },
    ]
  };
  worldChart.setOption(option);
  // worldChart.on('georoam',function(params){
  //     var option = worldChart.getOption();
  //   if(params.zoom!=null&&params.zoom!=undefined){ //捕捉到缩放时
  //       option.series[0].zoom=option.geo[0].zoom;//下层geo的缩放等级跟着上层的geo一起改变
  //       option.series[0].center=option.geo[0].center;//下层的geo的中心位置随着上层geo一起改变
  //   }else{//捕捉到拖曳时
  //       option.series[0].center=option.geo[0].center;//下层的geo的中心位置随着上层geo一起改变
  //   }
  //   worldChart.setOption(option);
  // });

}

</script>
<style lang="less" scoped>
.jwsrWrapper {
  // background-color: dimgray;
  width: 100%;
  height: 100%;
  padding-top: 8%;
  display: flex;
  // flex-direction: column;
  position: relative;

  button {
    width: 100px;
    height: 200px;
    position: absolute;
    top: 100px;
    left: 100px;
    z-index: 10;
  }
  .loading{
    width: 100%;
    height: 100%;
    position: absolute;
  }
  .jwsrLeft{
      width: 76%;
      height: 90%;
      margin-left: 2%;
      margin-right: 2%;
    .jwsrNum{
      width: 100%;
      height: 15%;
      margin-top: 2%;
      // display: flex;
      .digitalFlop{
        width: 15%;
        height: 80%;
        float: left;
        margin-left: 8%;
        margin-top: 2%;
      }
    }


    .mapWrapper{
      width: 95%;
      height: 73%;
      margin-top: 2%;
      padding-left: 2%;
      .jwsr {
        width: 100%;
        height: 85%;
        transform: translateY(10%);
      }              
    }
  }


  .jwsrRight {
    width: 20%;
    height: 90%;
    margin-right: 2%;
    display: flex;
    flex-direction: column;
    justify-content:center;
    align-items:center;
    // background-color: blueviolet;
    .el-switch{
      // border: 1px solid black;
      border-radius: 10px;
      // margin-bottom: 3%;
    }
    .mb-2{
      width: 90%;
      height: 10%;
      // margin: auto;
    }
    .scrollTop{
      width: 90%;
      height: 70%;
      background-color: rgb(186, 185, 185);
      border-radius: 5px;
    }
  }

}
</style>