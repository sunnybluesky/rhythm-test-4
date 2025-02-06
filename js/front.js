console.log("running front.js")

const fps = 60;
let frameCount = 0

let idNumber = 0;

const scene = {
    screen: "loading",
    flg:false,
}

const chartFrameProps = {
    laneWidth:150,
    judgeLineHeight:550,
    judgeZoneHeight:50,
    numberOfLane:4,
    LabelEachLane:["d","f","j","k"],

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
    constructor(data = {}) {
        this.id = idNumber
        this.name = data.name
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
                    if(this.props.progressingBlackout){
                        return null;
                    }
                    this.opacity = 0
                    this.props.progressingBlackout = true
                    var loop = setInterval(()=>{
                        this.opacity += ((this.speed)/fps)
                        if(this.opacity > 1){
                            this.opacity = 1
                    this.props.progressingBlackout = false
                    clearInterval(loop);
                        }
                    },1000/fps)
                }
                this.closeBlackout = function () {
                    if(this.props.progressingBlackout){
                        return null;
                    }
                    this.opacity = 1
                    this.props.progressingBlackout = true
                    var loop = setInterval(()=>{
                        this.opacity -= ((this.speed)/fps)
                        if(this.opacity < 0){
                            this.opacity = 0
                    this.props.progressingBlackout = false
                    clearInterval(loop);
                        }
                    },1000/fps)
                }
            break;
            case "import":
                if (typeof data.process !== "function") {
                    data.process = function(){}
                }
                this.process = data.process;
                this.processProps = data.processProps
            break;
            default:
            break;
        }

    }
    render() {
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
    delete(arr = spriteList) {
        //スプライトを削除
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
}

const draw = {
    rect(sx, sy, ex, ey, color = "#fff") {
        ctx.fillStyle = color
        ctx.fillRect(sx, sy, (ex - sx), (ey - sy))
    },
    image(img, x, y, type = "center", size = 1) {
        const w = img.width * size
        const h = img.height * size
        if(this.opacity !== undefined){
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
    line(sx,sy,ex,ey,color="#000"){
        ctx.strokeStyle = color
        ctx.beginPath();
        ctx.moveTo(sx, sy);
        ctx.lineTo(ex, ey);
        ctx.stroke();
    },
}



window.addEventListener("load_complete", () => {
    scene.screen = "title"

    spriteList.push(new Sprite(
        { name: "background", scene: "title", x: 640, y: 360, type: "img", img: assets.img.bg.bg1 }
    ))
    spriteList.push(new Sprite(
        { name: "title_logo", scene: "title", x: 640, y: 100, type: "img", img: assets.img.logo, size: 0.8, }
    ))
    spriteList.push(new Sprite(
        { name: "press_enter", scene: "title", x: 640, y: 600, type: "img", img: assets.img.press_enter, size: 0.4, opacity:0.5}
    ))
    spriteList.push(new Sprite(
        { name: "blackout", scene: "any", type: "blackout" , speed:3,}
    ))
    spriteList.push(new Sprite(
        {scene:"title",type:"import",process:()=>{
            spriteManager.find("press_enter").y = (Math.sin(frameCount/80)*40) + 600
        }}
    ))

    spriteManager.find("blackout").closeBlackout()
    document.addEventListener("keydown",(e)=>{
        //エンターキーが押されて、sceneがtitleならsendEvent("main_screen")
        if(e.key == "Enter" && scene.screen == "title"){
            sceneChange("main_screen",function(){
                sendEvent("main_screen")
                scene.flg = true
            })
        }
    })
})

const chartRender = {
    //外部で呼び出されるのが前提のためthisは使用しないこと
    drawFrame(){
        const keyList = ["d","f","j","k"]
        const width = chartFrameProps.laneWidth
        const length = chartFrameProps.LabelEachLane.length
        const middleX = canvas.width/2 //多分640
        const startX = middleX - width * length / 2
        const judgeLineY = chartFrameProps.judgeLineHeight 
        const judgeZoneH = chartFrameProps.judgeZoneHeight
        ctx.lineWidth = 3;
        for(var i=0;i<=length;i++){
            var x = startX + width * i
            draw.line(x,0,x,720,"#000")
        }
        var y = judgeLineY - judgeZoneH / 2
        draw.line(startX,y,startX+width*length,y)
        y += judgeZoneH
        draw.line(startX,y,startX+width*length,y)

        for(var i=0;i<length;i++){
            var x = startX + width * i
            var c = "rgba(0,0,0,0)" // color
            if(touchKey[keyList[i]]){
                c = "rgba(100, 222, 255, 0.78)"
            }else if(holdKey[keyList[i]]){
                c = "rgba(100, 221, 255, 0.43)"
            }
            draw.rect(
                startX + width*i ,judgeLineY - (judgeZoneH/2),
                startX + width*(i+1),judgeLineY + (judgeZoneH/2),c
            )
        }
    },

    props:{},

    mainProcess(props={}){
        this.props = props
        chartRender.drawFrame()
    },
}

window.addEventListener("main_screen", () => {
    spriteList.unshift(new Sprite(
        { name: "background", scene: "main_screen", x: 640, y: 360, type: "img", img: assets.img.bg.bg2 }
    ))

    spriteList.push(new Sprite(
        { name: "test", scene: "any", type: "import" , 
            process:chartRender.mainProcess,processProps:{},
        }))
})



const spriteList = []

function sceneChange(sceneName,callback){
    if(typeof callback !== "function"){
        callback = function(){
            scene.flg = true
        }
    }
    var s = spriteManager.find("blackout")
    s.openBlackout()
    scene.flg = false
    setTimeout(()=>{
        callback()
        var wait = setInterval(()=>{
            if(scene.flg){
                scene.flg = true
                spriteManager.find("blackout").closeBlackout()
                scene.screen = sceneName
                clearInterval(wait)
            }
        },1000/fps)
    },(1000 / s.speed)+30)

}

setInterval(() => {
    frameCount++
    // canvas.style.height = `${innerHeight-5}px`
    ctx.clearRect(0, 0, 1280, 720)
    for (var sprite of spriteList) {
        sprite.render() //れんだー！
    }
}, 1000 / fps)

//ロード画面のメッセージを表示するスプライト
spriteList.push(new Sprite(
    { name: "loading_message", scene: "loading", type: "import" , 
        process:()=>{
            ctx.font = "20px sans serif"
            ctx.fillStyle = "#fff"
            ctx.fillText(`ゲームデータを読み込んでいます... (${
                Math.round((load.count/load.requiredCount)*100)
            }%)`,0,700)
        },processProps:{},
    }))