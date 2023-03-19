<template>
    <dv-loading class="loading" v-if="loadingFlag">Loading...</dv-loading>
    <dv-decoration-4 :reverse="true" class="dec4"/>
    <div class="world" @click.stop="setWidth='0'">
        <div class="msg" v-if="hoverObj.flag" :style="{top:hoverObj.y,left:hoverObj.x}">
            <li class="name" >{{ hoverObj.name }}</li>
            <li>累计：{{ hoverObj.value}}</li>
            <li>现存：{{ hoverObj.econNum }}</li>
            <li>治愈：{{ hoverObj.cureNum }}</li>
            <li>死亡：{{ hoverObj.deathNum }}</li>
        </div>
    </div>

    <!-- 确诊数字 -->
    <dv-border-box-5 class="worldNum" :color="['#5CA4C4', '#467DB1']">
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
        <dv-decoration-1 style="width:200px;height:50px;" class="dec1"/>
        <dv-decoration-8 style="width:300px;height:50px;" class="dec8"/>
        <dv-decoration-2 style="width:200px;height:5px;" class="dec2"/>
        <dv-decoration-12 style="width:90px;height:90px;" class="dec12"/>
    </dv-border-box-5>

    <!-- 确诊排名 -->
    <dv-border-box-5 class="worldTop" :color="['#5CA4C4', '#467DB1']" :reverse="true">
        <span class="worldToptitle" @click="">累计确诊TOP</span>
        <dv-scroll-ranking-board :config="config" class="scrollTop"/>
        <dv-decoration-1 style="width:200px;height:50px;" class="dec1r"/>
        <dv-decoration-8 :reverse="true" style="width:300px;height:50px;" class="dec8r"/>
        <dv-decoration-2 style="width:200px;height:5px;" class="dec2r"/>
    </dv-border-box-5>

    <!-- 设置按钮 -->
    <svg class="icon icon-set" aria-hidden="true" @click="setWidth='30%'">
        <use xlink:href="#icon-shezhi"></use>
    </svg>

    <Set class="set-component"  :style="{width:setWidth}" @changeSetData="changeSetData" ></Set> //设置组件
</template>

<script setup>
import DigitalFlop from '@/components/DigitalFlop.vue';
import Set from '@/components/Set.vue'
import { useAllDataStore ,useSetDataStore} from '../store/index'
import { storeToRefs } from 'pinia'
import { ref, computed, watch, onMounted } from 'vue';
import worldJson from "echarts/map/json/world.json"
import capitalMap from "@/utils/capitalMap"
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls"
import dat from 'dat.gui'
import universe from '@/assets/img/universe.jpg'
import star from '@/assets/img/star.jpg'
// import photoEffect from '@/assets/img/Photoeffect.png'
// import earth from '@/assets/img/earth.jpg'
import earth8k from '@/assets/img/earth_8k.jpg'
import earthNight from '@/assets/img/earthNight.png'
// import night8k from '@/assets/img/night_8k.jpg'
import earthNormal from '@/assets/img/earthNormal.jpg'
import earthGrayscale from "@/assets/img/map_inverted.png";
import halo from '@/assets/img/halo.png'
import earthGlowImg from "@/assets/img/earth-glow.jpg";
import virusImg from "@/assets/img/virus.png";
import wave from '@/assets/img/wave.png'
import ringImg from "@/assets/img/ring_explosion.jpg";
import light_column from '@/assets/img/light_column.png'
import earthInverted from '@/assets/img/map_inverted.png'
let loadingFlag = ref(true), //加载中flag
    countryData = ref([]),
    hoverObj = ref({flag:false}),
    certain = ref(0),
    ecertain = ref(0),
    die = ref(0),
    recure = ref(0),
    configData = ref([]),
    setWidth = ref("0"),
    econNumMax = 0,
    econNumMin = Infinity,
    econNumTop50 = 0,
    colorStep = [
        '#5a1216',
        '#fba414',
        '#fed71a',
        '#5bae23',
        '#2b73af'
    ]
