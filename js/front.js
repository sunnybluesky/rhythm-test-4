const fps = 60;
let frameCount = 0

let idNumber = 0;
const maxNotes = 50 //ノーツの最大表示数

const scene = {
    screen: "loading",
    flg: false,
}

const chartFrameProps = {
    laneWidth: 0,
    baseLaneWidth: 150,//レーンの幅
    judgeLineHeight: 550,
    judgeZoneHeight: 50,
    //labelEachLane: ["s","d", "f","g","h","j", "k","l"],
    labelEachLane:["d","f","j","k"],
    numberOfLane: 4,
    baseColor:"rgb(11, 4, 40)",
    color:"rgba(0, 0, 0, 0)",
    middleX:canvas.width/2
}

class Sprite {
    show = true;
    x = 0
    y = 0
    id = null;
    scene = null
    name = null
    opacity = 1
    props = {}
    blur = 0
    constructor(data = {}) {
        this.id = idNumber
        this.name = data.name
        spriteNameList.push(this.name)
        idNumber++
        this.x = data.x
        this.y = data.y

        if (typeof data.scene !== "string") {
            data.scene = scene.screen
        }
        this.scene = data.scene
        this.type = data.type

        if (typeof data.size !== "number") {
            data.size = 1
        }
        this.size = data.size

        //typeごとの初期化処理
        switch (data.type) {
            case "img":
                this.img = data.img
                this.width = this.img.width * this.size
                this.height = this.img.height * this.size
                break;
            case "rect":
                if (data.color == undefined) {
                    data.color = "#000"
                }
                this.width = data.width * this.size
                this.height = data.height * this.size
                this.color = data.color
                break;
            case "blackout":
                this.speed = data.speed //秒
                this.opacity = 0


                this.openBlackout = function () {
                    if (this.props.progressingBlackout) {
                        return null;
                    }
                    this.opacity = 0
                    this.props.progressingBlackout = true
                    var loop = setInterval(() => {
                        this.opacity += ((this.speed) / fps)
                        if (this.opacity > 1) {
                            this.opacity = 1
                            this.props.progressingBlackout = false
                            clearInterval(loop);
                        }
                    }, 1000 / fps)
                }
                this.closeBlackout = function () {
                    if (this.props.progressingBlackout) {
                        return null;
                    }
                    this.opacity = 1
                    this.props.progressingBlackout = true
                    var loop = setInterval(() => {
                        this.opacity -= ((this.speed) / fps)
                        if (this.opacity < 0) {
                            this.opacity = 0
                            this.props.progressingBlackout = false
                            clearInterval(loop);
                        }
                    }, 1000 / fps)
                }
                break;
            case "import":
                if (typeof data.process !== "function") {
                    data.process = function () { }
                }
                this.process = data.process;
                this.processProps = data.processProps
                break;
            default:
                break;
        }

    }
    render() {
        ctx.filter = `blur(${this.blur}px)`
        //sceneが異なり、anyではないなら処理を中止
        if (this.scene !== "any") {
            if (this.scene !== scene.screen) {
                return null
            }
        }
        if (!this.show) {
            return null
        }
        switch (this.type) {
            case "img":
                draw.image(this.img, this.x, this.y, "center", this.size)
                break;
            case "rect":
                draw.rect(
                    (this.x - (this.width / 2)),
                    (this.y - (this.height / 2)),
                    (this.x + (this.width / 2)),
                    (this.y + (this.height / 2)),
                    this.color
                )
                break;
            case "blackout":
                draw.rect(0, 0, 1280, 720, `rgba(0,0,0,${this.opacity})`)
                break;
            case "import":
                this.process(this.processProps)
                break;
        }
    }
    hide() {
        this.show = false;
    }
    show() {
        this.show = true;
    }
    delete() {
        //スプライトを削除
        spriteManager.delete(this.name)
    }
}

const spriteManager = {
    find(name, arr = spriteList) {
        if (typeof name == "string") {
            var index = null
            for (var i = 0; i <= arr.length; i++) {
                var item = arr[i]
                if (item.name == name) {
                    index = i
                    break;
                }
            }
            if (index == null) {
                return false
            } else {
                return arr[index]
            }
        } else {
            return null;
        }
    },
    delete(name, list = spriteList) {
        var index = spriteNameList.indexOf(name)
        if (index == -1) {
            return false
        } else {
            list.splice(index, 1)
            spriteNameList.splice(index, 1)

            console.log(`%cSprite "${name}" was deleted.`, "color:red")
        }
    },
}

