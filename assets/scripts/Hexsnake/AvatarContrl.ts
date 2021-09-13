import { CCUtils } from "../Common/CCUtils";
import { nameTemplateArray } from "../Common/DefineData";
import MulLanguge from "../Common/MulLanguge";
import { Toolkit } from "../Common/Toolkit";
import Watcher, { HexsnakeEvent } from "../Common/Watcher";
import GameController from "./GameController";
import { pathItem } from "./MapCreator";
import Splixio, { RankItem } from "./Splixio";

const { ccclass, property } = cc._decorator;



/**
 *
 *
 *
 */
@ccclass
export default class AvatarContrl extends cc.Component {

    @property({ type: cc.Prefab, tooltip: "昵称文本" })
    nickPref: cc.Prefab = null;
    nickItemPool: cc.Node[] = [];


    @property(cc.Node)
    observer: cc.Node;

    @property({ displayName: "显示nick的最近距离, 默认进入屏幕内开始显示" })
    dis: number = 0;

    @property({ type: Splixio })
    player: Splixio = null;
    @property(cc.Prefab)
    aiPrefab: cc.Prefab;
    @property(cc.Node)
    rankItemStage: cc.Node;
    @property({ type: [cc.Prefab] })
    rankItemPrefab: cc.Prefab[] = [];
    @property({ type: [cc.Node] })
    diademas: cc.Node[] = [];





    @property(cc.ProgressBar)
    areaSliderBar: cc.ProgressBar;
    @property(cc.Label)
    areaTxt: cc.Label;

    @property(cc.Label)
    maxRecord: cc.Label;

    @property(cc.Node)
    tailStage: cc.Node = null;

    actors: Splixio[] = [];

    actorIndexs = [1, 2, 3, 4, 5, 6]; // 0 是玩家的配置

    spawnAI() {

        if (this.actors.length >= 7) return;

        let instance = cc.instantiate(this.aiPrefab);

        this.node.addChild(instance);

        instance.position = this.findPos();

        let t = instance.getComponent(Splixio);
        t.flag = this.actorIndexs.pop(); //Toolkit.RandomInt(4);

        this.readConfig(t);//根据配置设置头像和拖尾
        t.nickNode = this.createNickItem();//名称
        this.createRankItem(t, this.actors.length);//排行榜
        this.actors.push(t);//放进角色对象池
    }


    posArr: cc.Vec2[] = [
        cc.v2(-2000 + 4000 / 3 * 0, -2000 + 4000 / 3 * 2), cc.v2(-2000 + 4000 / 3 * 1, -2000 + 4000 / 3 * 2), cc.v2(-2000 + 4000 / 3 * 2, -2000 + 4000 / 3 * 2),
        cc.v2(-2000 + 4000 / 3 * 0, -2000 + 4000 / 3 * 1), cc.v2(-2000 + 4000 / 3 * 1, -2000 + 4000 / 3 * 1), cc.v2(-2000 + 4000 / 3 * 2, -2000 + 4000 / 3 * 1),
        cc.v2(-2000 + 4000 / 3 * 0, -2000 + 4000 / 3 * 0), cc.v2(-2000 + 4000 / 3 * 1, -2000 + 4000 / 3 * 0), cc.v2(-2000 + 4000 / 3 * 2, -2000 + 4000 / 3 * 0)
    ];

    findPos() {
        /**
         * |  6  |  7  |  8  |
         * |  3  |  4  |  5  |
         * |  0  |  1  |  2  |
         *
         */


        let indexs: Splixio[] = [];
        indexs.push(...this.actors);

        for (let i = 0; i < 9; i++) {


            let flag = true;
            for (let j = 0; j < indexs.length; j++) {
                if (CCUtils.distance(this.posArr[i], indexs[j].node.position) < 667) {
                    indexs[j] = indexs.pop();

                    flag = false;
                    break;
                }
            }

            //和当前场景里的其它角色都保持一定距离时 返回位置
            if (flag) {
                return this.posArr[i].clone();
            }
        }

        return this.posArr[0];
    }


