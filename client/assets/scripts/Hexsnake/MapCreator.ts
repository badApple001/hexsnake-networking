import GameController from "./GameController";
import Splixio from "./Splixio";

const { ccclass, property } = cc._decorator;

@ccclass
export default class MapCreator extends cc.Component {

    @property({ type: cc.Node, displayName: "根据玩家位置实时显示格子" })
    player: cc.Node = null;

    @property({ type: cc.Prefab, tooltip: "地图预制格子" })
    gridPrefb: cc.Prefab = null;

    @property({ tooltip: "格子数量" })
    initGridCount: number = 441;

    @property({ tooltip: "外圈后续生产间隔秒" })
    intervalFrame: number = 0.4;

    @property({ tooltip: "淡入时间, 当为0时 立即显示" })
    fadeInTime = 0;

    @property({ type: cc.SpriteFrame })
    bgSprf: cc.SpriteFrame;

    @property(cc.Node)
    groundRoot: cc.Node;


    //存储地图格子
    gridDict: {
        [k: number]: {
            [k: number]: cc.Node
        }
    } = {};
    //外旋九宫格算法
    createLayer = 1;
    createDirIndex = 0;
    createDir = [[1, 0], [0, -1], [-1, 0], [0, 1]];//创建方向 
    createPos = [-2, 1];
    gridSize: cc.Vec2 = cc.v2();
    initCreateCount = 0;
    playerLast = cc.v2();


    //生成路径节点
    createItem(x: number, y: number) {

        // let instance = cc.instantiate(this.wallPrefab);
        let name = `p_${Math.floor(x)}_${Math.floor(y)}`;

        let item = new pathItem();
        // //item.node = instance;
        // item.sprite = instance.getComponent(cc.Sprite);
        // this.node.addChild(instance, undefined, name);

        return item;
    }


    //外旋九宫格算法
    doCreate() {

        //下一个位置
        let _x = this.createPos[0] + this.createDir[this.createDirIndex][0];
        let _y = this.createPos[1] + this.createDir[this.createDirIndex][1];

        //转向
        if (Math.max(Math.abs(_x), Math.abs(_y)) > this.createLayer) {
            this.createDirIndex = (this.createDirIndex + 1) % 4;
            _x = this.createPos[0] + this.createDir[this.createDirIndex][0];
            _y = this.createPos[1] + this.createDir[this.createDirIndex][1];
        }

        //扩展
        if (this.gridDict[_x] != null && this.gridDict[_x][_y] != null) {
            ++this.createLayer;
            //左上角
            this.createPos[0] = -this.createLayer; //x
            this.createPos[1] = this.createLayer; //y
            this.createDirIndex = 0;//重设
        }
        else {
            this.createPos[0] = _x;
            this.createPos[1] = _y;
        }

        //创建节点
        let instance = cc.instantiate(this.gridPrefb);
        this.node.addChild(instance, undefined, `grid_${this.createPos[0]}_${this.createPos[1]}`);
        instance.x = this.createPos[0] * this.gridSize.x;
        instance.y = this.createPos[1] * this.gridSize.y;


        //记录节点
        if (this.gridDict[this.createPos[0]] == null)
            this.gridDict[this.createPos[0]] = {};
        this.gridDict[this.createPos[0]][this.createPos[1]] = instance;

        instance.opacity = 0;
        cc.tween(instance).to(this.fadeInTime, { opacity: 255 }).start();
    }





    map: {
        [x: number]: { [y: number]: pathItem }
    } = {};

    //面积
    public static readonly outerRadius = 61 / 2;
    public static readonly innerRadius = 53 / 2;//MapCreator.outerRadius * 0.866025404;
    public static readonly areaUnit = 2.598076 * MapCreator.outerRadius * MapCreator.outerRadius;
    public static readonly corners = [
        [0, 0, MapCreator.outerRadius],
        [MapCreator.innerRadius, 0, 0.5 * MapCreator.outerRadius],
        [MapCreator.innerRadius, 0, -0.5 * MapCreator.outerRadius],
        [0, 0, -MapCreator.outerRadius],
        [-MapCreator.innerRadius, 0, -0.5 * MapCreator.outerRadius],
        [-MapCreator.innerRadius, 0, 0.5 * MapCreator.outerRadius]
    ];


