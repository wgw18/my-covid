import createServe from "./http"

//获取疫情数据1
export function dataSource1(params = {}) {
    return createServe({
        method: "GET",
        url: '/dataSource1',
        params
    })
}

//获取疫情数据2
export function dataSource2(params = {}) {
    return createServe({
        method: "GET",
        url: '/dataSource2',
        params
    })
}

//获取ip信息
export function getIpMsg(params = {}) {
    return createServe({
        method: "GET",
        url: '/getIpMsg',
        params
    })
}

export function login(params = {}){
    return createServe({
        method: "POST",
        url: '/login',
        data:{
            ...params
        }
        
    })
}