const draw = {
    rect(sx, sy, ex, ey, color = "#fff") {
        ctx.fillStyle = color
        ctx.fillRect(sx, sy, (ex - sx), (ey - sy))
    },
    image(img, x, y, type = "center", size = 1) {
        const w = img.width * size
        const h = img.height * size
        if (this.opacity !== undefined) {
            ctx.globalAlpha = this.opacity
        }
        switch (type) {
            case "center":
                ctx.drawImage(img, x - (w / 2), y - (h / 2), w, h)
                break;
            case "left":
                ctx.drawImage(img, x, y, w, h)
                break;
        }
        ctx.globalAlpha = 1

    },
    line(sx, sy, ex, ey, color = "#000") {
        ctx.strokeStyle = color
        ctx.beginPath();
        ctx.moveTo(sx, sy);
        ctx.lineTo(ex, ey);
        ctx.stroke();
    },
}



window.addEventListener("load_complete", () => {
    spriteManager.delete("loading_message")
    scene.screen = "title"

    spriteList.push(new Sprite(
        { name: "background_title", scene: "title", x: 640, y: 360, type: "img", img: assets.img.bg.bg1 }
    ))
    spriteList.push(new Sprite(
        { name: "title_logo", scene: "title", x: 640, y: 100, type: "img", img: assets.img.logo, size: 0.8, }
    ))
    spriteList.push(new Sprite(
        { name: "press_enter", scene: "title", x: 640, y: 600, type: "img", img: assets.img.press_enter, size: 0.4, opacity: 0.5 }
    ))
    spriteList.push(new Sprite(
        { name: "blackout", scene: "any", type: "blackout", speed: 3, }
    ))
    spriteList.push(new Sprite(
        {
            name:"press_enter_manager",scene: "title", type: "import", process: () => {
                spriteManager.find("press_enter").y = (Math.sin(frameCount / 80) * 40) + 600
            }
        }
    ))

    spriteManager.find("blackout").closeBlackout()
    document.addEventListener("keydown", (e) => {
        //エンターキーが押されて、sceneがtitleならsendEvent("main_screen")
        if (e.key == "Enter" && scene.screen == "title") {
            sceneChange("main_screen", function () {
                sendEvent("load_chart")
                var wait = setInterval(() => {
                    if (chart.isLoaded) {
                        sendEvent("main_screen")
                        scene.flg = true
                        clearInterval(wait)
                    }
                }, 1000 / fps)
            })
        }
    })
})

const chartRender = {
    //外部で呼び出されるのが前提のためthisは使用しないこと
    drawFrame() {
        const keyList = chartFrameProps.labelEachLane
        const width = chartFrameProps.laneWidth
        const length = chartFrameProps.labelEachLane.length
        const middleX = canvas.width / 2 //多分640
        const startX = middleX - width * length / 2
        const judgeLineY = chartFrameProps.judgeLineHeight
        const judgeZoneH = chartFrameProps.judgeZoneHeight
        ctx.lineWidth = 3;
        for (var i = 0; i <= length; i++) {
            var x = startX + width * i
            draw.line(x, 0, x, 720, chartFrameProps.color)
        }
        var y = judgeLineY - judgeZoneH / 2
        draw.line(startX, y, startX + width * length, y,chartFrameProps.color)
        y += judgeZoneH
        draw.line(startX, y, startX + width * length, y,chartFrameProps.color)

        for (var i = 0; i < length; i++) {
            var x = startX + width * i
            var c = "rgba(0,0,0,0)" // color
            if (touchKey[keyList[i]]) {
                c = "rgba(100, 222, 255, 0.78)"
            } else if (holdKey[keyList[i]]) {
                c = "rgba(100, 221, 255, 0.43)"
            }
            draw.rect(
                startX + width * i, judgeLineY - (judgeZoneH / 2),
                startX + width * (i + 1), judgeLineY + (judgeZoneH / 2), c
            )
        }
    },

    props: {},

    mainProcess(props = {}) {
        this.props = props
        chartRender.drawFrame()
    },
}

window.addEventListener("main_screen", () => {
    spriteList.unshift(new Sprite(
        { name: "background_main", scene: "main_screen", x: 640, y: 360,
         type: "img", img: assets.img.bg.bg2 }
    ))
})

function sceneChange(sceneName, callback) {
    if (typeof callback !== "function") {
        callback = function () {
            scene.flg = true
        }
    }
    var s = spriteManager.find("blackout")
    s.openBlackout()
    scene.flg = false
    setTimeout(() => {
        callback()
        var wait = setInterval(() => {
            if (scene.flg) {
                scene.flg = true
                spriteManager.find("blackout").closeBlackout()
                scene.screen = sceneName
                clearInterval(wait)
            }
        }, 1000 / fps)
    }, (1000 / s.speed) + 30)

}

