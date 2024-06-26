
import { CCUtils } from "../Common/CCUtils";
import { C_SpriteFrame_Map } from "../Common/DefineData";
import Joystick from "../Common/Joystick";
import MulLanguge from "../Common/MulLanguge";
import { Toolkit } from "../Common/Toolkit";
import { EOrientation } from "../Common/ViewOrientation";
import Watcher, { HexsnakeEvent } from "../Common/Watcher";
import GameController from "./GameController";
import Move from "./Move";
import Player from "./Player";
import Splixio from "./Splixio";

const { ccclass, property } = cc._decorator;

@ccclass
export default class UIPanel extends cc.Component {

    @property({ type: Joystick })
    joystick: Joystick;

    @property(cc.Label)
    beKiller: cc.Label;
    @property(cc.Label)
    gameInfo: cc.Label;

    @property(cc.Node)
    killnotic: cc.Node;
    @property(cc.Label)
    killer: cc.Label;
    @property(cc.Label)
    target: cc.Label;

    @property(cc.Node)
    starPanel: cc.Node;
    @property(cc.Node)
    endPanel: cc.Node;
    @property(cc.Label)
    endInfo: cc.Label;

    @property(cc.Node)
    timerNode: cc.Node;
    @property(cc.Label)
    timerTip: cc.Label;


    @property(cc.Node)
    element: cc.Node;

    @property(cc.Node)
    re: cc.Node;

    @property(cc.Node)
    downlo: cc.Node;


    @property(cc.Node)
    newPlayerNode: cc.Node;
    @property(cc.Sprite)
    newPlayerSprite: cc.Sprite;
    @property(cc.Label)
    newPlayerLabel: cc.Label;

    onLoad() {

        const end_page = this.element;
        let pos = end_page.position;
        let size = end_page.scale;
        Watcher.addEventListener(Watcher.ON_VIEW_RESIZE, this, (mode: EOrientation) => {

            if (mode == EOrientation.LANDSCAPE) {
                end_page.scale = size * 0.8;
            }
            else {
                end_page.position = pos;
                end_page.scale = size;
            }
        });
    }

    start() {

        // this.player.getComponent(Move).enabled = false;
        this.node.on(cc.Node.EventType.TOUCH_START, this.firstInteraction, this);
        this.killnotic.active = false;

        //this.starPanel.active = true;  //改为加载完格子地图后出现
        //this.endPanel.active = false;
        // this.gameTimeTip.node.active = false;

        this.endPanel.active = false;
        this.timerNode.active = false;


        Watcher.addEventListener(HexsnakeEvent.Death, this, this.onSnakeDeath);
        Watcher.addEventListener(HexsnakeEvent.GameOverEvent, this, this.gameOver);

        let newPlayerNode = this.newPlayerNode;
        let configs = GameController.Ins.actorConfig;
        Watcher.addEventListener("newPlayerEnter", this, (gid, name) => {


            if (newPlayerNode.getNumberOfRunningActions() > 0)
                newPlayerNode.stopAllActions();
            newPlayerNode.x = -newPlayerNode.width;
            let config = configs[gid];
            this.newPlayerSprite.spriteFrame = config.avatar;
            this.newPlayerLabel.string = name;

            newPlayerNode.active = true;
            newPlayerNode.opacity = 0;
            cc.tween(newPlayerNode).
                to(0.4, { x: 20, opacity: 255 }, cc.easeBackOut()).
                delay(2).
                to(0.4, { x: -newPlayerNode.width }, cc.easeBackIn()).call(() => { newPlayerNode.active = false; }).start();
        });
    }


    gameOver() {

        // let splix = this.player.getComponent(Splixio);
        // splix.node.active = false;
        this.showEndPanel();
    }

    showEndPanel() {
        if (this.endPanel.active) return;

        this.endPanel.active = true;
        let src = this.element.scale;
        this.element.scale = -0.01;
        this.downlo.scale = -0.01;
        this.re.scale = -0.01;
        cc.tween(this.element).to(0.8, { scale: src }, cc.easeBackOut()).call(() => {

            cc.tween(this.downlo).to(0.5, { scale: 1.0 }, cc.easeBackOut()).start();
            cc.tween(this.re).to(0.5, { scale: 1.0 }, cc.easeBackOut()).start();

        }).start();
    }

    downloadEvent() {

        cc.director.loadScene("login");
       // Playable.INSTALL();
    }

    //蛇蛇死亡
    onSnakeDeath(splix: Splixio, beKiller: Splixio) {

        if (this.killnotic.getNumberOfRunningActions() > 0) {
            this.killnotic.stopAllActions();
        }
        else {
            this.killnotic.active = true;
        }

        this.killnotic.opacity = 255;
        this.target.string = splix.nickNode.name;
        this.killer.string = beKiller && beKiller.nickNode.name || "wall";
        cc.tween(this.killnotic).to(1.0, { opacity: 0 }).call(() => {
            this.killnotic.active = false;
        }).start();

        if (splix.isPlayer) {

            this.onPlayerDeath(splix, beKiller);
        }

    }

    onPlayerDeath(splix: Splixio, beKiller: Splixio) {

        GameController.playEffect("death");
        setTimeout(() => {
            GameController.playEffect("fuhuo");
        }, 400);

        //Playable.END();//试玩结束
        this.showEndPanel();
    }



    //第一次点击互动的时候
    firstInteraction(e: cc.Touch) {
        this.node.off(cc.Node.EventType.TOUCH_START, this.firstInteraction, this);

        //发送玩家首次互动事件
        Watcher.dispatch(HexsnakeEvent.FirstInteraction);
        // this.player.getComponent(Move).enabled = true;
        this.starPanel.removeFromParent();

        //注册摇杆事件
        let handler = CCUtils.RegistHandler(GameController.Ins.node, "GameController", "onJoystickEvent");
        this.joystick.onBegin.push(handler);
        this.joystick.onMove.push(handler);
        GameController.Ins.onJoystickEvent(cc.v2(0,1));
    }

    //_time = 0;
    // gameTimer() {

    //     // --this._time;
    //     // if (this._time <= 0) {
    //     //     this._time = 0;
    //     //     this.unschedule(this.gameTimer);
    //     //     this.gameOver();
    //     // }


    //     this.gameTimeTip.node.scale = 2.0;
    //     this.gameTimeTip.string = this._time.toString();
    //     cc.tween(this.gameTimeTip.node).to(0.8, { scale: 1.0 }, cc.easeBackOut()).start();

    //     if (this._time < 10) {
    //         this.timerTip.string = `00:0${this._time}`;
    //     }
    //     else if (this._time == 10) {
    //         this.timerNode.active = true;
    //         this.timerNode.opacity = 0;
    //         this.timerTip.string = "00:10";
    //         cc.tween(this.timerNode).to(0.4, { x: 0, opacity: 255 }, cc.easeBackOut()).start();
    //         GameController.playEffect("timer", true);
    //         this.gameTimeTip.node.color = cc.Color.RED;//后面逼我加的 =_= 感觉和游戏其它元素格格不入呢
    //     }

    // }


}
