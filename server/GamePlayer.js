const WebSocket = require("ws");

fspkt = {};
fspkt.actions = {};

class GamePlayer {

    gid = -1;//用户唯一标识符
    name = '';//用户昵称
    ws = null;//websocket
    skinID = 0;//皮肤配置id
    valid = false;
    pos = {};
    dir = { x: 0, y: 1 }
    fief = [];
    neck = [];
    speed = 0;
    constructor(gid, name, ws) {
        this.gid = gid;
        this.name = name;
        this.ws = ws;
        this.valid = true;
    }


    newPkt() {
        let p = {
            gid: this.gid,
            name: this.name,
            skinID: this.skinID,
            pos: this.pos,
            dir: this.dir,
            neck: this.neck,
            fief: this.fief,
            speed: this.speed
        };
        return p;
    }

    
    
    async frameSync( clients ) {
        
        for(let c of clients){
            fspkt.actions[c.gid] = {
                dir : c.dir,
                speed : c.speed
            }
        }

        this.SEND('f',fspkt);
    }

    //独立
    SEND(type, obj) {
        obj.type = type;
        this.ws.send(JSON.stringify(obj));
    }
}




module.exports = GamePlayer