setInterval(() => {
    frameCount++
    // canvas.style.height = `${innerHeight-5}px`
    drawNote()


    ctx.clearRect(0, 0, 1280, 720)
    for (var sprite of spriteList) {
        sprite.render() //れんだー！
    }
    fpsObserver.measure()//FPSを記録
}, 1000 / fps * 2)

function drawNote(){
    if(chart.isAllowedDrawNotes){
        let deleteCounter = 0
        for(var i=0;i<maxNotes;i++){
            if(notesList[i] == undefined){
            var sprite = spriteManager.find(`note-${i}`)
            sprite.show = false
            break;
            }
            var sprite = spriteManager.find(`note-${i}`)
            var note = notesList[i]
            note.update(sprite,chartFrameProps)
            if(note.y < -100){
                deleteCounter++
            }


            sprite.x = note.x
            sprite.y = 720 - note.y
        }
        for(var i=0;i<deleteCounter;i++){
            notesList.splice(0,1)
        }
    }
}
//ロード画面のメッセージを表示するスプライト
spriteList.push(new Sprite(
    {
        name: "loading_message", scene: "loading", type: "import",
        process: (p) => {
            var props = p
            ctx.font = "20px sans serif"
            ctx.fillStyle = "#fff"
            var num = props.getNum()
            ctx.fillText(`${props.message} (${num}%)`, 0, 700)
        }, processProps: {
            message: "ゲームデータを読み込んでいます...",
            getNum: () => { return Math.round((load.count / load.requiredCount) * 100) },
        },
    }))

window.addEventListener("initialized_chart", () => {
    spriteManager.delete("press_enter_manager")
    spriteManager.delete("press_enter")
    spriteManager.delete("title_logo")
    spriteManager.delete("background_title")
    console.log("%cInitialized chart!","color:yellow")

    var animation1 = function(){
        spriteList.push(new Sprite(
            {name:"ready",scene:"main_screen",x:99999,y:360,type:"img",img:assets.img.ready}
        ))
        const ready = spriteManager.find("ready")
        var count = 0
        var finishCount = 60
        var loop = setInterval(()=>{
            count++
            var blurLevel = 0
            if(count < 15){
                blurLevel = count
            }else if(count > finishCount*2){
                blurLevel = count > finishCount*2+15 ? 0 : finishCount*2+15 - count 
            }else{
                blurLevel = 15
            }
            spriteManager.find("background_main").blur = blurLevel
            if(count < finishCount){
                var n = 640 / getArcTan(count)/1.01
                ready.x = n
            }else{
                var tempCount = count > finishCount*2 ? finishCount*2 : count
                var n = 640-((640 / getArcTan(finishCount*2 - tempCount)/1.01)-640)
                ready.x = n
            }

            if(count > finishCount*2+16){
                clearInterval(loop)
                animation2()//アニメーション2を実行
            }
        },1000/fps)
    }
    setTimeout(animation1,500)//アニメーション1を0.5秒遅れで実行
    function animation2(){
        spriteList.push(new Sprite({name:"chartRender",scene:"main_screen",type:"import",
            process:chartRender.mainProcess,processProps:{},
        }))
        var count = 0
        const tempColor = chartFrameProps.baseColor.split("(")[1].split(")")[0]
        const tempWidth = chartFrameProps.baseLaneWidth
        // "rgb(0,100,200)" -> "0,100,200" の形に文字列処理
        var loop = setInterval(()=>{
            count++
            var opacity = count<20 ? count/20 : 1
            chartFrameProps.color = `rgba(${tempColor},${(opacity)})`
            chartFrameProps.laneWidth = tempWidth * getArcTan(count,60)
            
            if(count > 60){
            chartFrameProps.laneWidth = tempWidth
            chartFrameProps.color = `rgba(${tempColor},1)`
                clearInterval(loop)
                sendEvent("finish_start_animation")
            }
        },1000/fps)
    }
})
window.addEventListener("finish_start_animation",()=>{
    spriteManager.delete("ready")
    //ノーツ表示用のノーツを作成
for(var i=0;i<maxNotes;i++){
    spriteList.push(new Sprite({
        name:`note-${i}`,scene:"main_screen",type:"rect",
        x:0,y:0,width:0,height:0,color:"#000",
    }))
}
chart.isAllowedDrawNotes=true

})

function getArcTan(n,max){
    var v = Math.atan(n) / (Math.PI / 2)
    if(typeof max == "number"){
        max = Math.atan(max) / (Math.PI / 2)
        v = v / max
    }
    return v
}