    toRealPos(node, _x, _y) {
        node.x = _x * (MapCreator.outerRadius * 1.5);
        node.y = _y * MapCreator.innerRadius;
    }

    initMap() {

    }

    Footprinting(pos: cc.Vec2, flag: number, outArray: pathItem[]) {
        let item = this.getPathNode(pos);
        if (item.flag != flag) {
            item.flag = flag;
            //item.sprite.spriteFrame = this.markSpriteFrame[flag];
            item.node.opacity = 0;
            item.state = 0;
            cc.tween(item.node).to(0.2, { opacity: 127 }).start();
            outArray.push(item);

            return true;
        }
        return false;
    }


    getColsRows(pos: cc.Vec2) {




        let _x = pos.x + this.node.width / 2;
        let _y = pos.y + this.node.height / 2;

        let cols = Math.floor(_x / 62);
        let row = Math.floor(_y / 54);
        if (this.map[cols] == null) {
            this.map[cols] = {};
        }
        return [cols, row];
    }

    getPathNode(pos: cc.Vec2) {

        let _pos = this.getColsRows(pos);
        let cols = _pos[0];
        let row = _pos[1];

        let item: pathItem = this.map[cols][row];
        if (item == null) {

            //创建路径节点
            item = new pathItem();
            this.map[cols][row] = item;

            //实例化Node
            //let instance = cc.instantiate(this.pathNodePref);
            //this.node.addChild(instance, undefined, `pathNode_${cols}_${row}`);

            //记录
            //item.node = instance;
            //item.sprite = instance.getComponent(cc.Sprite);
            item.node.x = cols * 62 - this.node.width / 2;
            item.node.y = row * 54 - this.node.height / 2;
            // item.x = cols;
            // item.y = row;
        }

        return item;
    }







    // //只显示以玩家为中心的九个底图格子
    // update(dt: number) {

    //     //玩家位置大于一个底图格子的时候 
    //     if (this.player.getPosition().sub(this.playerLast).mag() > this.gridSize.mag() * 0.5) {


    //         //刷新记录
    //         this.playerLast.x = this.player.position.x;
    //         this.playerLast.y = this.player.position.y;

    //         //中心下标
    //         let _x = Math.fround(this.playerLast.x / this.gridSize.x);
    //         let _y = Math.fround(this.playerLast.y / this.gridSize.y);

    //         //遍历底图格子
    //         let grid: cc.Node = null;
    //         for (let i in this.mapGrid) {

    //             for (let j in this.mapGrid[i]) {

    //                 grid = this.mapGrid[i][j];
    //                 if (!(grid instanceof cc.Node)) break;

    //                 let _i = parseInt(i);
    //                 let _j = parseInt(j);

    //                 //仅激活以玩家为中心的九个格子
    //                 grid.active = _i >= _x - 2 && _i <= _x + 2 && _j >= _y - 2 && _j <= _y + 2;
    //             }
    //         }

    //     }

    // }




    onLoad() {
        //初始化
        pathItem.init(null, this.node);

        console.time("createMapUseTime: ");

        //创建背景
        this.createBg();

        //创建地图
        this.createPathGrid();
    }

    createBg() {

        const sx = -3680, sy = 3339;
        const w = 368, h = 477;

        let p: cc.Node = null;
        for (let i = 0; i < 21; i++) {
            for (let j = 0; j < 15; j++) {

                p = new cc.Node();
                p.addComponent(cc.Sprite).spriteFrame = this.bgSprf;
                this.groundRoot.addChild(p);

                p.width = w;
                p.height = h;
                p.x = sx + i * w;
                p.y = sy - j * h;

            }
        }
    }


