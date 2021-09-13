import { Toolkit } from "../Common/Toolkit";
import Watcher, { HexsnakeEvent } from "../Common/Watcher";
import Move from "./Move";
import Splixio from "./Splixio";

const { ccclass, property } = cc._decorator;

@ccclass
export default class AI extends cc.Component {

    move: Move;
    splix: Splixio;

    onLoad() {
        this.move = this.node.getComponent(Move);
        this.splix = this.node.getComponent(Splixio);

        

        Watcher.addEventListener(HexsnakeEvent.SortRank, this, this.resetWeight);
    }

    resetWeight(caller: Splixio) {
        if (caller === this.splix) this.goHomeWeight = 0;
    }




    tm: number = 0;
    dur: number = 1;//阶段性动作持续时长
    goHomeWeight: number = 0;//回家的诱惑
    update(dt) {

        this.tm += dt;
        if (this.tm >= this.dur) {
            this.tm = 0;
            this.dur = Toolkit.RandomFloat(3, 0.3);


            ++this.goHomeWeight;
            let randDir = (Math.random() + 0.1) * this.goHomeWeight < 0.44;
            if (randDir) {
                this.move.dir.x = Toolkit.RandomFloat(-1, 1);
                this.move.dir.y = Toolkit.RandomFloat(-1, 1);
            }
            else {
                let dir = this.getHomeDir().subSelf(this.node.position);
                this.move.dir = dir;
            }

            this.move.dir.normalizeSelf();
        }
    }



    //往回走
    getHomeDir() {

        let target = this.splix.realFullNode[Toolkit.RandomInt(0, this.splix.realFullNode.length)] || this.splix.preFullNode[0];

        return (target && target.node.position) || cc.v2();
    }

}
