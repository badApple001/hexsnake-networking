
/*



* 通用工具库
* Toolkit.ts
*
* 通用于所有ts语言的引擎
*
* 程序猿:
*   ChenJC
* 最后修改日期:
*    2020/06/09
*/

import { IRect, IVec2 } from "./DefineData"

export module Toolkit {


    export function IsAndroid() {
        return (/android/i.test(navigator.userAgent));
    }

    /**
     * 随机范围内的浮点数
     * @param max 最大值
     * @param min 最小值 默认0
     * @return min ~ max  包含 min,max
     */
    export function RandomFloat(max: number, min?: number) {
        min = min ? min : 0;
        return Math.random() * (max - min) + min;
    }


    /**
     * 随机整数
     * @param max 最大值
     * @param min 最小值 默认 0
     * @return min ~ max  包含 min,max
     */
    export function RandomInt(max: number, min?: number) {
        return Math.floor(RandomFloat(max, min));
    }


    /**
     * 返回当前上下文发布的语言
     * @returns
     */
    export function GetCtxLanguage() {
        return window['hwCurLanguage'] || 'en';
    }

    /**
     * 返回当前上下文发布的渠道
     * @returns
     */
    export function GetCtxChannel() {
        return window['hwCurChannel'] || 'Applovin';
    }


    /**
     *
     * @param x 点 X
     * @param y 点 Y
     * @param rect 平行四边形的点  [左下,左上,右上,右下]
     */
    export function ptInparallelogram(x, y, rect: IVec2[]) {

        let A = rect[0];
        let B = rect[1];
        let C = rect[2];
        let D = rect[3];

        let a = (B.x - A.x) * (y - A.y) - (B.y - A.y) * (x - A.x);
        let b = (C.x - B.x) * (y - B.y) - (C.y - B.y) * (x - B.x);
        let c = (D.x - C.x) * (y - C.y) - (D.y - C.y) * (x - C.x);
        let d = (A.x - D.x) * (y - D.y) - (A.y - D.y) * (x - D.x);

        if ((a > 0 && b > 0 && c > 0 && d > 0) || (a < 0 && b < 0 && c < 0 && d < 0)) {
            return true;
        }
        // AB X AP = (b.x - a.x, b.y - a.y) x (p.x - a.x, p.y - a.y) = (b.x - a.x) * (p.y - a.y) - (b.y - a.y) * (p.x - a.x);
        // BC X BP = (c.x - b.x, c.y - b.y) x (p.x - b.x, p.y - b.y) = (c.x - b.x) * (p.y - b.y) - (c.y - b.y) * (p.x - b.x);
        return false;
    }

    /**
     * 判断点是否在矩形区域内
     * @param x
     * @param y
     * @param rect
     */
    export function ptInRect(x, y, rect: IRect) {
        return x > rect.x && x < rect.x + rect.width && y > rect.y && y < rect.y + rect.height;
    }

    /**
     * 判断两矩形是否相交
     * @param A
     * @param B
     */
    export function intersects(A: IRect, B: IRect) {
        return !((A.x + A.width) < B.x || (B.x + B.width) < A.x || (A.y + A.height) < B.y || (B.y + B.height) < A.y);
    }

    /**
    * Clamps a value between a minimum float and maximum float value.
    * @method clamp
    * @param {number} val
    * @param {number} min
    * @param {number} max
    * @return {number}
    */
    export function Clamp(val, min, max) {
        return val < min ? min : val > max ? max : val;
    }

    /**
     *
     * @param text 文本
     * @param fontColor 字体颜色  默认颜色  red,blue,green,yellow,white,black
     * @param bgColor 背景颜色 默认颜色  red,blue,green,yellow,white,black
     */
    export function log(text: string, fontColor: string = "#000000", bgColor: string = "#FFFFFF") {

        //使用默认字体颜色
        if (fontColor.indexOf('#') == -1) {
            switch (fontColor) {
                case "red": {
                    fontColor = "#FE0404";
                }
                    break;
                case "green": {
                    fontColor = "#00FB00";
                }
                    break;
                case "blue": {
                    fontColor = "#409EFA";
                }
                    break;
                case "yellow": {
                    fontColor = "#FFFF00";
                }
                    break;
                case "white": {
                    fontColor = "#FFFFFF";
                }
                    break;
                case "black": {
                    fontColor = "#000000";
                }
                    break;
                default: {
                    fontColor = "#FFFFFF";
                }
            }
        }

        //使用默认背景颜色
        if (bgColor.indexOf('#') == -1) {
            switch (bgColor) {
                case "red": {
                    bgColor = "#FE0404";
                }
                    break;
                case "green": {
                    bgColor = "#00FB00";
                }
                    break;
                case "blue": {
                    bgColor = "#409EFA";
                }
                    break;
                case "yellow": {
                    bgColor = "#FFFF00";
                }
                    break;
                case "white": {
                    bgColor = "#FFFFFF";
                }
                    break;
                case "black": {
                    bgColor = "#000000";
                }
                    break;
                default: {
                    bgColor = "#000000";
                }
            }
        }

        //当字体颜色和背景颜色相同时 使用普通打印 并提示错误
        if (fontColor == bgColor) {
            console.error("The font color cannot be the same as the background color");
            console.log(text);
            return;
        }

        //打印带框颜色日志
        console.log(`%c${text}`, `color:${fontColor};background:${bgColor};padding:3px 6px;`);
    }

    /**
    * 打印颜色输出
    * @param content 文本内容
    * @param fontColor 字体颜色 html颜色格式
    * @param bgColor 背景颜色 html颜色格式
    */
    export function log2(content: string, fontColor: string = "#5EE997", bgColor: string = "#FFFFFF") {
        //打印颜色日志
        console.log(`%c${content}`, `color:${fontColor};background:${bgColor};`);
    }


    /**
     *  跟踪日志
     *  对颜色进行了规范
     *  在log基础上 对输出内容追加 前缀>>>>>>>>>>>>>>>>>>>
     */
    export function logTrace(text: string) {
        CC_DEBUG && log(`>>>>>>>>>>>>>>>>>>>${text}`, "green", "#252526");
    }

    /**
     *  报错日志
     *  对颜色进行了规范
     *  在log基础上 对输出内容追加 前缀%%%%%%%%%%%%%%%%%%
     */
    export function logFailure(text: string) {
        CC_DEBUG && log(`%%%%%%%%%%%%%%%%%%${text}`, "read", "#0C0C0C");
    }


    /**
     * 插值
     * @param from
     * @param to
     * @param ratio
     * @returns
     */
    export function lerp(from, to, ratio) {
        return from + (to - from) * ratio;
    }


    /**
     * 写入cookie
     * cookie 将被保存 30 天
     * @param name
     * @param value
     */
    export function setCookie(name, value) {
        var Days = 30;
        var exp = new Date();
        exp.setTime(exp.getTime() + Days * 24 * 60 * 60 * 1000);
        document.cookie = name + "=" + escape(value) + ";expires=" + exp.toUTCString();
    }

    /**
     * 读取cookies
     * @param name
     * @returns defaultValue
     */
    export function getCookie(name) {
        var arr, reg = new RegExp("(^| )" + name + "=([^;]*)(;|$)");
        if (arr = document.cookie.match(reg))
            return unescape(arr[2]);
        else
            return null;
    }


    /**
     * 删除cookies
     * @param name
     */
    export function delCookie(name) {
        var exp = new Date();
        exp.setTime(exp.getTime() - 1);
        var cval = getCookie(name);
        if (cval != null)
            document.cookie = name + "=" + cval + ";expires=" + exp.toUTCString();
    }

}
