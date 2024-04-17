import { ActorColliderTag } from "../Common/DefineData";
import Watcher, { HexsnakeEvent } from "../Common/Watcher";
import GameController from "./GameController";
import { pathItem } from "./MapCreator";
import Player from "./Player";

const { ccclass, property } = cc._decorator;

@ccclass
export default class Splixio extends cc.Component {


    @property({ displayName: "圈地的标记" })
    flag: number = 0;

    skinID = 0;
    //格子图标
    gridIcon: cc.SpriteFrame;

    //拖尾效果
    tailVfx: cc.MotionStreak = null;
    tail: cc.Node;
    preFullNode: pathItem[] = [];
    realFullNode: pathItem[] = [];
    isPlayer = false;//是否是自身控制的角色
    applyLock = false;//填充锁 当在自身领域进行巡逻时 不会进行填充处理 仅在出了 自己领域范围且回到自己领域的时候进行填充判定

    killCount: number = 0;

    rankItem: RankItem = null;
    nickNode: cc.Node = null;

    // move:Move = null;

    audioCtr: cc.AudioSource = null;

    start() {
        // this.move = this.node.getComponent(Move);
        // this.isPlayer = this.player != null;
        // this.audioCtr = this.getComponent(cc.AudioSource);
    }

    update(dt) {
        //拖尾
        this.tail.position = this.node.position;
    }

    //实体化
    onCollisionEnter(other: cc.Collider, self: cc.Collider) {

        //判断节点类型
        if (other.tag == ActorColliderTag.PathNode) {

            let item = pathItem.tryMap(other.node.name);
            if (item != null) {

                //未被占用过
                if (item.state == -1) {

                    this.applyLock = false;
                    this.reserver(item);
                }
                else {

                    let first = item == this.preFullNode[0];

                    //圈地
                    if (!this.applyLock && (first || (item.state == 1 && item.flag == this.flag))) {
                        this.applyLock = true;

                        this.apply();

                    }   //别人的尾巴
                    else if (item.state == 0 && item.flag != this.flag) {

                        !item.spliter.isPlayer && this.killOther(other, item);
                        this.reserver(item);

                    }  //别人的领域
                    else if (item.state == 1 && item.flag != this.flag) {
                        item.spliter.replace(item);

                        //
                        this.reserver(item);

                    }
                    else if (item.flag != this.flag) {

                        //走出自己的领域
                        this.applyLock = false;
                    }
                }

            }

        } //撞墙
        else if (other.tag == ActorColliderTag.Wall) {

            //撞墙贴墙走
            // let angle = other.node.angle - 90;
            // angle = angle * Math.PI / 180; //转弧度
            // this.move.setDir(cc.v2(Math.cos(angle),Math.sin(angle)));
         
            //撞墙死亡
            //this.doDeath(null); 
            // this.isPlayer && this.move.SEND('wall',{});
        }
    }

    // onCollisionStay(other: cc.Collider, self: cc.Collider)
    // {

    //     if (other.tag == ActorColliderTag.Wall) {


            
    //         //撞墙贴墙走
    //         // let angle = other.node.angle - 90;
    //         // angle = angle * Math.PI / 180; //转弧度
    //         // this.move.setDir(cc.v2(Math.cos(angle),Math.sin(angle)));
            
    //         //撞墙死亡
    //         //this.doDeath(null); 
    //     }
    // }

    clear() {

        for (let item of this.preFullNode) {
            item.spliter = null;
            item.state = -1;
            item.sprite.spriteFrame = null;
            item.node.opacity = 0;
            item.flag = -1;//标记领域
        }
        for (let item of this.realFullNode) {
            item.spliter = null;
            item.state = -1;
            item.sprite.spriteFrame = null;
            item.node.opacity = 0;
            item.flag = -1;//标记领域
        }

        this.preFullNode = [];
        this.realFullNode = [];

        this.tailVfx.reset();
        this.node.active = false;

        this.rankItem.node.removeFromParent();
        this.rankItem.node.isValid && this.rankItem.node.destroy();
    }

