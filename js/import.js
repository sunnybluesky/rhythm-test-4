function sendEvent(key, value = {}) {
    const event = new CustomEvent(key, value);
    window.dispatchEvent(event);
}

const canvas = document.querySelector("canvas")
const ctx = canvas.getContext("2d")

const assets = {
    img: {
        bg: {},
    },
    chart: {},
    audio: {
        bgm: {},
    },
}
const spriteList = []
const spriteNameList = []
const notesList = []

const load = {
    count: 0,
    requiredCount: 0,

    completedMessage(name) {
        console.log(
            `%cLoading complete a asset: ${name} [${Math.floor((this.count / this.requiredCount) * 100)
            }%]`, "color:cyan;")
    },
    wait(eventName = "load_complete") {
        var loop = setInterval(() => {
            if (load.count == load.requiredCount) {
                clearInterval(loop)
                //ロード完了後の処理
                sendEvent(eventName)
            }
        }, 1000 / 60)
    },
    img(src, path, name) {
        const img = new Image()
        this.file(img, src, path, name)
    },
    audio(src, path, name, callback = () => { }) {
        const audio = new Audio(src)
        this.requiredCount++
        audio.addEventListener("canplaythrough", () => {
            path[name] = audio
            this.count++
            load.completedMessage(name)
            callback()
        })
    },
    file(obj, src, path, name) {
        this.requiredCount++
        obj.src = src
        obj.addEventListener("load", () => {
            path[name] = obj
            load.count++
            load.completedMessage(name)
        })
    },
    script(src) {
        this.requiredCount++
        const el = document.createElement("script")
        el.src = src
        document.body.append(el)
        el.addEventListener("load", () => {
            load.count++
            load.completedMessage(src)
        })
    },
    chartWaitingList: [],
    chartWaitingNumber: 0,
    chart(url) {
        const myNumber = this.chartWaitingNumber
        this.chartWaitingNumber++
        this.chartWaitingList.push(myNumber)

        var wait = setInterval(() => {
            if (this.chartWaitingList[0] == myNumber) {
                mainProcess()
                clearInterval(wait)
            }
        }, 1000 / 60)

        function mainProcess() {
            const scr = document.createElement('script');
            scr.src = url;
            document.body.prepend(scr)
            scr.addEventListener("load", () => {
                var data = tempChartData
                assets.chart[data.name] = data
                load.chartWaitingList.shift()
                sendEvent("loaded_chart", { name: data.name })
            })
        }
    },
    font(name = "keifont") {
        this.requiredCount++
        const element = document.querySelector("body")
        const computedStyle = window.getComputedStyle(element);
        const fontFamily = computedStyle.fontFamily;
        
        var loop = setInterval(()=>{
            if (fontFamily.includes(name)) {
                this.count++
                this.completedMessage(name)
                clearInterval(loop)                
              } else {}
        },1000/30)
    },
}

//ファイルの読み込みとか
//index.html視点のパス！！！
load.audio("assets/audio/sabitsuita_sekai.mp3", assets.audio.bgm, "sabitsuita_sekai")
load.script("js/front.js", assets.img.bg, "stage")
load.script("js/chart.js", assets.img.bg, "stage")
load.img("assets/img/stage.png", assets.img.bg, "stage")
load.img("assets/img/milkyway01.png", assets.img.bg, "bg1")
load.img("assets/img/milkyway06.png", assets.img.bg, "bg2")
load.img("assets/img/rhythmania.png", assets.img, "logo")
load.img("assets/img/press_enter.png", assets.img, "press_enter")
load.img("assets/img/ready.png", assets.img, "ready")
load.font("keifont")

load.wait("load_complete")

//キー入力とか

const touchKey = {
    s: false,
    d: false,
    f: false,
    g: false,
    h: false,
    j: false,
    k: false,
    l: false,
}
const holdKey = {
    s: false,
    d: false,
    f: false,
    g: false,
    h: false,
    j: false,
    k: false,
    l: false,
}

//イベントとか
window.addEventListener("load_complete", () => {
    load.count = 0
    load.requiredCount = 0
})

//モニターとか
const monitor = {
    el:{
        base:document.querySelector(".monitor"),
        create(id){
            var el = document.createElement("div")
            el.id = `monitor-${id}`
            this[id] = el
            this.base.append(this[id])
            monitor.update(id,"-")
        },
    },
    update(id,value="-"){
        this.el[id].innerHTML = `${id} : ${value}`
    },
}
monitor.el.create("fps")
monitor.el.create("time")

//FPSとか
const fpsObserver = {
    fps:0,
    beforeDate:0,
    count:0,
    measure(){
        this.count++
        var newDate = new Date().getTime()
        var diff = newDate - this.beforeDate
        var tempFps = 1000 / diff
        this.fps = Math.round(tempFps*10)/10
        this.beforeDate = newDate
        if(this.count % 30 == 0){
        monitor.update("fps",this.fps)
        }
    },
}