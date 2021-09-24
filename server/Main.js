var SocketServer = require('./SocketServer')
var GamePlayer = require('./GamePlayer')
var Hexmap = require('./Hexmap')

let pServer = new SocketServer({ port: 9527 });
let pHexmap = new Hexmap();
let clients = []
let users = []


class Main {

    constructor() {
        const self = this
        let gid = 0;

        pHexmap.clients = clients;
        pServer.addEvent('login', async function (ws, data) {

            if ((data.name && users.indexOf(data.name) != -1) || !data.name) {

                //通知玩家登陆失败
                console.log(`>>>>>>存在相同昵称`);
                pServer.SEND(ws, 'login_result', {
                    fail: 1
                });
            }
            else {
                try {

                    let f = async () => {

                        //通知玩家登陆成功
                        let c = new GamePlayer(gid, data.name, ws);
                        //记录
                        ws.gamePlayer = c;
                        clients.push(c);

                        //获取出生位置
                        let pos = await pHexmap.getSpawnPoint(c);

                        //获取皮肤配置
                        let skinID = data.skinID || gid;
                        c.skinID = skinID % 7;

                        //已存在房间的玩家信息
                        let otherPlayer = [];
                        for (let t of clients) {
                            if (t === c) continue;
                            let p = t.newPkt();
                            otherPlayer.push(p);
                        }
                        //发送给玩家
                        c.SEND('login_result', {
                            fail: 0,
                            gid,
                            pos,
                            skinID,
                            otherPlayer
                        });

                        //广播给其它玩家
                        clients.length > 1 && setTimeout(() => {

                            let msg = {
                                gid: c.gid,
                                name: c.name,
                                skinID: c.skinID,
                                pos
                            };
                            for (let _ of clients) {
                                if (_ && _.valid && _ !== c) {
                                    _.SEND("new-player", msg);
                                }
                            }
                        }, 100);

                        ++gid;
                        users.push(data.name);

                        console.log(`new player join room, name: ${data.name}`);
                        //在玩家大于1时开启帧同步 
                        clients.length == 2 && self.syncBegin();
                    };
                    setTimeout(() => {
                        f();
                    }, 1);
                }
                catch (e) {
                    console.log(`data: ${data}\n fail info: ${e}`);
                }
            }


        })


        pServer.addEvent('close', function (ws, data) {
            //TODO 退出房间
            //从玩家列表移除
            //通知玩家 某玩家退出   gid

            try {

                let c = ws.gamePlayer;
                if (c) {

                    console.log(`player exit room: ${c.name}`);

                    //通知其它玩家
                    let msg = {
                        gid: c.gid
                    };
                    self.notifyOtherPlayer(c, "exit-room", msg);

                    self.release(c);

                    c = null;
                    ws.gamePlayer = null;
                }
                else {
                    console.log(ws);

                }
            }
            catch (e) {

                console.log(`close fail,Main.js 101, \n${e}`);
            }
        })

        pServer.addEvent('sync-data', function (ws, data) {
            let c = ws.gamePlayer;
            c.fief = data.fief;
            c.neck = data.neck;
            c.dir = data.dir;
            c.pos = data.pos;
        })

        pServer.addEvent('start-move', function (ws, data) {
            let c = ws.gamePlayer;
            c.speed = data.speed;
        })

        pServer.addEvent('move', function (ws, data) {
            let c = ws.gamePlayer;
            c.dir = data.dir;
        })


        pServer.addEvent('enc', function (ws, data) {

            let c = ws.gamePlayer;
            //更新格子数据
            c.neck = data.neck;
            c.fief = data.fief;
            c.pos = data.pos; //位置捎带同步一次

            //通告其它客户端
            let msg = c.newPkt();
            self.notifyOtherPlayer(c, "enc", msg);
        })


        pServer.addEvent('kill', function (ws, data) {
            let c = ws.gamePlayer;
            let target = data.gid;

            let msg = {
                killer: c.gid,
                target
            };
            //通知玩家可以去死了
            //通知其它玩家他现在是个死人了
            for (let _ of clients) {
                if (_.gid === target) {
                    _.SEND("death", msg);
                }
                else {
                    _.SEND("kill", msg);
                }
            }


            try {
                let i = users.indexOf(c.name);
                i != -1 && users.splice(i, 1);

                i = clients.findIndex((v) => {
                    if (v.gid === target) return true;
                })
                clients[i].valid = false;
                clients.splice(i, 1);
            }
            catch (e) {
                console.log(e);
            }
        })


        pServer.addEvent('wall', function (ws, data) {
            let c = ws.gamePlayer;
            let target = c.gid;
            let msg = {
                target,
                killer: -1
            };
            //通知玩家可以去死了
            //通知其它玩家他现在是个死人了
            for (let _ of clients) {
                if (_.gid == target) {
                    _.SEND("death", msg);
                }
                else {
                    _.SEND("kill", msg);
                }
            }
            self.release(c);
        })
    }

    release(c) {
        c.valid = false;

        let i = users.indexOf(c.name);
        i != -1 && users.splice(i, 1);

        i = clients.indexOf(c);
        i != -1 && clients.splice(i, 1);
    }

    //通知其它玩家
    notifyOtherPlayer(self, type, msg) {
        for (let _ of clients) {
            if (_ !== self) {
                _.SEND(type, msg);
            }
        }
    }

    _syncLock = false;
    syncBegin() {
        if (this._syncLock) return;
        this._syncLock = true;
        setInterval(this.frameSync.bind(this), 16.6667);
    }

    frameSync() {
        //通知所有客户端更新
        for (let c of clients) {
            c.frameSync(clients);
        }
    }
}


new Main()
