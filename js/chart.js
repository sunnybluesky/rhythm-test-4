class Note {
    id = null
    lane = null
    row = null
    type = {}
    x = 0
    y = 0
    time = null
    constructor(data) {
        // data -> [row,lane,type,id,time]
        this.row = data[0]
        this.lane = data[1]
        this.type = data[2]
        this.id = data[3]
        this.time = data[4]
    }
    update(sprite, cfp) {
        //cfp -> Chart Frame Properties


        var left = cfp.middleX - (cfp.laneWidth * (cfp.numberOfLane / 2 - 0.5))
        this.x = left + this.lane * cfp.laneWidth
        this.y = this.time - chart.playbackTime

        if (this.type.note) {
            sprite.width = cfp.laneWidth
            sprite.height = cfp.judgeZoneHeight
            if (this.y < -10 || this.type.base == "long-middle") {
                sprite.show = false
            } else {
                sprite.show = true
            }

            if (this.type.critical) {
                sprite.color = noteColor[1]
            } else {
                sprite.color = noteColor[0]
            }
            if (this.type.base.includes("long")) {
                sprite.color = noteColor[2]
            }

        }else{
            switch(this.type.base){
                case "bar-line":
                    //小節線
                    this.x = left + cfp.laneWidth * (cfp.numberOfLane-1)/2
                    sprite.height = 2
                    sprite.width = cfp.laneWidth * cfp.numberOfLane
                    sprite.color = cfp.color
                break;
            }
        }
    }
}

const noteColor = [
    "rgb(33, 159, 58)",
    "rgb(220, 210, 9)",
    "rgb(199, 104, 36)",
]