    playerMaxArea = 0;
    onLoad() {

        //刷新面积
        this.playerMaxArea = 0; //parseFloat(Toolkit.getCookie("Hexsnake_max"));
        this.refreshArea(0);
        this.maxRecord.string = `High Scores: ${(this.playerMaxArea * 100).toFixed(2)}%`;

        Watcher.addEventListener(HexsnakeEvent.SortRank, this, this.sortRank);
        Watcher.addEventListener(HexsnakeEvent.Death, this, this.onSnakeDeath);
        Watcher.addEventListener(HexsnakeEvent.FirstInteraction, this, this.FirstInteraction);
        Watcher.addEventListener(Watcher.ON_VIEW_RESIZE,this,()=>{

            for(let actor of this.actors){
                actor.tailVfx && actor.tailVfx.reset();
            }

        });
        cc.game.on(cc.game.EVENT_HIDE, this.save, this);
    }


    FirstInteraction() {
        //this.player.tailVfx.enabled=true;
        for (let i = 1; i < this.actors.length; i++) {
            this.actors[i].node.active = true;
        }
        //后续创建
        this.schedule(this.spawnAI, 1.167, 4, 2);
    }

    onDestroy() {
        this.save();
    }


    refreshArea(cur: number) {

        this.areaTxt.string = `${(cur * 100).toFixed(2)}%`;
        this.areaSliderBar.progress = Math.min(1.0, cur * 1.0 / this.playerMaxArea);

        this.playerMaxArea = Math.max(this.playerMaxArea, cur);
        this.maxRecord.string = `${MulLanguge.currentContent('High Scores')}: ${(this.playerMaxArea * 100).toFixed(2)}%`;
    }



    //保存玩家最大记录
    save() {
        //Toolkit.setCookie("Hexsnake_max", Math.max(this.playerMaxArea, this.player.rankItem.progress));
    }



    start() {

        if (this.dis == 0) {
            let winSizePixels = cc.director.getWinSizeInPixels();
            console.log(winSizePixels);
            this.dis = Math.max(winSizePixels.width, winSizePixels.height);
        }

        this.readConfig(this.player);//根据配置设置头像和拖尾
        this.player.nickNode = this.createNickItem(true);//名称
        this.createRankItem(this.player);//排行榜
        //this.player.tailVfx.enabled=false;
        this.actors.push(this.player);//放进角色对象池


        //初始化创建2个AI
        for (let i = 0; i < 2; i++) {
            this.spawnAI();
        }

        for (let p of this.actors) {
            p.node.active = false;
        }

        Watcher.addEventListener(HexsnakeEvent.PathGridLoaded, this, () => {
            this.actors[0].node.active = true;
        });

        this.maxArea = window['maxArea'] || 1.4;
    }
    maxArea = 1.4;

    //读取配置
    readConfig(actor: Splixio) {


        let config = GameController.instance.actorConfig[actor.flag];

        //拖尾
        actor.tail = cc.instantiate(config.tailPrefab);
        this.tailStage.addChild(actor.tail, undefined, `${this.node.name}_tail`);
        actor.tail.position = actor.node.position;
        actor.tailVfx = actor.tail.getComponent(cc.MotionStreak);
        actor.tailVfx.color = config.tailColor;
        actor.tailVfx.reset();

        actor.gridIcon = config.grid;
        let head = actor.node.getChildByName("head");
        head.getComponent(cc.Sprite).spriteFrame = config.avatar;

        //渲染区域
        let renderMat = config.avatar.getRect();

        //宽高比
        let e = renderMat.width * 1.0 / renderMat.height;
        head.width = actor.node.height * e;
    }

    //创建排行榜item
    createRankItem(actor: Splixio, rankIndex = 0) {

        let item = new RankItem();
        actor.rankItem = item;

        item.node = cc.instantiate(this.rankItemPrefab[actor.flag]);
        item.name = CCUtils.FindChildComponentHelper(item.node, "name", cc.Label);
        rankIndex < 3 && this.rankItemStage.addChild(item.node);
        item.node.zIndex = rankIndex;

        item.name.string = actor.nickNode.name;
        item.size = CCUtils.FindChildComponentHelper(item.node, "size", cc.Label);
        item.rank(rankIndex);
        item.setSize(0);
    }


    //创建一个名称item
    createNickItem(isPlayer = false) {

        let name = !isPlayer ? this.randomNick(): "hexsnake_" + Toolkit.RandomInt(9999,1000).toString();
        let node = cc.instantiate(this.nickPref);
        this.node.addChild(node);

        node.getComponentInChildren(cc.Label).string = name;
        node.name = name;

        this.nickItemPool.push(node);
        return node;
    }


