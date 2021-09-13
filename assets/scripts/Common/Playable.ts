
/*
 *
 * 试玩工具部分
 * 公用方法 在 Toolkit文件中
 *
 * 程序猿: ChenJC
 * 最后修改日期: 2020/06/09
 *
 */

import { IBuriedPointData } from "./DefineData";
import { Toolkit } from "./Toolkit"

/**
 *
 *  @INIT
 *  @READY
 *  @END
 *  @INSTALL
 *
 *
 *
 *
 *  js || 其它h5语言调用 请先获取到对应的window对象 一般情况下 window对象都是默认声明每个引擎里的
 *
 *  常见的 egret,laya,cocos... 如果你使用原生html写  你也可以在js代码里正常调用window对象
 *
 *  js的处理方法:
 *
 *  //初始化 试玩jdk调用
 *  window.hgPlayableSDK.init && window.hgPlayableSDK.init();
 *
 *  //资源加载就绪 调用
 *  window.hgPlayableSDK.ready && window.hgPlayableSDK.ready();
 *
 *  //试玩结束页展示的时候 或者 游戏结束的时候 调用
 *  window.hgPlayableSDK.end && window.hgPlayableSDK.end()
 *
 *  //试玩点击跳转商店的时候调用 应是一个简单的Button事件驱动
 *  window.hgPlayableSDK.install && window.hgPlayableSDK.install();
 *
 */
export default class Playable {

    static hgPlayableSDK: any;

    /**
     * 试玩初始化
     *
     */
    static INIT() {

        try {

            Playable.hgPlayableSDK = window['hgPlayableSDK'] || {};
            Playable.hgPlayableSDK.init && Playable.hgPlayableSDK.init();
            Toolkit.log("playable init finish", "#89DAF7", "#000000");
        }
        catch (e) {
            console.error(`PLAYABLE.INIT => : ${e}`);
        }
    }

    /**
     * 试玩开始
     * 当场景加载完毕后进行调用
     *
     */
    static READY() {
        try {

            Playable.hgPlayableSDK.ready && Playable.hgPlayableSDK.ready();
            Toolkit.log("playable preload finish", "#89DAF7", "#000000");
        }
        catch (e) {
            console.error(`PLAYABLE.READY => : ${e}`);
        }
    }


    /**
     * 试玩结束时调用
     *
     * 需要 调用试玩结束的 渠道 需要调用对应的接口或者 抛出事件
     *
     */
    static END() {
        try {
            Playable.end = true;
            Playable.hgPlayableSDK.end && Playable.hgPlayableSDK.end();
            Toolkit.log("playable end", "#89DAF7", "#000000");
        } catch (error) {
            console.error(`PLAYABLE.END => : ${error}`);
        }
    }


    static end = false;
    /**
     * 安装事件
     * 当玩家点击安装时 跳转至应用商店
     * 自动识别平台
     * 需要注意 跳转API的顺序
     *
     */
    static INSTALL() {
        //跳转下载
        try {
            if(!Playable.end)
                Playable.END();

            let flag = 'install' in Playable.hgPlayableSDK;

            if (flag){
                //基兰SDK
                Playable.hgPlayableSDK.install && Playable.hgPlayableSDK.install();
            }
            else {
                //试玩模板SDK
                if (window["hw_playable_install"]) {
                    Toolkit.log("Install Hellowd SDK success!", "green", "white");
                    window["hw_playable_install"]();
                } else {
                    Toolkit.log("This is template,Need Hellowd SDK", "red", "#white");
                }
            }

        }
        catch (e) {

            console.error(`PLAYABLE.INSTALL => : ${e}`);
        }
    }






    //#region 穿山甲广告SDK埋点

    /**
     * 玩家第一次互动
     */
    static FAST_INTERACTION() {

        if (null != window['playableSDK']) {
            window['playableSDK'].sendEvent('startPlayPlayable');
        }
    }


    /**
     * 埋点  在玩家进入某一环节 or 点击某一个跳转时 调用
     * @param event  clickContent | enterSection;
     * @param data  IClick_Content_Data | IEnter_Section_Data
     */
    static ENTER_SECTION(event: string, data: IBuriedPointData) {
        if (window["playableSDK"] != null) {

            window["playableSDK"].sendEvent(event, data)
        }

    }


    //#endregion


}
