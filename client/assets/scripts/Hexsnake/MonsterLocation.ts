import Watcher, { HexsnakeEvent } from "../Common/Watcher";

const { ccclass, property } = cc._decorator;



@ccclass
export default class MonsterLocation extends cc.Component {

    @property(cc.Node)
    player: cc.Node = null;

    @property(cc.Node)
    avatarLayer: cc.Node = null;

    @property(cc.Node)
    uiroot: cc.Node = null;

    @property(cc.SpriteFrame)
    arrowSpriteFrame: cc.SpriteFrame;
    arrows: cc.Node[] = [];

    @property(cc.Color)
    arrawColor: cc.Color = cc.Color.RED;

    halfSize: cc.Size = cc.size(0, 0);
    gameState = false;


    onLoad() {
        this.createArrow(10);
    }

    createArrow(count = 1) {
        for (let i = 0; i < count; i++) {
            let node = new cc.Node('arrow');
            node.addComponent(cc.Sprite).spriteFrame = this.arrowSpriteFrame;
            node.color = this.arrawColor;
            this.uiroot.addChild(node);
            node.active = false;
            this.arrows.push(node);
        }
    }


    onEnable() {

        const arrowHalfSize = 32 * 0.5;
        let pResizeFunc = function () {
            let winSize = cc.director.getWinSize();
            this.halfSize.width = winSize.width / 2 - arrowHalfSize;
            this.halfSize.height = winSize.height / 2 - arrowHalfSize;
        }
        Watcher.addEventListener(Watcher.ON_VIEW_RESIZE, this, pResizeFunc);
        pResizeFunc.apply(this);

        Watcher.addEventListener(HexsnakeEvent.FirstInteraction, this, () => {
            this.gameState = true;
        });
    }

    onDisable() {

        Watcher.removeAllListener(this);
    }


    update(dt) {

        if (!this.gameState || !this.player) return;

        const halfSize = this.halfSize;
        const actors = this.avatarLayer.children;
        let actor: cc.Node = null;
        let tempVec2: cc.Vec2 = cc.v2();
        let index = 0;
        for (let i = 0, len = actors.length; i < len; i++) {
            actor = actors[i];

            //不在视野内
            if (Math.abs(actor.x - this.player.x) > halfSize.width ||
                Math.abs(actor.y - this.player.y) > halfSize.height
            ) {

                //处理箭头
                let ar = this.arrows[index];
                if (null == ar) {
                    this.createArrow(len - index);
                    ar = this.arrows[index];
                }
                ++index;

                ar.active = true;
                actor.position.sub(this.player.position, tempVec2);

                ar.x = Math.min(Math.max(-halfSize.width, tempVec2.x), halfSize.width);
                ar.y = Math.min(Math.max(-halfSize.height, tempVec2.y), halfSize.height);

                ar.angle = Math.atan2(tempVec2.y, tempVec2.x) * 180 / Math.PI - 90;
            }

        }

        for (let i = index; i < this.arrows.length; i++)
            this.arrows[i].active = false;

    }
}
