console.log("running chart.js")
const chart = {
    map_data:null,
    vertical_map:null,
    long_note_event:null,
    note_timing_list:[],
        
    init(c){
        this.map_data = c.map_data
        var temp = this.convert_chart_data(this.map_data)
        //[verticalMap,longNoteEvent]
        this.vertical_map = temp[0] 
        this.long_note_event = temp[1]
        this.createTimingList()
    },
    convert_chart_data(map){
        let verticalMap = new Array(4)//縦マップ
        for(var i=0;i<4;i++){
            verticalMap[i] = new Array(map.length)
        }
        for(var i=0;i<4;i++){
            for(var j=0;j<map.length;j++){
                verticalMap[i][j] = map[j][i]
            }
        }
    
        //ロングノーツを変換
        var startPoint = 0
        var endPoint = 0
        var tempFlg = false
        var longNoteEvent = []
        for(var i=0;i<4;i++){
            for(var j=0;j<verticalMap[i].length;j++){
                var value = verticalMap[i][j]
                if(tempFlg){
                    if(value != 3){
                        tempFlg = false
                        endPoint = j-1
                        verticalMap[i][endPoint] = 4
                        longNoteEvent.push([i,startPoint,endPoint])
                    }
                }else{
                    if(value == 3){
                        tempFlg = true
                        startPoint = j
                        verticalMap[i][j] = 4
                    }
                }
            }
        }
        return [verticalMap,longNoteEvent]
    },
    createTimingList(){
        //note_timing_listを作成
        var list = []
        var map = this.vertical_map
        console.log(this.long_note_event)        
    },
}   

var tempName = "marshall_maximizer"
window.addEventListener("main_screen", () => {
    load.chart(`assets/chart/${tempName}.js`)
})
window.addEventListener("loaded_chart",()=>{
    console.log(assets.chart[tempName])
    const loadedChart = assets.chart[tempName]
    chart.init(loadedChart)
})

//キー入力とか
document.addEventListener("keydown",(e)=>{
    if(touchKey[e.key] !== undefined){
        if(!holdKey[e.key]){
        touchKey[e.key] = true
        }
        setTimeout(()=>{
            touchKey[e.key] = false
        },100)
        holdKey[e.key] = true
    }
})
document.addEventListener("keyup",(e)=>{
    if(touchKey[e.key] !== undefined){
        holdKey[e.key] = false
    }
})