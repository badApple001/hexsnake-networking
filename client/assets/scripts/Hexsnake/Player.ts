import Move from "./Move";
import Splixio from "./Splixio";

const { ccclass, property } = cc._decorator;

@ccclass
export default class Player extends cc.Component {


    @property({ type: Move })
    move: Move;

    deltaXY = cc.v2();
    start() {
        this.deltaXY = this.move.dir;
    }

    onFollowTarget(target: cc.Vec2) {
        target.normalize(this.deltaXY);
        let dir = this.deltaXY.normalize();

        this.move.setDir(dir);
    }


    splix: Splixio = null;
    awake() {
        this.splix = this.getComponent(Splixio);
    }


    tm = 0;
    update(dt) {
        this.tm += dt;
        if (this.tm >= 0.1) {
            this.tm -= 0.1;
            this.syncGrid();
        }
    }

    //封包简化
    newPkt() {

        let neck = [];
        for (let t of this.splix.preFullNode) {
            let item: any = {};
            item.x = t._xIndex;
            item.y = t._yIndex;
            neck.push(item);
        }
        let fief = [];
        for (let t of this.splix.realFullNode) {
            let item: any = {};
            item.x = t._xIndex;
            item.y = t._yIndex;
            fief.push(item);
        }
        let msg = {
            neck,
            fief
        };
        return msg;
    }


    lastTime = 0;
    notifyGrid() {
        let now = cc.director.getTotalTime();
        if(this.lastTime - now < 200)
            return;
        this.lastTime = now;

        let msg = this.newPkt();
        msg['pos'] = this.node.position;
        this.move.SEND("enc", msg);
    }

    syncGrid() {
        let msg = this.newPkt();
        msg['pos'] = this.node.position;
        msg['dir'] = this.move.dir;
        this.move.SEND("sync-data", msg);
    }

}
