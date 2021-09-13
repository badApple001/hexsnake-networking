import Move from "./Move";

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
        this.move.dir = this.deltaXY.normalize();
    }

}
