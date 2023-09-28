<template>
  <div class="login-wrapper">
    <div class="login-content">
      <div class="login-left">
      </div>
      <div class="login-right">
        <div class="login-title">
          <h1>COVID</h1>
          <h2>Visualization</h2>
        </div>
        <el-form  ref="ruleFormRef" :model="ruleForm" :rules="rules" :size="large" 
          label-width="80px" style="width:300px">
            <el-form-item class="login-form-item" label="用户名" prop="username">
                <el-input v-model="ruleForm.username"></el-input>
            </el-form-item>
            <el-form-item class="login-form-item" label="密码" prop="password">
                  <el-input type="password" v-model="ruleForm.password"></el-input>
            </el-form-item>
            <el-form-item>
                  <el-button type="primary" @click="LoginFn" style="width: 150px;">登录</el-button>
            </el-form-item>
        </el-form>     
      </div>  

    </div>

  </div>

</template>


<script setup>
import { useRouter , useRoute } from 'vue-router'
import { useUserStore  } from '../store/index'
import { storeToRefs } from 'pinia'
import { login } from '../api/request'
import { ref , getCurrentInstance } from 'vue';

const { proxy }  = getCurrentInstance(); 

const router = useRouter()

// const store = useUserStore()
// const { userMsg } = storeToRefs(store)
// const { loginCallback } = store

let ruleForm = ref({
  username:'admin',
  password:'123456'
})

//校验用户名
const checkUsername = function (rule, value, callback) {
    if (value.trim() === "") {
        callback(new Error('请输入用户名'))
    } else {
        callback()
    }
}

//校验密码
const checkPassword = function (rule, value, callback) {
    if (value.trim() === "") {
        callback(new Error('请输入密码'))
    } else {
        callback()
    }
}

const rules = {
  username: [
      { required: true, validator: checkUsername, message: '请输入用户名', trigger: 'blue' }
  ],
  password: [
      { required: true, validator: checkPassword,  message: '请输入密码', trigger: 'blue' }
  ]
}


const LoginFn = async function() {
    proxy.$refs.ruleFormRef.validate(async valid => {
      if (!valid) return
      const { data: result } = await login(ruleForm.value)
      if (result.status !== 200){
        alert('登录失败')
        return
      }  
      window.sessionStorage.setItem('token', result.data.token)
      router.push( '/home/world')
      // loginCallback()
    })
}



</script>

<style lang="less" scoped>
.login-wrapper{
  width: 100%;
  height: 100%;
  background:url('../assets/img/loginBackground.jpeg') no-repeat;
  background-size:cover;
  position: relative;

  .login-content{
    width: 70%;
    height: 60%;
    margin: auto;
    position: absolute;
    top: 0; bottom: 0; left: 0; right: 0;
    border-radius: 20px;
    border: 1px solid black;
    overflow: hidden;
    display: flex;
    .login-left{
      flex:1;
      background: url('../assets/img/loginDec.jpg') no-repeat;
      background-size:cover;
    }
    .login-right{
      background-color: aliceblue;
      .login-title{
        width: 100%;
        height: 25%;
        color: rgb(88, 83, 83);
        text-align: center;
        padding-top: 50px;
        h1{
          font-size: 40px;
          font-weight: 800;
          margin-bottom: 18px;
        }
        h2{
          font-size: 30px;
          font-weight: 600;
        }
      }
    .el-form{
      padding: 50px;
      // box-shadow:  2px 2px 20px 0px rgba(0,0,0,0.5);
      // position: absolute;
      // top: 35%;
      // right: 200px;
      .login-form-item .el-form-item__label{
          color: white;
      }    
    }

    }

}
}

</style>