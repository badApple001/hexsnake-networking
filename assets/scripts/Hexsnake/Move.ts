
const { ccclass, property } = cc._decorator;

@ccclass
export default class Move extends cc.Component {



    @property({ type: cc.Vec2, tooltip: "方向" })
    dir = cc.v2(0, 1);

    @property({ tooltip: "速度" })
    speed = 60;


    @property({ tooltip: "转角平滑度" })
    smooth = 2;


    _dir: cc.Vec2 = null;

    setDirImmediately( dir:cc.Vec2){
        this._dir = dir;
        this.dir = dir.clone();   
    }

    start() {

        this._dir = this.dir.clone();
    }

    update(dt: number) {

        //平滑转角
        this._dir.lerp(this.dir, dt * this.smooth, this._dir);
        this._dir.normalizeSelf();

        //移动
        this.node.x += dt * this.speed * this._dir.x;
        this.node.y += dt * this.speed * this._dir.y;

        //转角
        this.node.angle = -90 + Math.atan2(this._dir.y, this._dir.x) * 180 / Math.PI;
    }


}
