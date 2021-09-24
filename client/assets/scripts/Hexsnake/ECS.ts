import Watcher, { HexsnakeEvent } from "../Common/Watcher";
import { pathItem } from "./MapCreator";


const { ccclass, property } = cc._decorator;

@ccclass
export default class ECS extends cc.Component {


    @property(cc.Node)
    observer: cc.Node;

    @property(cc.Node)
    gridRoot: cc.Node;


    @property()
    mag: number = 600;

    grids: BackGroundGridItem[] = [];
    start() {

        let blocks = this.getChildren(this.gridRoot);

        for (let i = 0; i < blocks.length; i++) {



            let item = new BackGroundGridItem();

            item.node = blocks[i];
            item.worldPos = this.node.convertToNodeSpaceAR(item.node.convertToWorldSpaceAR(cc.Vec2.ZERO));

            this.grids.push(item);

        }

        Watcher.addEventListener(HexsnakeEvent.FirstInteraction, this, this.FirstInteraction);
    }


    FirstInteraction() {
        //首次

    }

    getChildren(parent: cc.Node) {

        let array: cc.Node[] = [];

        for (let c of parent.children) {
            array.push(c);
            if (c.childrenCount > 0) {

                array.push(...this.getChildren(c));
            }
        }
        return array;
    }


    update(dt) {

        for (let i = 0, len = this.grids.length; i < len; i++) {


            if (this.distance(this.observer.position, this.grids[i].worldPos) < this.mag) {

                if (!this.grids[i].show) {
                    this.grids[i].show = true;
                    this.gridRoot.addChild(this.grids[i].node);
                    this.grids[i].node.position = this.grids[i].worldPos;
                }
            }
            else if (this.grids[i].show) {

                this.grids[i].show = false;
                this.grids[i].node.removeFromParent();
            }

        }



        let info = pathItem.mapGrid;
        //let stay: pathItem[] = [];
        for (let k in info) {

            if (this.distance(this.observer.position, info[k]._position) < this.mag) {

                if (info[k].node && !info[k].node.active) {
                    info[k].node.active = true;
                }
            }
            else if (info[k].node && info[k].node.active) {
                info[k].node.active = false;;
            }
        }

        //排序
        // stay = stay.sort(this.sortFunctor);
        // for (let i = 0, len = stay.length; i < len; i++) {

        //     stay[i].node.parent = this.node;
        //     stay[i].node.position = stay[i]._position;
        // }
    }

    //权重函数
    // sortFunctor(a: pathItem, b: pathItem): number {
    //     return a._yIndex < b._yIndex ? 1 : (a._yIndex > b._yIndex ? -1 : (a._xIndex > b._xIndex ? 1 : -1));
    // }


    distance(a: cc.Vec2, b: cc.Vec2) {

        let _x = a.x - b.x;
        let _y = a.y - b.y;
        return Math.sqrt(_x * _x + _y * _y);
    }

}




class BackGroundGridItem {

    show = true;
    node: cc.Node;
    worldPos: cc.Vec2;
}
