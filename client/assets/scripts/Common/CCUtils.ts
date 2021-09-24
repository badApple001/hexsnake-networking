

/*
 * 
 * CC 专属工具集
 * 公用部分 在 Toolkit文件中
 * 
 * 程序猿: ChenJC
 * 最后修改日期: 2020/06/09
 * 
 */

import { Toolkit } from "./Toolkit";



export module CCUtils {

    /**
     * 递归查找子节点
     * @param node 当前节点
     * @param name 子节点 || 孙子 || 曾孙子 名
     */
    export function FindChildHelper(node: cc.Node, name: string): cc.Node {

        if (node.name == name) {
            return node;
        }

        if (node.childrenCount == 0)
            return null;

        let target: cc.Node = null;
        for (let c of node.children) {
            target = FindChildHelper(c, name);
            if (target != null)
                break;
        }
        return target;
    }


    /**
     * 递归找到子节点身上的组件
     * @param node 节点
     * @param name 目标节点名称
     * @param type 目标组件类型
     */
    export function FindChildComponentHelper<T extends cc.Component>(node: cc.Node, name: string, type: string | { prototype: T }): T {

        let component: any = typeof type === 'string' ? <string>type : <{ prototype: T }>type;
        let target = FindChildHelper(node, name);
        if (null != target)
            return target.getComponent(component);
    }

    /**
     * 存储一个item 
     * @param name 
     */
    export function setItem(name: string, gameObject: any) {
        if (null == name || null == gameObject) return;
        let value = JSON.stringify(gameObject)
        if (value) {
            cc.sys.localStorage.setItem(name, value)
        }
    }


    /**
     * 获取一个本地item
     * @param name 
     */
    export function getItem(name: string) {
        let data = cc.sys.localStorage.getItem(name);
        if (data) {
            return JSON.parse(data);
        }
        return null;
    }

    /**
     * 
     * @param jsonFileNm Resources 下 json文件名
     * @param result 回调
     */
    export function readLocalData(jsonFileNm: string, result: { success: (json: any) => void, fail: () => void }) {

        CC_DEBUG && Toolkit.logTrace(`load ${jsonFileNm}`)

        //加载资源
        cc.loader.loadRes(
            jsonFileNm,
            (err, data) => {
                if (err) {
                    console.error(err)
                    result.fail()
                    return
                }

                if (data != null)
                    result.success(data.json)
                else {
                    CC_DEBUG && Toolkit.logFailure(`read ${jsonFileNm} data is null`);
                    result.fail()
                }
            })

    }


    export function Conversion2LocalPosition(target: cc.Node, curNode: cc.Node) {
        let worldpos = target.convertToWorldSpaceAR(cc.Vec2.ZERO);
        let localNode = curNode.parent || curNode;
        return localNode.convertToNodeSpaceAR(worldpos);
    }

    /**
     * 将base64转成spriteFarme
     * @param base64Data base64数据
     * @param format jpeg,png
     */
    export function base64ToSpriteFrame(base64Data: string, format = "jpeg") {
        let url = `data:image/${format};base64,${base64Data}`;
        let img = new Image();
        img.src = url;
        let texture = new cc.Texture2D();
        texture.initWithElement(img);
        texture.handleLoadedTexture();
        return new cc.SpriteFrame(texture);
    }


    /**
     * 设置精灵材质 默认设置第一个材质
     * @param sprite Sprite组件
     * @param uniformName uniform 属性名
     * @param value 值
     * @param index 材质列表下表 默认0
     */
    export function SetDefaultMaterialValue(sprite: cc.Sprite, uniformName: string, value: any, index: number = 0) {
        let material: cc.Material = sprite.getMaterial(index);
        material["setProperty"](uniformName, value);
        sprite.setMaterial(index, material);
    }



    /**
     * 鼠标样式    
     * ps: url 需要 搭配 auto 一起使用
     * 
     */
    export const enum ECursorStyle {
        /** 需被使用的自定义光标的URL */
        url = "url",
        /** 默认光标（通常是一个箭头）*/
        default = "default",
        /** 默认。浏览器设置的光标。*/
        auto = "auto",
        /** 光标呈现为十字线。*/
        crosshair = "crosshair",
        /** 光标呈现为指示链接的指针（一只手）*/
        pointer = "pointer",
        /** 此光标指示某对象可被移动。*/
        move = "move",
        /** 此光标指示矩形框的边缘可被向右（东）移动。*/
        e_resize = "e-resize",
        /** 此光标指示矩形框的边缘可被向上及向右移动（北/东）。*/
        ne_resize = "ne-resize",
        /** 此光标指示矩形框的边缘可被向上及向左移动（北/西）。*/
        nw_resize = "nw-resize",
        /** 此光标指示矩形框的边缘可被向上（北）移动。*/
        n_resize = "n-resize",
        /** 此光标指示矩形框的边缘可被向下及向右移动（南/东）。*/
        se_resize = "se-resize",
        /** 此光标指示矩形框的边缘可被向下及向左移动（南/西）。*/
        sw_resize = "sw-resize",
        /** 此光标指示矩形框的边缘可被向下移动（北/西）。*/
        s_resize = "s-resize",
        /** 此光标指示矩形框的边缘可被向左移动（西）*/
        w_resize = "w-resize",
        /** 此光标指示文本。*/
        text = "text",
        /** 此光标指示程序正忙（通常是一只表或沙漏）。*/
        wait = "wait",
        /** 此光标指示可用的帮助（通常是一个问号或一个气球）。*/
        help = "help"
    }

    /**光标设置 */
    export class Cursor {
        /**当前光标样式 */
        public static lastStyle: string = ECursorStyle.default;

        /** 设置光标样式 */
        public static SetCursorStyle(style: ECursorStyle, url = "") {
            if (style == url) {
                cc.game.canvas.style.cursor = `url(${url}),auto`;
            }
            else {
                cc.game.canvas.style.cursor = style;
            }

            Cursor.lastStyle = cc.game.canvas.style.cursor;
        }

        /**显示或隐藏光标 */
        public static set enabled(value: boolean) {
            cc.game.canvas.style.cursor = value ? "none" : Cursor.lastStyle;
        }

        /**获取光标显示状态 */
        public static get enabled() {
            return cc.game.canvas.style.cursor == "none";
        }

    }

    /**
     * 
     * @param target 目标所持节点  this.node 而非 this
     * @param componentName componentName 自定义的脚本名 可以在 编辑器界面 查看当前节点脚本名
     * @param functionSign 函数签名 函数名称
     * @param btn 目标按钮 如果不为空 将自动为其绑定当前事件
     * @param cc.Component.EventHandler 实例
     */
    export function RegistHandler(target: cc.Node, componentName: string, functionSign: string, btn?: cc.Button): cc.Component.EventHandler {
        let handler = new cc.Component.EventHandler();
        handler.target = target;
        handler.component = componentName;
        handler.handler = functionSign;

        //往btn里添加事件
        if (btn != null) {
            btn.clickEvents.push(handler);
        }
        return handler;
    }



    export function distance(a: cc.Vec2, b: cc.Vec2) {

        let _x = a.x - b.x;
        let _y = a.y - b.y;
        return Math.sqrt(_x * _x + _y * _y);
    }
}