    createPathGrid() {

        let sx = -this.node.width / 2;
        let sy = -3551;
        let sxV = -3818;
        let syV = -3578;
        let _y = 53;
        let _x = 92;



        //#region  场景加载瞬间 创建所有地图格子
        // for (let i = 0; i < 84; i++) {

        //     for (let j = 134; j >= 0; j--) {

        //         pathItem.create(0 + i * 2, 1 + j * 2, this.node, sx + i * _x, sy + j * _y);
        //         pathItem.create(1 + i * 2, 0 + j * 2, this.node, sxV + i * _x, syV + j * _y);

        //     }
        // }

        // //关闭mask
        // setTimeout(() => {
        //     GameController.instance.mapLoadProgress(85 * 135 * 2, 85 * 135 * 2, true);
        // }, 200);
        // if (true) return;
        //#endregion


        //#region  先创建地图位置数据等信息 后分帧创建地图节点实体及组件
        for (let i = 0; i < 84; i++) {

            for (let j = 134; j >= 0; j--) {

                // pathItem.create(0 + i * 2, 1 + j * 2, this.node, sx + i * _x, sy + j * _y);
                // pathItem.create(1 + i * 2, 0 + j * 2, this.node, sxV + i * _x, syV + j * _y);

                pathItem.reserve(0 + i * 2, 1 + j * 2, sx + i * _x, sy + j * _y);
                pathItem.reserve(1 + i * 2, 0 + j * 2, sxV + i * _x, syV + j * _y);

            }
        }

        //this.schedule(this.asyncCreate, 1.0 * 2 / 60, cc.macro.REPEAT_FOREVER);

        //先创建10000个
        for (let i = 0; i < 20; i++) {
            this.schedule(() => {

                if (pathItem.reserveItem.length == 0) {

                    this.unscheduleAllCallbacks();
                    console.timeEnd("createMapUseTime: ");
                    return;
                }


                for (let j = 0; j < 100 && pathItem.reserveItem.length > 0; j++) {

                    while (!pathItem.Instance() && pathItem.reserveItem.length > 0) {
                        pathItem.Instance();
                    }
                }

            }, 0 + 1.0 / 60 * i, cc.macro.REPEAT_FOREVER);
        }

        //后续异步创建
        // for (let i = 0; i < 10; i++) {
        //     this.schedule(() => {

        //         if (pathItem.reserveItem.length == 0) {

        //             this.unscheduleAllCallbacks();
        //             console.timeEnd("createMapUseTime: ");
        //             return;
        //         }


        //         for (let j = 0; j < 10 && pathItem.reserveItem.length > 0; j++) {

        //             while (!pathItem.Instance() && pathItem.reserveItem.length > 0) {
        //                 pathItem.Instance();
        //             }
        //         }

        //     }, 0 + 1.0 / 60 * i, cc.macro.REPEAT_FOREVER);
        // }


        //#endregion
    }


    // asyncCreate() {

    //     if (pathItem.reserveItem.length == 0) {

    //         this.unschedule(this.asyncCreate);
    //         return;
    //     }

    //     while (!pathItem.Instance() && pathItem.reserveItem.length > 0) {
    //         pathItem.Instance();
    //     }
    // }


}

/**
 * 
 * 路径item
 */
export class pathItem {
    node: cc.Node = null;
    sprite: cc.Sprite = null;
    pNext: pathItem = null;

    /**
     * 拥有者
     */
    spliter: Splixio = null;
    /**
     * 拥有者的标记
     */
    flag: number = -1;
    /**
     * 0 在预填充状态下
     * 1 已经填充完成的状态
     */
    state = -1;

    /**
     * 映射X坐标
     */
    _xIndex = 0;
    /**
     * 隐射Y坐标
     */
    _yIndex = 0;


    /**
     * 世界坐标
     */
    _position: cc.Vec2;

    static mapGrid: { [k: string]: pathItem } = {};

    static tryMap(name: string): pathItem {

        let item = pathItem.mapGrid[name];
        if (null == item) return null;

        if (null == item.node) pathItem.InstanceImmediately(item);

        return item;
    }