    //蛇蛇死亡了
    onSnakeDeath(splix: Splixio, beKiller: Splixio) {
        // let index = this.actors.indexOf(splix);
        // if (index != -1) {


        //     ////死亡移除逻辑
        //     // let splix = this.actors.splice(index, 1)[0];
        //     // splix.rankItem.node.active = false;
        //     // splix.node.removeFromParent(true);

        //     // //当场上只有2个玩家的时候 移除排名3的王冠
        //     // //依次类推
        //     // for (let i = 3; i > 0; i--) {
        //     //     if (i > this.actors.length) {
        //     //         this.diademas.splice(i - 1, 1)[0].removeFromParent();
        //     //     }
        //     // }
        // }

        ////死亡重生刷新逻辑
        if (splix.isPlayer) {

            //玩家死亡刷新玩家最大记录值
            this.save();
        }
        else {

            splix.node.position = this.findPos();
            splix.node.active = true;
        }

        this.sortRank(splix);
    }


    //排行榜进行一次洗牌
    sortRank(caller: Splixio) {

        //交换指针
        let temp: Splixio = null;
        //记录最后一此的交换位置
        let lastExchangeIndex = 0;
        //无序数列的边界,每次比较只需要比到这里为止
        let sortBorder = this.actors.length - 1;
        for (let i = 0, len = this.actors.length; i < len; i++) {

            //有序标记，每一轮的初始是true
            let isSorted = true;

            for (let j = 0; j < sortBorder; j++) {

                if (this.actors[j].realFullNode.length < this.actors[j + 1].realFullNode.length) {

                    temp = this.actors[j];
                    this.actors[j] = this.actors[j + 1];
                    this.actors[j + 1] = temp;

                    //有元素交换，所以不是有序，标记变为false
                    isSorted = false;
                    //把无序数列的边界更新为最后一次交换元素的位置
                    lastExchangeIndex = j;
                }
            }

            sortBorder = lastExchangeIndex;
            if (isSorted) break;
        }


        //始终保持仅有三个排行榜节点在 界面上
        for (let i = 0; i < this.actors.length; i++) {
            let item = this.actors[i].rankItem;

            let progress = this.actors[i].realFullNode.length / pathItem.sumPathNodeNum;

            if (i < 3) {

                if (!item.node.parent) item.node.parent = this.rankItemStage;

                item.setSize(progress);//UI和数据同步刷新
                item.rank(i);
                if (item.node.getNumberOfRunningActions() > 0)
                    item.node.stopAllActions();
                cc.tween(item.node).to(0.4, { width: 384 - i * 50 }, cc.easeCircleActionOut()).start();
                item.node.zIndex = i;
            }
            else if (item.node.parent) {

                item.progress = progress;//仅刷新数据
                item.node.removeFromParent();
            }
        }


        //刷新玩家面积
        if (caller.isPlayer) {
            this.refreshArea(caller.rankItem.progress);
            if(caller.rankItem.progress * 100 >= this.maxArea) Watcher.dispatch(HexsnakeEvent.GameOverEvent)
        }
    }


    //随机一个姓名
    randomNick() {

        let index = Toolkit.RandomInt(nameTemplateArray.length);
        let name = nameTemplateArray[index];
        nameTemplateArray[index] = nameTemplateArray.pop();
        return name;
    }


    //更新
    update(dt: number) {

        //昵称
        for (let i = 0; i < this.actors.length; i++) {

            this.actors[i].nickNode.active = CCUtils.distance(this.actors[i].nickNode.position, this.observer.position) < this.dis;
            this.actors[i].nickNode.x = this.actors[i].node.x;
            this.actors[i].nickNode.y = this.actors[i].node.y;
        }

        //王冠
        for (let i = 0; i < 3; i++) {

            this.diademas[i].active = CCUtils.distance(this.actors[i].nickNode.position, this.observer.position) < this.dis;
            this.diademas[i].x = this.actors[i].node.x;
            this.diademas[i].y = this.actors[i].node.y + 44;
        }

        // //debug 测试
        // this.gfx.clear();
        // for (let i = 1; i < this.actors.length; i++) {
        //     this.gfx.moveTo(this.player.node.x, this.player.node.y);
        //     this.gfx.lineTo(this.actors[i].node.x, this.actors[i].node.y);
        // }
        // this.gfx.stroke();

    }

}