    doDeath(beKiller: Splixio) {
        this.clear();
        Watcher.dispatch(HexsnakeEvent.Death, this, beKiller);
    }




    //移除自身的一个item
    replace(item: pathItem) {

        //剔除自身实体节点
        let index = this.realFullNode.indexOf(item);
        if (index != -1) {
            this.realFullNode[index] = this.realFullNode.pop();
        }

        //剔除自身预填充节点
        index = this.preFullNode.indexOf(item);
        if (index != -1) {
            this.preFullNode[index] = this.preFullNode.pop();
        }

        //重新计算面积
        Watcher.dispatch(HexsnakeEvent.SortRank, this);
    }

    //预定
    reserver(item: pathItem,tween = true) {


        if (this.realFullNode.length < 6) {
            return this.fill(item);
        }

        this.isPlayer && this.audioCtr &&  !this.audioCtr.isPlaying && this.audioCtr.play();

        this.preFullNode.push(item);
        item.spliter = this;
        item.state = 0; //预选用
        item.sprite.spriteFrame = this.gridIcon;
        item.node.width = 66;
        item.node.height = 58;
        item.node.opacity = 0;
        item.flag = this.flag;//标记领域
        tween && cc.tween(item.node).to(0.4, { opacity: 26 }).start();
    }

    fill(item: pathItem,tween=true) {

        //缓存
        this.realFullNode.push(item);
        item.spliter = this;
        item.state = 1; //实体化
        item.sprite.spriteFrame = this.gridIcon;
        item.flag = this.flag;//标记领域
        item.node.opacity = 127;

        if(tween){

            item.node.scale = 0.4;
            cc.tween(item.node).to(0.4, { opacity: 255, scale: 1.0 }, cc.easeBounceOut()).start();
        }
        else{
            item.node.scale = 1;
        }
    }


    //填充
    apply() {

        //擦除拖尾
        this.tailVfx.reset();


        let temp: { [k: number]: pathItem[] } = {};
        let pair: pathItem[] = null;

        //#region 四边形外边框算法
        this.preFullNode.push(...this.realFullNode);
        //求外边框 不是包围Σ噢~  是成偶数的多边形体哦~
        for (let item of this.preFullNode) {

            pair = temp[item._yIndex];
            if (pair == null && item.flag == this.flag) {
                //建表
                temp[item._yIndex] = [item,item];
            }
            else if (null != pair && item.flag == this.flag) {

                if (item._xIndex < pair[0]._xIndex)
                    pair[0] = item;
                else if (item._xIndex > pair[1]._xIndex)
                    pair[1] = item;
            }
        }

        //清除所有预填充格子
        this.preFullNode.splice(0, this.preFullNode.length);

        //最终填充
        for (let k in temp) {

            pair = temp[k];
            for (let i = pair[0]._xIndex; i <= pair[1]._xIndex; i++) {
                let k = `p_${i}_${pair[0]._yIndex}`;
                let item = pathItem.tryMap(k);

                if (null != item && (item.state == 0 || this.flag != item.flag)) {
                    this.fill(item);
                }

            }

        }
        //#endregion



        //重新计算面积
        Watcher.dispatch(HexsnakeEvent.SortRank, this);

        //通知其它玩家


        //刷新UI

        //圈地音效
        this.isPlayer && GameController.playEffect("_success");

        //公告圈地
        // this.isPlayer && this.player.notifyGrid();
    }





    //杀掉对方
    killOther(other: cc.Collider, item: pathItem) {
        
        if (this.isPlayer) {
            
            ++this.killCount;
            GameController.Ins.refreshKill(this.killCount);
            //杀敌音效
            GameController.playEffect("kill");

            // this.move.SEND('kill',{
            //     gid:item.spliter.gid         
            // });
        }
       
        // item.spliter.doDeath(this);
    }
}



export class RankItem {

    node: cc.Node;
    name: cc.Label;

    rank(rankID: number) {
        this.name.fontSize = 22 - rankID * 2;
    }

    size: cc.Label;
    progress = 0;
    setSize(v: number) {
        this.progress = v;
        this.size.string = (v * 100).toFixed(2) + "%";
    }

}
