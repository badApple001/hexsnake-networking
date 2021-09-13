

/*


 *
 * 自定义的数据部分
 * 公用方法 在 Toolkit文件中
 *
 * 程序猿: ChenJC
 * 最后修改日期: 2020/06/09
 *
 */

const { ccclass, property } = cc._decorator;



/**
 * 函数签名
 */
export interface FuncSignature {
    /**
     * 函数封装器
     */
    functor: Function;
    /**
     * 调用者 | 作用域
     */
    caller: any;
}


/**
 * 二维向量接口
 */
export interface IVec2 {
    x: number,
    y: number
}

/**
 * 三维向量接口
 */
export interface IVec3 extends IVec2 {
    z: number
}

/**
 * 矩形数据接口
 */
export interface IRect {
    x: number,
    y: number,
    width: number,
    height: number
}


/**
 *
 * 键值对
 */
export interface Map_Pair<K, V> {
    key: K,
    value: V
}



/**
 * 埋点数据接口
 */
export interface IBuriedPointData {
    section: string;
}


/**
 * 埋点数据
 * 用户进入某一个环节
 */
export interface IEnter_Section_Data extends IBuriedPointData {
    section_remark?: string;
}


/**
 * 埋点数据2
 * 用户点击了某一跳转商店的 图标 | 按钮 | 元素
 */
export interface IClick_Content_Data extends IBuriedPointData {
    area: string;
    area_remark?: string;
}

/**
 * 埋点数据 触发类型
 */
export class BuriedPointData {
    /**
     * 点击某个内容
     */
    public static clickContent = "clickContent";

    /**
     * 进入了某个游戏环节
     */
    public static enterSection = "enterSection";
}



/**
 * HashMap泛型实现
 */
export class HashMap<K, V>
{
    //存储列表
    private _list: Map_Pair<K, V>[];

    constructor() {
        this.clear();
    }

    //通过key获取索引
    private getIndexByKey(key: K): number {
        var count: number = this._list.length;
        for (let index = 0; index < count; index++) {
            const element: Map_Pair<K, V> = this._list[index];
            if (element.key == key) {
                return index;
            }
        }
        return -1;
    }

    /**
     * 添加键值
     */
    public add(key: K, value: V): void {
        var data: Map_Pair<K, V> = { key: key, value: value };
        var index: number = this.getIndexByKey(key);
        if (index != -1) {
            //已存在：刷新值
            this._list[index] = data;
        }
        else {
            //不存在：添加值
            this._list.push(data);
        }
    }

    /**
     * 删除键值
     */
    public remove(key: K): any {
        var index: number = this.getIndexByKey(key);
        if (index != -1) {
            var data: Map_Pair<K, V> = this._list[index];
            this._list.splice(index, 1);
            return data;
        }
        return null;
    }

    /**
     * 是否存在键
     */
    public has(key: K): boolean {
        var index: number = this.getIndexByKey(key);
        return index != -1;
    }

    /**
     * 通过key获取键值value
     * @param key
     */
    public get(key: K): V {
        var index: number = this.getIndexByKey(key);
        if (index != -1) {
            var data: Map_Pair<K, V> = this._list[index];
            return data.value;
        }
        return null;
    }

    /**
     * 获取数据个数
     */
    public get length(): number {
        return this._list.length;
    }


    /**
     * 遍历列表，回调(data:KeyValue<K, V>)
     */
    public forEachKeyValue(f: { (data: Map_Pair<K, V>): void }) {
        var count: number = this._list.length;
        for (let index = 0; index < count; index++) {
            const element: Map_Pair<K, V> = this._list[index];
            f(element);
        }
    }

    /**
     * 遍历列表，回调(K,V)
     */
    public forEach(f: { (key: K, value: V): void }) {
        var count: number = this._list.length;
        for (let index = 0; index < count; index++) {
            const element: Map_Pair<K, V> = this._list[index];
            f(element.key, element.value);
        }
    }

    /**
     * 清空全部
     */
    public clear(): void {
        this._list = [];
    }
}



/**
 * 当前浏览器平台信息
 */
export let Browser_Platform_Info = {
    /** 当前浏览器 user-Agent 字符串*/
    userAgent: navigator.userAgent.toLowerCase(),
    /** 当前运行在安卓平台上 */
    onAndroid: Boolean(navigator.userAgent.match(/android/ig)),
    /** 当前运行在苹果平台上 */
    onIOS: Boolean(navigator.userAgent.match(/iphone|ipod/ig)),
    /** 当前运行在Ipad平台上 */
    onIpad: Boolean(navigator.userAgent.match(/ipad/ig)),
    /** 当前运行在微信平台上 */
    onWechat: Boolean(navigator.userAgent.match(/MicroMessenger/ig))
}


/**
 * 平台信息
 */
export class BrowerPlatform {