const config = computed(()=>{
    return {
        data:configData.value,
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
let div = null,
    radius= 100,
    orbitControls = null,   //创建鼠标控件
    worldMesh = {
        universeMesh:null,    //宇宙
        starsPointMesh:null,  //星辰
    },    
    earthGroup = new THREE.Group(),//球体组
    mapGroup = new THREE.Group(),
    lightGroup = new THREE.Group(),
    ringArr = [],
    beamArr = [],
    scene = null,
    renderer = null,        //创建渲染器对象
    camera = null ,          //创建相机对象
    expandRingMesh = null,
    raf = ref()             //动画

// const gui = new dat.GUI();
// let controls = {
//   rotationSpeed: 0.00005,  //弧度每毫秒
// }
// gui.add(controls, 'rotationSpeed', 0, 0.001)
// gui.domElement.style = 'position:absolute;top:10px;right:10px;z-index:100;'

    // store
const store = useAllDataStore()
const { allData } = storeToRefs(store)

const store1 = useSetDataStore()
const { setData } = storeToRefs(store1)



onMounted(() => {
    console.log(allData);
    draw()
})
watch(()=>allData.value.updated,()=>{
    draw()
})

//设置切换
function changeSetData(type) {
    switch(type){
        case "rotationSpeed":
            orbitControls.autoRotateSpeed = setData.value.rotationSpeed
            break
        case "autoRotate":
            orbitControls.autoRotate = setData.value.autoRotate
            break
        case "isDrag"://鼠标拖拽旋转
            orbitControls.enableRotate = setData.value.isDrag
            break
        case "isZoom"://鼠标缩放
            orbitControls.enableZoom = setData.value.isZoom
            break
        case "earthType":
            reload()
            break
        case "isRippling":
            if(!setData.value.isRippling){
                for(let i = 0;i<ringArr.length;i++){
                    earthGroup.remove(ringArr[i])
                }                
            }else{
                for(let i = 0;i<ringArr.length;i++){
                    earthGroup.add(ringArr[i])
                }  
            }
            break
        case "isBeam":
            if(!setData.value.isBeam){
                for(let i = 0;i<beamArr.length;i++){
                    earthGroup.remove(beamArr[i])
                }                
            }else{
                for(let i = 0;i<beamArr.length;i++){
                    earthGroup.add(beamArr[i])
                }  
            }
            break
        default:
            break
    }
//   (type == "sphereType") && (destroyScene(), init(sphereData.value));//球体类型切换
//   (type == "dataType") && (location.reload());//刷新页面重新获取数据源
};

// 重新加载
function reload(){
    destroyScene()
    draw()
    // clearGroup(mapGroup)
    // clearGroup(earthGroup)
    // clearGroup(lightGroup)
}

//销毁场景
function destroyScene() {
  clearGroup(mapGroup)
  clearGroup(earthGroup)
  clearGroup(lightGroup)
  cancelAnimationFrame(raf.value) //停止动画渲染
  renderer.forceContextLoss() //强制失去上下文
  renderer.dispose()
  scene.clear()
  scene = null
  camera = null
  orbitControls = null
  div.removeEventListener("mousemove", onMousemove, false);
  div.innerHTML = null
  div = null
  renderer = null
};

//销毁组数据
function clearGroup(group) {
  //清除缓存
  const clearCache = (item) => {
    item.geometry?.dispose();//必须对组中的material与geometry进行dispose，清除占用的缓存
    item.material?.dispose();
  };
  //移除模型
  const removeObj = (obj) => {
    let arr = obj.children.filter((x) => x);
    arr.forEach((item) => {
      if (item.children.length) {
        removeObj(item);
      } else {
        clearCache(item);
        item.clear();
      }
    });
    obj.clear();
    arr = null;
  };
  removeObj(group);
};
//数据获取
function getData(){
    countryData.value = allData.value.worldlist.map(val=>{
        return {
            name:val.name,
            conNum:val.conNum,
            cureNum:val.cureNum,
            deathNum:val.deathNum,
            econNum:val.econNum,
            susNum:val.susNum,
            value:val.value,
            pos:capitalMap.get(val.name)
        }
    })
    countryData.value.sort((a,b)=>{
        return b.econNum - a.econNum
    })
    econNumMax = countryData.value[0].econNum
    econNumMin = countryData.value.at(-1).econNum
    econNumTop50 = countryData.value[50].econNum
    // console.log('@',countryData.value,econNumMax,econNumMin,countryData.value.slice(0,50));
    certain.value = allData.value.othertotal.certain
    ecertain.value = allData.value.othertotal.ecertain
    die.value = allData.value.othertotal.die
    recure.value = allData.value.othertotal.recure
    configData.value= countryData.value.slice(0,50).map(val=>{
        return {
            name:val.name,
            value:Number(val.econNum),
        }
    })
    configData.value.sort((a,b)=>{
        return Number(b.value) - Number(a.value) 
    })

}
    // 3D地球
async function initEarth(earth,color){
    var geometry = new THREE.SphereGeometry(radius, 100, 100); //创建一个球体几何对象
    var material = new THREE.MeshLambertMaterial({
        map: new THREE.TextureLoader().load(earth),
        // alphaMap:new THREE.TextureLoader().load(earth),
        // transparent:true,
        // color:new THREE.Color(0x000000),
        // color:new THREE.Color(0x444444),
        color:new THREE.Color(color),
        // color:new THREE.Color(0xaaaaaa),
        normalMap:new THREE.TextureLoader().load(earthNormal),
        normalScale: new THREE.Vector2(3, 3)
    }); 
    let earthMesh = new THREE.Mesh(geometry, material); //网格模型对象Mesh
    earthGroup.add(earthMesh); //网格模型添加到场景中
}
async function initEarth2(){
    let globeBufferGeometry = new THREE.SphereGeometry(radius- 3, 50, 50);//球体几何体
    let globeInnerMaterial = new THREE.MeshBasicMaterial({
    color: new THREE.Color(0x555555),//颜色
    transparent: true,//透明
    opacity: .4,//不透明度
    fog: new THREE.Fog(0x050505, 2000, 3500),
    });
    let earthMesh = new THREE.Mesh(
    globeBufferGeometry,
    globeInnerMaterial
    );
    earthGroup.add(earthMesh); //将网格放入地球组    
}
async function initEarth3(color) {
  let geometry = new THREE.SphereGeometry(radius-3, 100, 100);//球体几何体
  let material = new THREE.MeshBasicMaterial({
    color: new THREE.Color(color),//颜色
    transparent: true,//透明
    opacity: .4,//不透明度
    fog: new THREE.Fog(0x050505, 2000, 3500),
  });
  let earthMesh = new THREE.Mesh(
    geometry,
    material
  );
  earthGroup.add(earthMesh); //将网格放入地球组
  createSpot();//创建斑点
};
//创建球面斑点
function createSpot() {
  let img = new Image();
  img.src = earthGrayscale; //黑白地图
  //图片加载后绘制斑点至球面
  img.onload = () => {
    let canvas = document.createElement("canvas");
    canvas.width = img.width; //使得canvas尺寸与图片尺寸相同
    canvas.height = img.height;
    (canvas.getContext("2d")).drawImage(img, 0, 0, img.width, img.height);//canvas绘制图片
    let canData = (canvas.getContext("2d")).getImageData(0, 0, canvas.width, canvas.height);//获取画布像素数据
    let globeCloudBufferGeometry = new THREE.BufferGeometry(); //设置缓冲几何体
    let globeCloudVerticesArray = []; //地球云缓冲几何体顶点
    let o = null; //数组处理时的计数
    for (o = 0; o < canData.data.length; o += 4) {
      let r = (o / 4) % canvas.width,
        i = (o / 4 - r) / canvas.width;
      if ((o / 4) % 2 == 1 && i % 2 == 1)
        if (0 === canData.data[o]) {
          let n = r,
            longitude = (i / (canvas.height / 180) - 90) / -1, //经度
            latitude = n / (canvas.width / 360) - 180; //维度
          let s = latLongToVector3(longitude, latitude, radius-1, .1); 
          globeCloudVerticesArray.push(s); //将变换后的顶点放入数组
        }
    }
    let l = new Float32Array(3 * globeCloudVerticesArray.length); //创建顶点数组长度
    for (o = 0; o < globeCloudVerticesArray.length; o++) {
      l[3 * o] = globeCloudVerticesArray[o].x;//设置顶点数组数据
      l[3 * o + 1] = globeCloudVerticesArray[o].y;
      l[3 * o + 2] = globeCloudVerticesArray[o].z;
    }
    
    let positionVal = new THREE.BufferAttribute(l, 3); //设置缓冲区属性值
    globeCloudBufferGeometry.setAttribute("position", positionVal); //给缓冲几何体添加位置属性
    let globeCloudMaterial = new THREE.PointsMaterial({
      color: new THREE.Color(0x80A4DB),//颜色    
      fog: true,
      size: 1.5,
      transparent: false,
    });//球面斑点材质
    let d = new Float32Array(3 * globeCloudVerticesArray.length), c = [];
    for (o = 0; o < globeCloudVerticesArray.length; o++) {
      c[o] = new THREE.Color(0x000000);//球面斑点颜色
      d[3 * o] = c[o].r;//设置地球云数组rgb颜色
      d[3 * o + 1] = c[o].g;
      d[3 * o + 2] = c[o].b;
    }
    let color_val = new THREE.BufferAttribute(d, 3);
    globeCloudBufferGeometry.setAttribute("color", color_val);//给缓冲几何体添加颜色属性,修改颜色直接修改globeCloudBufferGeometry的setAttribute
    let globeCloud = new THREE.Points(//球面的象素点
      globeCloudBufferGeometry,
      globeCloudMaterial,
    );
    globeCloud.name = "globeCloud";
    earthGroup.add(globeCloud); //将地球云添加到地球对象中
  };
};
function latLongToVector3(e, a, t, o) {
  let r = (e * Math.PI) / 180,
    i = ((a - 180) * Math.PI) / 180,
    n = -(t + o) * Math.cos(r) * Math.cos(i),
    s = (t + o) * Math.sin(r),
    l = (t + o) * Math.cos(r) * Math.sin(i);
  return new THREE.Vector3(n, s, l); //计算三维向量
};
// 国家边界
function initMap(color){
    worldJson.features.forEach(function (area) {
        // "Polygon"：国家area有一个封闭轮廓
        if (area.geometry.type === 'Polygon') {
            var pointArr = []//边界线顶点坐标
            area.geometry.coordinates[0].forEach(elem => {
                // z坐标设置为0.这样地图轮廓位于XOY平面上
                // pointArr.push(elem[0], elem[1], 0)
                pointArr.push(...lglt2xyz(elem[0], elem[1], radius+0.1))
            })
            mapGroup.add(closedLoop(pointArr,color))//国家边界轮廓插入组对象mapGroup
        } //"MultiPolygon"：国家area有多个封闭轮廓
        else if (area.geometry.type === 'MultiPolygon') {
            // 解析所有封闭轮廓边界坐标area.geometry.coordinates
            area.geometry.coordinates.forEach(polygon => {
                if(polygon[0]){
                    var pointArr = []//边界线顶点坐标
                    polygon[0].forEach(elem => {
                        // pointArr.push(elem[0], elem[1], 0)
                        pointArr.push(...lglt2xyz(elem[0], elem[1], radius+0.1))
                    })
                    mapGroup.add(closedLoop(pointArr,color))//国家边界轮廓插入组对象mapGroup                        
                }

            })
        }
    })
    earthGroup.add(mapGroup)
}
function closedLoop (pointArr,color) {
      /**
       * 通过BufferGeometry构建一个几何体，传入顶点数据
       * 通过Line模型渲染几何体，连点成线
       * LineLoop和Line功能一样，区别在于首尾顶点相连，轮廓闭合
       */
      var geometry = new THREE.BufferGeometry() //创建一个Buffer类型几何体对象
      //类型数组创建顶点数据
      var vertices = new Float32Array(pointArr)
      // 创建属性缓冲区对象
      var attribue = new THREE.BufferAttribute(vertices, 3) //3个为一组，表示一个顶点的xyz坐标
      // 设置几何体attributes属性的位置属性
      geometry.attributes.position = attribue
      // 线条渲染几何体顶点数据
      var material = new THREE.LineBasicMaterial({
        color: color ,//线条颜色
        linewidth: 50, 
      })//材质对象
      // var line = new THREE.Line(geometry, material);//线条模型对象
      var line = new THREE.LineLoop(geometry, material)//首尾顶点连线，轮廓闭合
      return line
}
//涟漪、光柱、病毒精灵
function initRing(color){
    countryData.value.forEach((val,index)=>{
        // console.log(val,val.name,capitalMap.get(val.name),!capitalMap.get(val.name));
        let pos = capitalMap.get(val.name)
        if(pos){
            let posArr = lglt2xyz(...pos,radius)
            let posObj = {
                x:posArr[0],
                y:posArr[1],
                z:posArr[2],
            }
            // ringGroup.add(createPointMesh(posObj))
            let scale = val.econNum / econNumMax,  //0-1
                scale2 = val.econNum / econNumTop50
            if(setData.value.earthType === 'grain'){
                if(scale2 >= 1)initVirus(posObj,scale,val,0xfe4242)
                else initVirus(posObj,scale,val,0xf9b8b8)
                if(setData.value.isBeam && scale2 >= 1)beamArr.push(...createBeamMesh(posObj,scale,30,val))
            }else{
                if(setData.value.isRippling)ringArr.push(createPointMesh(posObj,scale,val,color))
                if(setData.value.isBeam && scale2 >= 1)beamArr.push(...createBeamMesh(posObj,scale,index,val))              
            }

            
        }
    })
    for(let i = 0;i<ringArr.length;i++){
        earthGroup.add(ringArr[i])
    }
    for(let i = 0;i<beamArr.length;i++){
        earthGroup.add(beamArr[i])
    }
    // earthGroup.add(ringGroup)
}
// 涟漪
function createPointMesh( pos , scale,val,color) {
    let planeGeometry = new THREE.PlaneGeometry(1, 1); //默认在XOY平面上
    var material = new THREE.MeshBasicMaterial( {
        map: new THREE.TextureLoader().load(wave),//gradientRing
        color:new THREE.Color(color),// 0x428675   0xffd111

        transparent: true, //使用背景透明的png贴图，注意开启透明计算
        side: THREE.DoubleSide, //双面可见
        depthWrite: false, //禁止写入深度缓冲区数据
        opacity: 1.0,
    } );
    var mesh = new THREE.Mesh( planeGeometry, material );
    mesh.name = 'country'
    mesh.val = val
    var size = radius * 0.02;//矩形平面Mesh的尺寸
    mesh.size = size * (4 * scale + 1.5)
    mesh._s = Math.random() * 1.0 + 1.0; //自定义属性._s表示mesh在原始大小基础上放大倍数  光圈在原来mesh.size基础上1~2倍之间变化
    mesh.scale.set( size, size, size );//设置mesh大小
    //设置mesh位置
    mesh.position.set( pos.x, pos.y, pos.z );
    // mesh在球面上的法线方向(球心和球面坐标构成的方向向量)
    var coordVec3 = new THREE.Vector3( pos.x, pos.y, pos.z ).normalize();
    // mesh默认在XOY平面上，法线方向沿着z轴new THREE.Vector3(0, 0, 1)
    var meshNormal = new THREE.Vector3( 0, 0, 1 );
    // 四元数属性.quaternion表示mesh的角度状态
    //.setFromUnitVectors();计算两个向量之间构成的四元数值
    mesh.quaternion.setFromUnitVectors( meshNormal, coordVec3 );
    return mesh;
}
// 光柱
function createBeamMesh( pos , scale,index,val){
    var plane = new THREE.PlaneGeometry(5*(3*scale+1),20*(3*scale+1))
    var material = new THREE.MeshPhongMaterial({
        //设置矩形网格模型的纹理贴图(光柱特效)
        map: new THREE.TextureLoader().load(light_column),
        // color:new THREE.Color(0x22ffcc),
        // color:'#'+Math.floor((-(colorMin.value-colorMax.value)*scale+colorMax.value)).toString(16),
        // color: new THREE.Color(`rgb(${Math.floor(colorMin.value.R-(colorMin.value.R-colorMax.value.R)*scale)}, 
        //                         ${Math.floor(colorMin.value.G-(colorMin.value.G-colorMax.value.G)*scale)}, 
        //                         ${Math.floor(colorMin.value.B-(colorMin.value.B-colorMax.value.B)*scale)})`),
        color:colorStep[Math.floor((index/10))],
        // 双面显示
        side: THREE.DoubleSide,
        // 开启透明效果，否则颜色贴图map的透明不起作用
        transparent: true,
    });
    // console.log(Math.floor((index/10)));
    var mesh = new THREE.Mesh(plane, material);
    mesh.position.set( pos.x, pos.y, pos.z );
    var coordVec3 = new THREE.Vector3( pos.x, pos.y, pos.z ).normalize();
    // mesh默认在XOY平面上，法线方向沿着z轴new THREE.Vector3(0, 0, 1)
    var meshNormal = new THREE.Vector3( 0, 1, 0 );
    // 四元数属性.quaternion表示mesh的角度状态
    //.setFromUnitVectors();计算两个向量之间构成的四元数值
    mesh.quaternion.setFromUnitVectors( meshNormal, coordVec3 );
    var mesh2 = mesh.clone().rotateY(Math.PI/2)
    mesh.name = 'country'
    mesh.val = val
    mesh2.name = 'country'
    mesh2.val = val
    // earthGroup.add(mesh,mesh2);
    return [mesh,mesh2]
}
// 病毒精灵
function initVirus(pos,scale,val,color){
    var spriteMaterial = new THREE.SpriteMaterial( {
        color:color,
        map: new THREE.TextureLoader().load(virusImg),
        transparent: true,
        // opacity: 0.8,
        depthWrite: true,
        fog: true,
    } );
    var sprite = new THREE.Sprite( spriteMaterial );
    sprite.scale.set( scale*8+4, scale*8+4, 1 );
    sprite.position.set(pos.x, pos.y, pos.z ); //设置点的位置
    sprite.val = val
    sprite.name = 'country'
    earthGroup.add( sprite );
    // console.log(sprite);
}
// 外环
function createExpandRing(color) {
  let ringMaterial = new THREE.MeshBasicMaterial({
    map: new THREE.TextureLoader().load(ringImg),
    color: new THREE.Color(color),
    transparent: true,
    opacity: 0.8,
    side: THREE.DoubleSide,
    fog: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
  });
  let ringGeometry = new THREE.PlaneGeometry(1, 1); 
  expandRingMesh = new THREE.Mesh(ringGeometry, ringMaterial)
  expandRingMesh.rotation.x = 90 * Math.PI / 180
  expandRingMesh._s = 1
  let size = radius * 2
  expandRingMesh.size = size
  expandRingMesh.scale.set( size, size, size );//设置mesh大小
  scene.add(expandRingMesh)
};
// 光晕
function initHalo(color){
    var spriteMaterial = new THREE.SpriteMaterial( {
        map: new THREE.TextureLoader().load(halo),
        transparent: true,
        opacity: 0.8,
        // depthWrite: false
    } );
    var sprite = new THREE.Sprite( spriteMaterial );
    sprite.scale.set( radius*3, radius*3, 1 );
    scene.add( sprite );

    let glowMaterial = new THREE.SpriteMaterial({
    map: new THREE.TextureLoader().load(earthGlowImg),
    color: new THREE.Color(color),
    transparent: true,
    opacity: 1,
    side: THREE.DoubleSide,
    fog: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
  })
  let glowSprite = new THREE.Sprite(glowMaterial);
  glowSprite.scale.set(radius * 3.2, radius * 3.2, 1); 
  scene.add(glowSprite);
}
// 宇宙背景
async function initUniverse(){
    let universeGeometry = new THREE.SphereGeometry(700, 100, 100);
    let universeMaterial = new THREE.MeshLambertMaterial({//高光材质
        map: new THREE.TextureLoader().load(universe),
        side: THREE.DoubleSide, //双面显示
    });
    //宇宙网格
    worldMesh.universeMesh = new THREE.Mesh(universeGeometry, universeMaterial);
    worldMesh.universeMesh.name = "宇宙";
    scene.add(worldMesh.universeMesh);
}
// 随机星辰
function initStars(count) {
	var starsGeometry = new THREE.BufferGeometry ();
    var vertices = new Float32Array(new Array(count).fill(1).map(()=>{
        return [Math.random()*3000,
                Math.random()*4000,
                Math.random()*5000,]
    }).flat(1))
    var attribue = new THREE.BufferAttribute(vertices, 3);
    starsGeometry.attributes.position = attribue;
	// var starsMaterial = new THREE.PointsMaterial({
	// 	color: 0xffffff,
	// 	// sizeAttenuation: false,
    //     size: 2.0 //点对象像素尺寸
	// })
    let starsMaterial = new THREE.PointsMaterial({
        map: new THREE.TextureLoader().load(star),
        size: 4,
        blending: THREE.AdditiveBlending,
        fog: true,
        depthTest: false, //(不能与blending一起使用)
    });
	worldMesh.starsPointMesh = new THREE.Points(starsGeometry, starsMaterial);
	worldMesh.starsPointMesh.name = "starsPointMesh";
	scene.add(worldMesh.starsPointMesh);
    // console.log(starsPoint,'starsPoint',starsGeometry);
}
// 光照
function initLight(ambientLight){
    // 平行光
    var directionalLight = new THREE.DirectionalLight(0x80b5ff, 1);
    directionalLight.position.set(-250, 250, 100);
    lightGroup.add(directionalLight);
    // 点光
    var pointLight = new THREE.PointLight(0x80d4ff, 1);
    pointLight.position.set(-250, 250, 100);
    lightGroup.add(pointLight);
    // 半球光
    var hemisphereLight = new THREE.HemisphereLight(0xffffff, 0x3d6399, 1);
    hemisphereLight.position.set(-250, 250, 100);
    lightGroup.add(hemisphereLight);
    //环境光
    var ambient = new THREE.AmbientLight(ambientLight, 0.8);
    lightGroup.add(ambient);

    scene.add(lightGroup)
}
// 经纬度转化
function lglt2xyz(lng, lat, radius) {
  const phi = (180 + lng) * (Math.PI / 180)
  const theta = (90 - lat) * (Math.PI / 180)
  return [
    -radius * Math.sin(theta) * Math.cos(phi),
    radius * Math.cos(theta),
    radius * Math.sin(theta) * Math.sin(phi),
]
}
// let T0 = new Date();//上次时间
// 渲染
function render() {
        // let T1 = new Date();//本次时间
        // let t = T1-T0;//时间差
        // T0 = T1;//把本次时间赋值给上次时间
        // for(let m in worldMesh){
        //     if(!!worldMesh[m]){
        //         worldMesh[m].rotateY(setData.value.rotationSpeed*t)
        //     }
        // }
        // //earthGroup.rotateY(setData.value.rotationSpeed*t)

        if(setData.value.isRippling){
            // 涟漪动画
            ringArr.forEach(function (mesh) {
                mesh._s += 0.007
                mesh.scale.set(
                mesh.size * mesh._s,
                mesh.size * mesh._s,
                mesh.size * mesh._s
                )
                if (mesh._s <= 1.5) {
                    mesh.material.opacity = (mesh._s - 1) * 2; //2等于1/(1.5-1.0)，保证透明度在0~1之间变化
                } else if (mesh._s > 1.5 && mesh._s <= 2) {
                    mesh.material.opacity = 1 - (mesh._s - 1.5) * 2; //2等于1/(2.0-1.5) mesh缩放2倍对应0 缩放1.5被对应1
                } else {
                    mesh._s = 1.0;
                }
            });            
        }


        // 外环动画
        if(expandRingMesh._s < 2)expandRingMesh._s += 0.04
        else expandRingMesh._s += 0.02
        expandRingMesh.scale.set(
            expandRingMesh.size * expandRingMesh._s,
            expandRingMesh.size * expandRingMesh._s,
            expandRingMesh.size * expandRingMesh._s
        )
        if (expandRingMesh._s <= 1.5) {
            expandRingMesh.material.opacity = (expandRingMesh._s - 1) * 2; //2等于1/(1.5-1.0)，保证透明度在0~1之间变化
        } else if (expandRingMesh._s > 1.5 && expandRingMesh._s <= 2.5) {
            expandRingMesh.material.opacity = 1 - (expandRingMesh._s - 1.5) * 1; //2等于1/(2.5-1.5) mesh缩放2倍对应0 缩放1.5被对应1
        } else {
            expandRingMesh._s = 1.0;
        }

        raf.value = requestAnimationFrame(render)
        div.addEventListener("mousemove", onMousemove, false);
        orbitControls.update() //鼠标控件实时更新
        renderer.render(scene,camera)//执行渲染操作
}
//鼠标移动显示具体信息
function onMousemove(e) {
  let width = div.clientWidth; //窗口宽度
  let height = div.clientHeight; //窗口高度
  //将鼠标点击位置的屏幕坐标转换成threejs中的标准坐标
  let  mouse = new THREE.Vector2() //鼠标的二维平面
  mouse.x = (e.offsetX / width) * 2 - 1;    //正中心为零点的坐标轴
  mouse.y = -(e.offsetY / height) * 2 + 1;
  let raycaster = new THREE.Raycaster()
  raycaster.setFromCamera(mouse, camera); //通过鼠标点的位置和当前相机的矩阵计算出raycaster
  //光线投射器(用于鼠标点击时获取坐标) 
  let intersects = raycaster.intersectObjects(scene.children); // 获取raycaster直线与网格列表相交的集合
  if(intersects.length !== 0 && intersects[0].object.name === 'country'){
    // console.log('onMousemove',intersects[0].object.name,intersects[0].object.val.econNum);
    hoverObj.value = intersects[0].object.val
    div.style.cursor = "pointer" //光标样式
    hoverObj.value.x = e.screenX + "px"
    hoverObj.value.y = e.screenY + "px"
    hoverObj.value.flag = true
  }else{
    hoverObj.value.flag = false
    div.style.cursor = "move"; //光标样式
  }
};
// 主函数
function draw(){
    if(!allData.updated)return
    loadingFlag.value = false
    if(!countryData.value.length)getData()
    div = document.querySelector('.world')
    scene = new THREE.Scene();

    // earth8k   earth earthNight    0x444444 0xaaaaaa
    // initEarth(earth,0xaaaaaa)        

    //  涟漪颜色 0x428675   0xffd111 
        
    switch(setData.value.earthType){
        case "day":
            initEarth(earth8k,0x444444) 
            initLight(0x333bff)
            initMap(0x008fff)    //国家边界
            if(setData.value.isRippling || setData.value.isBeam){
                initRing(0xffd111)
            }
            break
        case "night":
            initEarth(earthNight,0xcccccc)
            initLight(0x163bff)
            initMap(0x008fff)    //国家边界
            if(setData.value.isRippling || setData.value.isBeam){
                initRing(0x1ba784)
            }
            break
        case "grain":
            initEarth3(0x008fff)
            initLight(0x003bff)
            initMap(0xEDD494)    //国家边界
            if(setData.value.isRippling || setData.value.isBeam){
                initRing(0x000000)
            }
            break
        default:
            break
    }    
    scene.add(earthGroup)
    createExpandRing(0x008fff)
    initHalo(0x008fff)
    initUniverse()
    initStars(3000)
    

    let width = div.clientWidth,
        height = div.clientHeight;
    var k = width / height; //窗口宽高比
    var s = 200; //三维场景显示范围控制系数，系数越大，显示的范围越大
    // var camera = new THREE.OrthographicCamera(-s * k, s * k, s, -s, 1, 1000); //正交投影摄像机（左、右、上、下边界、近面、远面、变焦）
    camera = new THREE.PerspectiveCamera(45, width / height, 1, 2000); //创建透视相机(视场、长宽比、近面、远面、变焦)
    camera.position.set(-60, 150, 400); //设置相机位置
    camera.lookAt(scene.position); //摄像机的指向位置
    renderer = new THREE.WebGLRenderer({
        antialias: true, //抗锯齿
        alpha: true, //透明
    });
    renderer.setSize(width, height);//设置渲染区域尺寸
    renderer.setClearColor(0xb9d3ff, 1); //设置背景颜色
    div.appendChild(renderer.domElement); //body元素中插入canvas对象
    // div.appendChild(gui.domElement)

    orbitControls = new OrbitControls(camera,renderer.domElement)//创建控件对象
    orbitControls.autoRotate = setData.value.rotationSpeed;
    orbitControls.enableRotate = setData.value.isDrag;
    orbitControls.enableZoom = setData.value.isZoom; 
    orbitControls.autoRotateSpeed = setData.value.rotationSpeed; 
    //orbitControls.enablePan = false; //右键平移拖拽
    orbitControls.enableDamping = false; //滑动阻尼
    orbitControls.dampingFactor = 0.05; //(默认.25)
    orbitControls.minDistance = 150; //相机距离
    orbitControls.maxDistance = 600; 
    render();
}
</script>
<style lang="less" scoped>
.loading{
    width: 100%;
    height: 100%;
    position: absolute;
}
  .dec4{
    width: 70%;
    height: 5%;
    position: absolute;
    bottom: 2%;
    left: 15%;
  }
.world{
    width: 100%;
    height: 100%;
    .msg{
        width: 12%;
        height: 20%;
        // border: 1px solid rgb(179, 255, 0);

        border: 1px solid 0x008fff;
        background-color: rgba(0, 0, 0, 0.7);
        border-radius: 10%;
        position: absolute;
        user-select:none;
        .name{
            color: red;
            height: 25%;
            line-height: 160%;
            font-size: 160%;
        }
        li{
            width: 100%;
            height: 15%;
            line-height: 120%;
            list-style: none;
            color: white;
            font-size: 120%;
            margin-left: 10%;
            margin-bottom: 2%;
        }
    }
}
.worldNum{
    width: 20%;
    height: 55%;
    padding-top: 2.5%;
    padding-bottom: 2.5%;
    background-color: rgba(255, 255, 255, 0.1);
    border-bottom-right-radius: 25%;
    position: absolute;
    top: 20%;
    left:0;
    display: flex;
    flex-direction: column;
    .digitalFlop{
        width: 100%;
        height: 25%;
        transition: width 0.5s;
    }
}
.worldTop{
    width: 20%;
    height: 55%;
    padding: 2.5%;
    padding-top: 2.5%;
    background-color: rgba(255, 255, 255, 0.1);
    border-top-left-radius: 25%;
    position: absolute;
    top: 20%;
    right:0;
    display: flex;
    flex-direction: column;
    text-align: center;
    .worldToptitle{
        font-size: 24px;
        font-weight: 800;
        color: white;
    }
    .scrollTop{
        margin-top: 2.5%;
    }
}


.icon-set{
    width: 6vw;
    height: 6vw;
    color: white;
    position: absolute;
    right: 1.5%;
    bottom: 3%;
    opacity: 0.4;
    transition-property: transform , opacity;
    transition-duration:0.5s , 0.5s;
}
.icon-set:hover{
    transform: rotate(90deg);
    opacity:1;
}
.set-component{
    width: 0;
    height: 80%;
    background-color: rgba(0, 0, 0, 0.9);
    border-top-left-radius: 10%;
    position: absolute;
    right: 0;
    top:15%;
    transition: width 0.5s ease-out;
}


.dec1{
    transform: translateY(100%) translateX(20%);
}
.dec1r{
    transform: translateY(40%) translateX(20%);
}
.dec8{
    transform: translateY(20%) translateX(80%);
}
.dec8r{
    transform: translateY(-50%) translateX(-100%);
}
.dec2{
    transform: translateY(500%) translateX(120%);
}
.dec2r{
    transform: translateY(-50%) translateX(-100%);
}
.dec12{
    transform: translateY(-10%) translateX(10%);
}
</style>