class KeywordInVideoDetail_VO {
    constructor(data){
        this.time = data.time;
        this.endOfTime = data.endOfTime;
        this.positions = data.positions.map(pos => ({
            id: pos.id,
            left: pos.left,
            top: pos.top,
            width: pos.width,
            height: pos.height,
        }))
    }
}

module.exports = KeywordInVideoDetail_VO;