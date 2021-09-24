const WebSocketServer = require('ws').Server;


// const heartbeat = JSON.stringify({
//     type:"heart-beat"
// })

class SocketServer {
   
    constructor(cfg) {
        this.events = {};
        this.clients = [];
        this.wss = new WebSocketServer(cfg);
        console.log('>>>>>>SocketServer is listener:', cfg.port);
        this.wss.on('connection', this.onNewClient.bind(this))
    }
    
    onNewClient(ws) {
        ws.on('message', this.onReceive.bind(this, ws))
        ws.on('close', this.onClose.bind(this, ws));
        ws.on('error', this.onClose.bind(this, ws))
        this.clients.push(ws);

        console.log(">>>>>>新客户端连接成功");
    }

    onReceive(ws, message) {
        try {
            var d = JSON.parse(message);
            d && this.dispatch(d.type, ws, d)
        } catch (e) {
            console.log(e);
        }
    }
    dispatch(t, ws, d) {
        let a = this.events[t];
        if (a != null) {
            try {
                for (var i = 0; i < a.length; i++) {
                    a[i](ws, d);
                }
            } catch (e) {
                console.error('socket server dispatch ', d, e)
            }
        } else {
            console.log('未处理的消息:', t, d);
        }
    }
    onClose(ws) {
        var idx = this.clients.indexOf(ws);
        this.clients.splice(idx, 1);
        this.dispatch('close', ws);
    }
    addEvent(key, cb) {

        if (this.events[key]) {
            this.events[key].push(cb);
        } else {
            this.events[key] = [cb];
        }
    }

    //公用
    SEND(ws, type, obj) {
        
        obj.type = type;
        ws.send(JSON.stringify(obj));
    }
}
module.exports = SocketServer