const chart = {
    load: {
        requied_count: 0,
        count: 0,
    },
    map_data: null,
    vertical_map: null,
    long_note_event: null,
    note_timing_list: [],
    audio_source: null,//音声ファイルのパス
    audio: null,//new Audio()タイプの音声
    playbackTime: 0,//再生時間
    isLoaded: false,//ロードされた？
    isAllowedDrawNotes: false,
    bpm: null,
    base_bpm: null,
    signature: 4,
    milli_seconds_list:[],
    init(c) {
        this.base_bpm = c.bpm
        this.signature = c.signature
        this.bpm = this.signature * this.base_bpm
        //bpm = 拍子 × baseBpm
        this.load.requied_count++
        this.audio_source = c.audio_src
        load.audio(this.audio_source, chart, "audio", () => { chart.load.count++ })
        this.map_data = c.map_data
        var temp = this.convert_chart_data(this.map_data)
        //[verticalMap,longNoteEvent]
        this.vertical_map = temp[0]
        this.long_note_event = temp[1]
        this.create_timing_list()
        this.create_notes()
        var wait = setInterval(() => {
            if (this.load.count == this.load.requied_count) {
                clearInterval(wait)
                this.isLoaded = true
            }
        }, 1000 / 60)
    },
    convert_chart_data(map) {
        let verticalMap = new Array(4)//縦マップ
        for (var i = 0; i < 4; i++) {
            verticalMap[i] = new Array(map.length)
        }
        for (var i = 0; i < 4; i++) {
            for (var j = 0; j < map.length; j++) {
                verticalMap[i][j] = map[j][i]
            }
        }

        //ロングノーツを変換
        var startPoint = 0
        var endPoint = 0
        var tempFlg = false
        var longNoteEvent = []
        for (var i = 0; i < 4; i++) {
            for (var j = 0; j < verticalMap[i].length; j++) {
                var value = verticalMap[i][j]
                if (tempFlg) {
                    if (value != 3) {
                        tempFlg = false
                        endPoint = j - 1
                        this.map_data[endPoint][i] = 5 //マップデータを上書き
                        verticalMap[i][endPoint] = 5
                        longNoteEvent.push([i, startPoint, endPoint])
                    }
                } else {
                    if (value == 3) {
                        tempFlg = true
                        startPoint = j
                        verticalMap[i][j] = 4
                        this.map_data[startPoint][i] = 4 //マップデータを上書き
                    }
                }
            }
        }
        return [verticalMap, longNoteEvent]
    },
    create_timing_list() {
        //note_timing_listを作成
        var list = []
        var map = this.map_data
        var count = 0
        let ms = 0
        const msList = []
        for (var i = 0; i < map.length; i++) {
            var bpm = this.bpm //テンポを設定(Eventとかで変更予定)
            ms += Math.floor((1000 * 60) / bpm)
            msList.push(ms)
            for (var j = 0; j < map[i].length; j++) {
                if (map[i][j] == 0) {
                    continue;
                }
                var type = {
                    note: true,
                    base: "normal",
                    critical: false,
                }
                switch (map[i][j]) {
                    case 1:
                        type.base = "normal"
                        break
                    case 2:
                        type.base = "normal"
                        type.critical = true
                        break
                    case 3:
                        type.base = "long-middle"
                        break;
                    case 4:
                        type.base = "long-start"
                        break;
                    case 5:
                        type.base = "long-end"
                        break;
                }
                list.push([i, j, type, count, ms])
                count++
            }
        }
        this.note_timing_list = list
        this.milli_seconds_list = msList
    },
    create_notes() {
        var list = this.note_timing_list
        const tempNotesList = []
        //data -> [rows,lane,type,id,ms]
        for (data of list) {
            tempNotesList.push(new Note(data))
        }
        var msList = this.milli_seconds_list

        //小節線を作成
        /*
        var type = {
            note:false,
            base:"bar-line",
            critical:false,
        }
        var length = Math.floor(this.map_data.length/4)
        for(var i=0;i<length;i++){
            var data = [length*4,0,type,null,msList[(i*4)]]
            tempNotesList.push(new Note(data))
        }
        */
        const number = []
        const index = []

        for(var i=0;i<tempNotesList.length;i++){
            number.push([tempNotesList[i].time,i])
        }
        console.log(number)

        //ms順にtempNotesListをnotesListに移しながら代入(?)
        for(var i=0;i<number.length;i++){
            var v = number[i]//number_i (笑)
            if(index.length == 0){
                index.push(v)
            }else{
                if(v[0] > index[index.length-1][0]){
                    index.push(v)
                    continue;
                }else{
                    for(var j=index.length-1;j>0;j--){
                        if(v[0] > index[j][0] ){
                            index.splice(j,0,v);
                            break;
                        }
                    }
                }
            }
        }
        for(var i=0;i<index.length;i++){
            notesList.push(tempNotesList[index[i][1]])
        }
        }
}

var tempName = "marshall_maximizer"
window.addEventListener("load_chart", () => {
    load.chart(`assets/chart/${tempName}.js`)
})
window.addEventListener("loaded_chart", () => {
    console.log(assets.chart[tempName])
    const loadedChart = assets.chart[tempName]
    chart.init(loadedChart)//譜面を初期化
    sendEvent("initialized_chart")
})

//キー入力とか
document.addEventListener("keydown", (e) => {
    if (touchKey[e.key] !== undefined) {
        if (!holdKey[e.key]) {
            touchKey[e.key] = true
        }
        setTimeout(() => {
            touchKey[e.key] = false
        }, 100)
        holdKey[e.key] = true
    }
})
document.addEventListener("keyup", (e) => {
    if (touchKey[e.key] !== undefined) {
        holdKey[e.key] = false
    }
})
window.addEventListener("finish_start_animation", () => {
    console.log("%cFinish animation!", "color:yellow")

    chart.audio.play()
    setInterval(() => {
        chart.playbackTime = Math.round(chart.audio.currentTime * 1000)
        monitor.update("time", `${Math.round(chart.playbackTime / 10) / 100}`)
    }, 1000 / fps)
})