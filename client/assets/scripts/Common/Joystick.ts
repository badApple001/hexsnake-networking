
const { ccclass, property } = cc._decorator;

@ccclass
export default class Joystick extends cc.Component {


    @property({ type: [cc.Component.EventHandler], displayName: "摇杆开始事件" })
    onBegin: cc.Component.EventHandler[] = [];

    @property({ type: [cc.Component.EventHandler], displayName: "遥杆滑动事件" })
    onMove: cc.Component.EventHandler[] = [];

    @property({ type: [cc.Component.EventHandler], displayName: "遥杆结束事件" })
    onEnd: cc.Component.EventHandler[] = [];

    @property(cc.Node)
    joystick: cc.Node;

    @property(cc.Node)
    joypoint: cc.Node;

    start() {

        this.joystick.active = false;
        this.node.on(cc.Node.EventType.TOUCH_START, this.onTouchBegin, this);
        this.node.on(cc.Node.EventType.TOUCH_MOVE, this.onTouchMove, this);
        this.node.on(cc.Node.EventType.TOUCH_END, this.onTouchEnd, this);
    }

    onTouchBegin(e: cc.Touch) {
        this.joystick.active = true;
        this.joystick.position = this.joystick.parent.convertToNodeSpaceAR(e.getLocation());

        //派发
        cc.Component.EventHandler.emitEvents(this.onBegin, e.getLocation());
    }

    onTouchMove(e: cc.Touch) {

        let delta = this.joystick.convertToNodeSpaceAR(e.getLocation());
        let dir = delta.normalize();
        this.joypoint.position = dir.mulSelf(Math.min(60, delta.mag()));

        //派发
        cc.Component.EventHandler.emitEvents(this.onMove, dir);
    }

    onTouchEnd(e: cc.Touch) {
        this.joystick.active = false;
        this.joypoint.position = cc.v2();

        //派发
        cc.Component.EventHandler.emitEvents(this.onEnd, e.getLocation());
    }
}