    /** 当前浏览器 user-Agent 字符串*/
    public static userAgent = navigator.userAgent.toLowerCase();
    /** 当前运行在安卓平台上 */
    public static onAndroid = Boolean(navigator.userAgent.match(/android/ig));
    /** 当前运行在苹果平台上 */
    public static onIOS = Boolean(navigator.userAgent.match(/iphone|ipod/ig));
    /** 当前运行在Ipad平台上 */
    public static onIpad = Boolean(navigator.userAgent.match(/ipad/ig));
    /** 当前运行在微信平台上 */
    public static onWechat = Boolean(navigator.userAgent.match(/MicroMessenger/ig));

    /**当前平台名缓冲 */
    private static platformCache = "";
    /**
     * 获取当前平台名
     * @return android | ios | ipad | wechat | pc
     */
    public static get CurPlatformName() {

        if (this.platformCache == "" || this.platformCache.length < 2) {

            let platformType: string;
            if (BrowerPlatform.onAndroid) {
                platformType = "android";
            }
            else if (BrowerPlatform.onIOS) {
                platformType = "ios";
            }
            else if (BrowerPlatform.onIpad) {
                platformType = "ipad";
            }
            else if (BrowerPlatform.onWechat) {
                platformType = "wechat";
            }
            else {
                platformType = "pc";
            }

            this.platformCache = platformType;
        }
        return this.platformCache;
    }


}


/**
 * 含有 最大值 最小值 可以在面板显示的数据类型
 */
@ccclass("C_Clamp")
export class C_Clamp {
    @property()
    public min: number = 0;

    @property()
    public max: number = 0;
}


/**
 * 含有 最大值 最小值 可以在面板显示的数据类型
 */
@ccclass("C_SpriteFrame_Map")
export class C_SpriteFrame_Map {
    @property()
    public name: string="";

    @property(cc.SpriteFrame)
    public texture: cc.SpriteFrame = null;
}


export enum ActorColliderTag {

    Player = 10,
    AI = 11,
    PathNode = 20,
    Wall = 30



}


@ccclass
export class Shake extends cc.ActionInterval {

    private _initial_x: number = 0;
    private _initial_y: number = 0;
    private _strength_x: number = 0;
    private _strength_y: number = 0;

    /**
     *  创建抖动动画
     * @param {number} duration     动画持续时长
     * @param {number} strength_x   抖动幅度： x方向
     * @param {number} strength_y   抖动幅度： y方向
     * @returns {Shake}
     */
    public static create(duration: number, strength_x: number, strength_y: number): Shake {
        let act: Shake = new Shake();
        act.initWithDuration(duration, strength_x, strength_y);
        return act;
    }

    public initWithDuration(duration: number, strength_x: number, strength_y: number): boolean {
        cc.ActionInterval.prototype['initWithDuration'].apply(this, arguments);
        this._strength_x = strength_x;
        this._strength_y = strength_y;
        return true;
    }

    public fgRangeRand(min: number, max: number): number {
        let rnd: number = Math.random();
        return rnd * (max - min) + min;
    }

    public update(time: number): void {
        let randx = this.fgRangeRand(-this._strength_x, this._strength_x);
        let randy = this.fgRangeRand(-this._strength_y, this._strength_y);
        this.getTarget().setPosition(randx + this._initial_x, randy + this._initial_y);
    }

    public startWithTarget(target: cc.Node): void {
        cc.ActionInterval.prototype['startWithTarget'].apply(this, arguments);
        this._initial_x = target.x;
        this._initial_y = target.y;
    }

    public stop(): void {
        this.getTarget().setPosition(new cc.Vec2(this._initial_x, this._initial_y));

        cc.ActionInterval.prototype['stop'].apply(this);
    }
}



export let nameTemplateArray = [

    "The Armor",
    "My Arsenal",
    "Annihilator ",
    "Anomaly",
    "Arbitrage",
    "Team Arsenic",
    "Alien",
    "Abyss",
    "Agitator",
    "Agony",
    "Agrippa",
    "Albatross",
    "Amaretto",
    "Amazon",
    "Ambush",
    "Angon",
    "Animus",
    "Trink",
    "Twitch",
    "Username",
    "Digital",
    "Strong Position",
    "Ultimate Guide",
    "Courtesy flush",
    "Philiprex",
    "IHasAnkles",
    "Iammodest",
    "Iampatient",
    "IamPhilip",
    "DonkeyMilk",
    "MindOfPhilip",
    "Gamerdonkey",
    "DrThoughtless",
    "ItIsYeDonkey",
    "Ph1l1p",
    "Donkey Boy",
    "Donkey Girl",
    "Donkey Person",
    "IHasArms",
    "Total Donkey",
    "The Gaming Donkey",
    "Mr Game Donkey",
    "Ms Game Donkey"
];

