

const { ccclass, property } = cc._decorator;

@ccclass
export default class DropCamera extends cc.Component {


    dir = cc.v2();
    actived = false;
    onLoad() {
        cc.systemEvent.on(cc.SystemEvent.EventType.KEY_UP, this.onKeyUp, this);
        cc.systemEvent.on(cc.SystemEvent.EventType.KEY_DOWN, this.onKeyDown, this);
    }

    onKeyUp(event) {

        switch (event.keyCode) {
            case cc.macro.KEY.a || cc.macro.KEY.left:
                this.dir.x = 0;
                break;
            case cc.macro.KEY.d || cc.macro.KEY.right:
                this.dir.x = 0;
                break;
            case cc.macro.KEY.w || cc.macro.KEY.up:
                this.dir.y = 0;
                break;
            case cc.macro.KEY.s || cc.macro.KEY.down:
                this.dir.y = 0;
                break;
        }

        this.actived = this.dir.mag() != 0;
    }

    onKeyDown(event) {

        this.actived = true;
        switch (event.keyCode) {
            case cc.macro.KEY.a || cc.macro.KEY.left || cc.macro.KEY.dpadLeft:
                this.dir.x = -1;
                break;
            case cc.macro.KEY.d || cc.macro.KEY.right || cc.macro.KEY.dpadRight:
                this.dir.x = 1;
                break;
            case cc.macro.KEY.w || cc.macro.KEY.up || cc.macro.KEY.dpadUp:
                this.dir.y = 1;
                break;
            case cc.macro.KEY.s || cc.macro.KEY.down || cc.macro.KEY.dpadDown:
                this.dir.y = -1;
                break;
        }
    }

    lateUpdate() {
        if (!this.actived) return;

        let dt = cc.director.getDeltaTime();
        this.node.x += this.dir.x * dt * 60;
        this.node.y += this.dir.y * dt * 60;
    }

    onDestroy() {
        cc.systemEvent.targetOff(this);
    }

}
