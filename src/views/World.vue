<template>
    <div class="world" @click.stop="setWidth='0'">
        <div class="msg" v-if="hoverObj.flag" :style="{top:hoverObj.y,left:hoverObj.x}">
            <li class="name" >{{ hoverObj.name }}</li>
            <li>累计：{{ hoverObj.value}}</li>
            <li>现存：{{ hoverObj.econNum }}</li>
            <li>治愈：{{ hoverObj.cureNum }}</li>
            <li>死亡：{{ hoverObj.deathNum }}</li>
        </div>
    </div>
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
    </dv-border-box-5>
    <dv-border-box-5 class="worldTop" :color="['#5CA4C4', '#467DB1']" :reverse="true">
        <dv-scroll-ranking-board :config="config" class="scrollTop"/>
    </dv-border-box-5>
    <svg class="icon icon-set" aria-hidden="true" @click="setWidth='30%'">
        <use xlink:href="#icon-shezhi"></use>
    </svg>
    <Set class="set-component"  :style="{width:setWidth}"></Set>
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
import earth from '@/assets/img/earth.png'
import earth8k from '@/assets/img/earth_8k.jpg'
import earthNight from '@/assets/img/earthNight.jpg'
import night8k from '@/assets/img/night_8k.jpg'
import earthNormal from '@/assets/img/earthNormal.jpg'
import halo from '@/assets/img/halo.png'
import wave from '@/assets/img/wave.png'
import light_column from '@/assets/img/light_column.png'
import earthInverted from '@/assets/img/map_inverted.png'
let countryData = ref([]),
    hoverObj = ref({flag:false}),
    earthType = ref(0),
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
    ringArr = [],
    beamArr = [],
    scene = null,
    renderer = null,        //创建渲染器对象
    camera = null           //创建相机对象

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
function initEarth(earth,color){
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
function initEarth2(){
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
        color: color //线条颜色
      })//材质对象
      // var line = new THREE.Line(geometry, material);//线条模型对象
      var line = new THREE.LineLoop(geometry, material)//首尾顶点连线，轮廓闭合
      return line
}
function initRing(){
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
            ringArr.push(createPointMesh(posObj,scale,val))
            scale2 >= 1 && createBeamMesh(posObj,scale,index)
            
        }
    })
    for(let i = 0;i<ringArr.length;i++){
        earthGroup.add(ringArr[i])
    }
    // earthGroup.add(ringGroup)
}
function createPointMesh( pos , scale,val) {
    let planeGeometry = new THREE.PlaneGeometry(1, 1); //默认在XOY平面上
    var material = new THREE.MeshBasicMaterial( {
        map: new THREE.TextureLoader().load(wave),//gradientRing
        color:new THREE.Color(0xffd111),
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
function createBeamMesh( pos , scale,index){
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
    earthGroup.add(mesh,mesh2);
}
function initHalo(){
    //光晕
    var spriteMaterial = new THREE.SpriteMaterial( {
        map: new THREE.TextureLoader().load(halo),
        transparent: true,
        opacity: 0.8,
        // depthWrite: false
    } );
    var sprite = new THREE.Sprite( spriteMaterial );
    sprite.scale.set( radius*3, radius*3, 1 );
    scene.add( sprite );
}
function initUniverse(){
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
function initStars() {
	var starsGeometry = new THREE.BufferGeometry ();
    var vertices = new Float32Array(new Array(9000).fill(1).map(()=>{
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
function initLight(){
    // 平行光
    var directionalLight = new THREE.DirectionalLight(0x80b5ff, 1);
    directionalLight.position.set(-250, 250, 100);
    scene.add(directionalLight);
    // 点光
    var pointLight = new THREE.PointLight(0x80d4ff, 1);
    pointLight.position.set(-250, 250, 100);
    scene.add(pointLight);
    // 半球光
    var hemisphereLight = new THREE.HemisphereLight(0xffffff, 0x3d6399, 1);
    hemisphereLight.position.set(-250, 250, 100);
    scene.add(hemisphereLight);
    //环境光
    var ambient = new THREE.AmbientLight(0x033bff, 0.8);
    scene.add(ambient);
}
function lglt2xyz(lng, lat, radius) {
  const phi = (180 + lng) * (Math.PI / 180)
  const theta = (90 - lat) * (Math.PI / 180)
  return [
    -radius * Math.sin(theta) * Math.cos(phi),
    radius * Math.cos(theta),
    radius * Math.sin(theta) * Math.sin(phi),
]
}
let T0 = new Date();//上次时间
function render() {
        let T1 = new Date();//本次时间
        let t = T1-T0;//时间差
        T0 = T1;//把本次时间赋值给上次时间
        for(let m in worldMesh){
            if(!!worldMesh[m]){
                worldMesh[m].rotateY(setData.value.rotationSpeed*t)
            }
        }
        earthGroup.rotateY(setData.value.rotationSpeed*t)

        ringArr.forEach(function (mesh) {
            mesh._s += 0.007;
            mesh.scale.set(
            mesh.size * mesh._s,
            mesh.size * mesh._s,
            mesh.size * mesh._s
            );
            if (mesh._s <= 1.5) {
            mesh.material.opacity = (mesh._s - 1) * 2; //2等于1/(1.5-1.0)，保证透明度在0~1之间变化
            } else if (mesh._s > 1.5 && mesh._s <= 2) {
            mesh.material.opacity = 1 - (mesh._s - 1.5) * 2; //2等于1/(2.0-1.5) mesh缩放2倍对应0 缩放1.5被对应1
            } else {
            mesh._s = 1.0;
            }
        });
        requestAnimationFrame(render)
        div.addEventListener("mousemove", onMousemove, false);
        orbitControls.update() //鼠标控件实时更新
        renderer.render(scene,camera)//执行渲染操作
}
//鼠标移动事件(光线投射器不要放在vue的data中，会卡顿)
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
    hoverObj.value.x = e.pageX + "px"
    hoverObj.value.y = e.pageY + "px"
    hoverObj.value.flag = true
  }else{
    hoverObj.value.flag = false
    div.style.cursor = "move"; //光标样式
  }
};
function draw(){
    if(!allData.updated)return
    getData()
    div = document.querySelector('.world')
    scene = new THREE.Scene();

    // earth8k  night8k earth earthNight earthBorder   0x444444 0xaaaaaa
    // initEarth(earth,0xaaaaaa)        
    initEarth(earth8k,0x333333)         
    // initRing()
    scene.add(earthGroup)
    initMap(0x008fff)    //国家边界
    initHalo()
    initUniverse()
    // initStars()
    initLight()

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
    render();
}
</script>
<style lang="less" scoped>
.world{
    width: 100%;
    height: 100%;
    .msg{
        width: 12%;
        height: 20%;
        border: 1px solid rgb(179, 255, 0);
        border-radius: 10%;
        position: absolute;
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
    padding-top: 4%;
    background-color: rgba(255, 255, 255, 0.1);
    border-top-left-radius: 25%;
    position: absolute;
    top: 20%;
    right:0;
    display: flex;
    flex-direction: column;
}


.icon-set{
    width: 8vw;
    height: 8vw;
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
</style>