// Learn TypeScript:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/typescript.html
//  - [English] http://www.cocos2d-x.org/docs/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/reference/attributes.html
//  - [English] http://www.cocos2d-x.org/docs/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/life-cycle-callbacks.html
//  - [English] http://www.cocos2d-x.org/docs/creator/manual/en/scripting/life-cycle-callbacks.html

import { Shake } from "./DefineData";
import Watcher, { HexsnakeEvent } from "./Watcher";

const { ccclass, property } = cc._decorator;

@ccclass
export default class FollowCamera extends cc.Component {

    @property({ type: cc.Node, tooltip: "追踪的节点" })
    target: cc.Node = null;

    @property({ tooltip: "相机移动平滑值" })
    smooth: number = 2;

    public static instance:FollowCamera = null;
    onLoad(){  
        FollowCamera.instance = this;
    }

    pos(worldPos){
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

        let target = this.node.parent.convertToNodeSpaceAR(this.target.convertToWorldSpaceAR(cc.Vec2.ZERO));

        this.node.position.lerp(target, dt * this.smooth, this.next);
        this.node.position = this.next;
    }
}
