import FollowCamera from "../Common/FollowCamera";
import MulLanguge from "../Common/MulLanguge";
import Watcher, { HexsnakeEvent } from "../Common/Watcher";
import GameManager from "../TRPC/GameManager";
import { gameConfig } from "../TRPC/shared/game/gameConfig";
import AvatarContrl from "./AvatarContrl";
import MonsterLocation from "./MonsterLocation";
import Player from "./Player";

const { ccclass, property } = cc._decorator;


@ccclass("ActorInfo")
export class ActorInfo {
    @property({ type: cc.SpriteFrame, tooltip: "头像" })
    public avatar: cc.SpriteFrame = null;

    @property({ type: cc.SpriteFrame, tooltip: "格子图" })
    public grid: cc.SpriteFrame = null;

    @property({ type: cc.Prefab, tooltip: "拖尾预设 可以挂一些粒子效果" })
    public tailPrefab: cc.Prefab = null;

    @property({ type: cc.Color, tooltip: "拖尾填充色" })
    public tailColor: cc.Color = cc.color();

}


@ccclass
export default class GameController extends cc.Component {


    @property({ type: [cc.AudioClip], tooltip: "音效资源" })
    audioCache: cc.AudioClip[] = [];

    @property({ type: [ActorInfo] })
    actorConfig: ActorInfo[] = [];

    @property(cc.Node)
    busyUI: cc.Node;
    @property(cc.Label)
    tip: cc.Label;
    @property(cc.Label)
    progress: cc.Label;


    @property(cc.Label)
    kill: cc.Label;


    @property(cc.Node)
    killAniNode: cc.Node;
    @property(cc.Animation)
    killAni: cc.Animation;
    @property(cc.Label)
    killTip: cc.Label;

    @property(cc.Node)
    starPanel: cc.Node;

    @property
    gameTime = 25;

    @property({ type: [cc.Sprite] })
    loadIcons: cc.Sprite[] = [];
    @property({ type: [cc.SpriteFrame] })
    loadSps: cc.SpriteFrame[] = [];

    @property(cc.AudioSource)
    stepAudioSource: cc.AudioSource;

    @property(cc.Node)
    playerRoot: cc.Node;


    @property(MonsterLocation)
    ml:MonsterLocation;

    private playerEntitys: Map<number, Player> = new Map<number, Player>();
    private selfSpeed: cc.Vec2 = new cc.Vec2(0, 0);


    refreshKill(count: number) {
        this.kill.string = `x${count}`;

        this.killAniNode.active = true;
        this.killAni.play("liansha");

        this.killTip.node.scale = 1.0;
        if (count == 1) {
            this.killTip.string = "First Blood";
        }
        else if (count == 2) {
            this.killTip.string = "double kill";
        }
        else if (count == 3) {
            this.killTip.string = "triple kill";
        }
        else if (count == 4) {
            this.killTip.string = "Super god";
        }
        else {
            this.killTip.string = "God of war came";
        }

        if (this.killTip.node.getNumberOfRunningActions() > 0)
            this.killTip.node.stopAllActions();
        cc.tween(this.killTip.node).to(0.7, { scale: 0 }).call(() => {
            this.killAniNode.active = false;
        }).start();

        //相机振动
        Watcher.dispatch(HexsnakeEvent.CameraShake);

        // if (count >= this.maxKillCount) {
        //     Watcher.dispatch(HexsnakeEvent.GameOverEvent);
        // }
    }

    maxKillCount = 0;
    public static Ins: GameController = null;
    onLoad() {
        GameController.Ins = this;


        let manager = cc.director.getCollisionManager();
        manager.enabled = true;
        //manager.enabledDebugDraw = CC_DEBUG;
        //manager.enabledDrawBoundingBox = CC_DEBUG;

        this.killAniNode.active = false;

        this.maxKillCount = window['maxKillCount'] || 2;
        this.gameTime = window['gameTime'] || this.gameTime;
    }



