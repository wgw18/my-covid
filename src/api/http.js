import axios from "axios";
//创建请求
function createServe(config) {
    let serve = axios.create({
        timeout: 5000 //超时
    });
    //请求拦截器
    serve.interceptors.request.use(
        config => {
            return config;
        },
        error => {
            return Promise.reject(error)
        }
    )
    //响应拦截器
    serve.interceptors.response.use(
        response => {
            return response;
        },
        error => {
            return Promise.reject(error)
        }
    )
    return serve(config);
}

export default createServe;