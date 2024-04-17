import { Shake } from "./DefineData";
import Watcher, { HexsnakeEvent } from "./Watcher";

const { ccclass, property } = cc._decorator;

@ccclass
export default class FollowCamera extends cc.Component {

    // @property({ type: cc.Node, tooltip: "追踪的节点" })
    target: cc.Node = null;

    @property({ tooltip: "相机移动平滑值" })
    smooth: number = 2;

    public static Ins: FollowCamera = null;
    onLoad() {
        FollowCamera.Ins = this;
    }

    pos(worldPos) {
        let target = this.node.parent.convertToNodeSpaceAR(worldPos);
        this.node.position = target;
    }

    start() {

        let camera = this.getComponent(cc.Camera);
        Watcher.addEventListener(HexsnakeEvent.FirstInteraction, this, () => {
            cc.tween(camera).to(1.0, { zoomRatio: 1.0 }, cc.easeBackOut()).start();
        });


        this.shakeAct = Shake.create(0.4, 14, 14);
        Watcher.addEventListener(HexsnakeEvent.CameraShake, this, this.shake);
    }



    shakeAct: Shake = null;
    shake() {
        if (this.node.getNumberOfRunningActions() > 0)
            this.node.stopAction(this.shakeAct);

        this.node.runAction(this.shakeAct);
    }


    next: cc.Vec2 = cc.v2();
    update(dt) {

        if (this.target) {

            
            let target = this.node.parent.convertToNodeSpaceAR(this.target.convertToWorldSpaceAR(cc.Vec2.ZERO));
            
            this.node.position.lerp(target, dt * this.smooth, this.next);
            this.node.position = this.next;
        }
    }
}