    audioDict: { [k: string]: cc.AudioClip } = {};
    start() {

        for (let clip of this.audioCache) {
            this.audioDict[clip.name] = clip;
        }



        this.busyUI.active = true;
        this.starPanel.active = false;



        // let canvas = cc.Canvas.instance;
        // let labels = canvas.getComponentsInChildren(cc.Label);
        // let content = "";
        // for (let l of labels) {
        //     content += l.string;
        // }
        // alert(content);
        // console.log(content);
    }

    mulLange_tmpStr = ''
    l = 1;
    public mapLoadProgress(added: number, sum: number, loaded: boolean) {


        if (this.mulLange_tmpStr === '' && MulLanguge._mulData) this.mulLange_tmpStr = `${MulLanguge.currentContent('Player Matching')}, ${MulLanguge.currentContent('Please Wait')}`;

        this.progress.string = `${Math.floor(added * 100 / sum)}%`;
        this.tip.string = Math.floor(cc.director.getTotalTime() / 1000) % 3 == 0 ? `${this.mulLange_tmpStr}...` : this.mulLange_tmpStr;

        if (loaded) {
            this.starPanel.active = true;
            this.busyUI.active = false;
            Watcher.dispatch(HexsnakeEvent.PathGridLoaded);
        }


        if (added / sum >= this.l * 0.25 - 0.1) {

            let icon = this.loadIcons[this.l - 1];

            icon.spriteFrame = this.loadSps[this.l - 1];
            icon.node.scale = 1.2;


            let s = cc.sequence(
                cc.rotateTo(0.1, 20),
                cc.rotateTo(0.2, -20),
                cc.rotateTo(0.1, 0));
            icon.node.runAction(cc.sequence(s, cc.scaleTo(0.2, 1.0)));

            this.l++;
        }

    }


    public static playEffect(name: string, loop = false) {

        let clip = GameController.Ins.audioDict[name];
        if (clip != null) {
            cc.audioEngine.playEffect(clip, loop);
        }
    }


    onJoystickEvent(dir: cc.Vec2) {
        console.log(dir);
    }


    protected update(dt: number): void {

        GameManager.Ins.localTimePast();

        // Send Inputs
        if (this.selfSpeed && this.selfSpeed.magSqr()) {
            this.selfSpeed.normalize().mulSelf(gameConfig.moveSpeed);
            GameManager.Ins.sendClientInput({
                type: 'PlayerMove',
                speed: {
                    x: this.selfSpeed.x,
                    y: this.selfSpeed.y
                },
                dt: dt
            })
        }

        this.updatePlayers();
    }

    updatePlayers() {
        let playerStates = GameManager.Ins.state.players;
        let now = GameManager.Ins.state.now;
        for (let playerState of playerStates) {
            let player = this.playerEntitys.get(playerState.id);
            // 场景上还没有这个 Player，新建之
            if (!player) {
                player = AvatarContrl.Ins.createPlayer(playerState)
                let isSelf = playerState.id === GameManager.Ins.selfPlayerId;
                this.playerEntitys.set(playerState.id, player)
                player.init(playerState, isSelf)

                // 摄像机拍摄自己
                if (isSelf) {
                    FollowCamera.Ins.pos(player.node.convertToWorldSpaceAR(cc.Vec2.ZERO));
                    FollowCamera.Ins.target = player.node;
                    this.ml.player = player.node;
                }
            }

            // 根据最新状态，更新 Player 表现组件
            player.updateState(playerState, now);
        }

        // Clear left players
        for (let i = this.playerRoot.children.length - 1; i > -1; --i) {
            let player = this.playerRoot.children[i].getComponent(Player);
            if (!GameManager.Ins.state.players.find(v => v.id === player.playerId)) {
                player.node.removeFromParent();
                this.playerEntitys.delete(player.playerId);
            }
        }
    }

    onDestroy() {
        Watcher.removeAllListener(this);
    }

}