    static pathNodePrefab: cc.Prefab = null;

    //构造
    constructor(name?: string) {
        this._name = name;
    }


    /**
     * 初始化
     * @param prefab 地图格子预制体
     * @param stage 舞台
     */
    static init(prefab: cc.Prefab, stage: cc.Node = null) {
        pathItem.pathNodePrefab = prefab;
        pathItem.stage = stage;
    }



    _name: string;//节点名 key
    static stage: cc.Node = null;//地图格子的舞台
    static reserveItem: pathItem[] = [];//待实例化添加至舞台的预订格子
    static sumPathNodeNum = 135 * 85 * 2;
    //切片处理实例化节点
    static Instance() {


        let current = pathItem.reserveItem.pop();

        //已经被实例化处理了 next
        if (current.node != null) return false;

        let node = new cc.Node(current._name);
        node.group = "static";


        let collider = node.addComponent(cc.PolygonCollider);
        collider.tag = 20;
        collider.points = [
            cc.v2(-15.8, -26.7),
            cc.v2(15.5, -26.6),
            cc.v2(32, 0.3),
            cc.v2(15.75, 26.95),
            cc.v2(-15.59, 27),
            cc.v2(-31.9, 0.3)
        ];

        current.node = node;
        pathItem.stage.addChild(current.node);
        current.sprite = node.addComponent(cc.Sprite);

        //test
        //current.sprite.spriteFrame = GameController.instance.actorConfig[0].grid;
        node.width = 66;
        node.height = 58;

        current.node.position = current._position.clone();

        //更新
        GameController.instance.mapLoadProgress(pathItem.sumPathNodeNum - pathItem.reserveItem.length, pathItem.sumPathNodeNum, pathItem.reserveItem.length == 0);
        //实例化成功
        return true;
    }

    //立即处理
    static InstanceImmediately(item: pathItem) {

        if (item.node != null) return;

        let node = new cc.Node(item._name);
        node.group = "static";
        node.width = 66;
        node.height = 58;

        let collider = node.addComponent(cc.PolygonCollider);
        collider.tag = 20;
        collider.points = [
            cc.v2(-15.8, -26.7),
            cc.v2(15.5, -26.6),
            cc.v2(32, 0.3),
            cc.v2(15.75, 26.95),
            cc.v2(-15.59, 27),
            cc.v2(-31.9, 0.3)
        ];

        item.node = node;
        pathItem.stage.addChild(item.node);
        item.sprite = node.addComponent(cc.Sprite);
        item.node.position = item._position.clone();
    }


    //预定坑位
    static reserve(cols: number, lines: number, x: number = 0, y: number = 0) {

        let name = `p_${cols}_${lines}`;
        let item = new pathItem(name);
        pathItem.mapGrid[name] = item;
        pathItem.reserveItem.unshift(item);


        item._xIndex = cols;
        item._yIndex = lines;
        item._position = cc.v2(x, y);
        return item;
    }



    static create(cols: number, lines: number, stage: cc.Node, x: number = 0, y: number = 0) {

        let name = `p_${cols}_${lines}`;

        let item = new pathItem(name);
        this.mapGrid[name] = item;
        item._xIndex = cols;
        item._yIndex = lines;


        let node = new cc.Node(name);
        node.group = "static";
        node.width = 66;
        node.height = 58;
        let t = node.addComponent(cc.Sprite);
        let collider = node.addComponent(cc.PolygonCollider);
        collider.tag = 20;
        collider.points = [
            cc.v2(-15.8, -26.7),
            cc.v2(15.5, -26.6),
            cc.v2(32, 0.3),
            cc.v2(15.75, 26.95),
            cc.v2(-15.59, 27),
            cc.v2(-31.9, 0.3)
        ];

        item.node = node;//cc.instantiate(pathItem.pathNodePrefab);
        stage.addChild(item.node, undefined, name);

        item.sprite = t;//item.node.getComponent(cc.Sprite);
        item.node.x = x; item.node.y = y;
        item._position = item.node.position;

        return item;
    }
}