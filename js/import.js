function sendEvent(key,value={}){
    const event = new CustomEvent(key,value);
    window.dispatchEvent(event);
}

const canvas = document.querySelector("canvas")
const ctx = canvas.getContext("2d")

const assets = {
    img:{
        bg:{},
    },
    chart:{},
    audio:{
        bgm:{},
    },
}

const load = {
    count:0,
    requiredCount:0,

    completedMessage(name){
        console.log(
        `%cLoading complete a file: ${name} [${
            Math.floor((this.count/this.requiredCount)*100)
        }%]`,"color:cyan;")
    },
    wait(){
        var loop = setInterval(()=>{
            if(load.count == load.requiredCount){
                clearInterval(loop)
                //ロード完了後の処理
                sendEvent("load_complete")
            }
        },1000/60)
    },
    img(src,path,name){
        const img = new Image()
        this.file(img,src,path,name)
    },
    audio(src,path,name){
        const audio = new Audio(src)
        this.requiredCount++
        audio.addEventListener("canplaythrough",()=>{
            path[name] = audio
            this.count++
            load.completedMessage(name)
        })
    },
    file(obj,src,path,name){
        this.requiredCount++
        obj.src = src
        obj.addEventListener("load",()=>{
            path[name] = obj
            load.count++
            load.completedMessage(name)
        })
    },
    script(src){
        this.requiredCount++
        const el = document.createElement("script")
        el.src = src
        document.body.append(el)
        el.addEventListener("load",()=>{
            load.count++
            load.completedMessage(src)
        })
    },
    chartWaitingList:[],
    chartWaitingNumber:0, 
    chart(url){
        const myNumber = this.chartWaitingNumber
        this.chartWaitingNumber++
        this.chartWaitingList.push(myNumber)

        var wait = setInterval(()=>{
            if(this.chartWaitingList[0] == myNumber){
                mainProcess()
                clearInterval(wait)
            }
        },1000/60)

        function mainProcess(){
        const scr = document.createElement('script');
        scr.src = url;
        document.body.prepend(scr)
        scr.addEventListener("load",()=>{
            var data = tempChartData
            assets.chart[data.name] = data
            load.chartWaitingList.shift()
            sendEvent("loaded_chart",{name:data.name})
        })
        }
    },
}

//index.html視点のパス！！！
load.audio("assets/audio/sabitsuita_sekai.mp3",assets.audio.bgm,"sabitsuita_sekai")
load.script("js/front.js",assets.img.bg,"stage")
load.script("js/chart.js",assets.img.bg,"stage")
load.img("assets/img/stage.png",assets.img.bg,"stage")
load.img("assets/img/milkyway01.png",assets.img.bg,"bg1")
load.img("assets/img/milkyway06.png",assets.img.bg,"bg2")
load.img("assets/img/rhythmania.png",assets.img,"logo")
load.img("assets/img/press_enter.png",assets.img,"press_enter")

load.wait()

//キー入力とか

const touchKey = {
    d:false,
    f:false,
    j:false,
    k:false,
}
const holdKey = {
    d:false,
    f:false,
    j:false,
    k:false,
}