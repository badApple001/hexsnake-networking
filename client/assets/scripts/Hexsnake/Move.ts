const { ccclass, property } = cc._decorator;

@ccclass
export default class Move extends cc.Component {


    @property({ type: cc.Vec2, tooltip: "方向" })
    dir = cc.v2(0, 1);
    _dir = cc.v2(0, 1);

    @property({ tooltip: "速度" })
    speed = 300;
    _speed = 0;


    @property({ tooltip: "转角平滑度" })
    smooth = 2;


    // setDir(dir: cc.Vec2) {
    //     this.SEND("move", { dir });
    // }

    // startMove() {
    //     this.SEND("start-move", {
    //         speed: this.speed
    //     });
    // }

    update(dt) {

        // this._dir.lerp(this.dir, this.smooth * dt, this._dir);
        // this._dir.normalizeSelf();

        // //移动
        // this.node.x += dt * this._speed * this._dir.x;
        // this.node.y += dt * this._speed * this._dir.y;

        // //转角
        // this.node.angle = -90 + Math.atan2(this._dir.y, this._dir.x) * 180 / Math.PI;
    }


    // frameSync(data: { dir: cc.Vec2, speed: number }) {

    //     this.dir.x = data.dir.x;
    //     this.dir.y = data.dir.y;
    //     this._speed = data.speed;
    // }

}
