
/*

 *
 * name:
 * .本地事件管理中心
 *
 * function:
 * .一个事件监听中心
 * .可以通过 静态方法on 绑定事件
 * .可以通过 静态方法off 移除事件
 * .可以通过 静态方法post 派发事件,绑定了该事件的所有对象将触发回调
 * .它是一个静态类 你可以再 任意地方调用它
 *
 *
 * 程序猿:
 *   ChenJC
 * 修改日期:
 *    2020/06/04
 *
 *
 * 事件:
 * 修改: 类名 LocalEventCenter to Watcher
 * 诱因: 类名过长
 *
 * 修改日期: 2020/11/13
 */





export default class Watcher {

    /**
     * 当屏幕发生翻转时 或者 大小发生变化时 掉用   参数1 enum EOrientation
     */
    public static ON_VIEW_RESIZE = 'ON_VIEW_RESIZE';

    /**
     * 跳动金币至目标值
     */
    public static JUMP_MONEY = 'JUMP_MONEY';

    /**
     * 跳动金币 增加一定量的金币
     */
    public static ADDITION_MONEY = 'ADDITION_MONEY';


    private static _handls: {
        [key: string]: {
            caller: any,
            handl: Function
        }[]
    } = {};



    /**
     * 监听事件
     * @param event 事件名称
     * @param caller 作用域
     * @param handl 回调方法
     */
    public static addEventListener(event: string, caller: any, handl: Function): void {

        if (undefined == Watcher._handls[event]) {
            Watcher._handls[event] = [];
        }

        Watcher._handls[event].push({ caller, handl });
    }

    /**
     * 移除监听
     * @param event 事件名称
     * @param caller 作用域
     * @param handl 回调方法
     */
    public static removeEvenetListener(event: string, caller: any, handl: Function = undefined): void {

        if (undefined != Watcher._handls[event]) {
            //获取事件队列
            const list = Watcher._handls[event];
            //
            if (list instanceof Array) {
                //遍历所有事件
                for (let i = 0, count = list.length; i < count; i++) {
                    let e = list[i];

                    //移除对应事件
                    if (e.caller == caller && (undefined == handl || handl == e.handl)) {
                        list[i] = list[count - 1];
                        list.pop();
                    }
                }
            }
        }
    }


    /**
     * 移除监听者的所有事件
     * @param caller 监听者
     */
    public static removeAllListener(caller: any) {
        for (let k in Watcher._handls) {

            const list = Watcher._handls[k];
            //遍历所有事件
            for (let i = 0, count = list.length; i < count; i++) {

                //移除对应事件
                if (list[i].caller == caller) {
                    list[i] = list.pop();
                }
            }
        }
    }

    /**
     * 派发事件
     * @param event 事件
     * @param params 参数
     */
    public static dispatch(event: string, ...params: any[]) {

        if (undefined != Watcher._handls[event]) {

            const list = Watcher._handls[event];
            for (let t of list) {
                t.handl.call(t.caller, ...params);
            }

        }

    }

}




export enum HexsnakeEvent {

    FirstInteraction = "FirstInteraction",
    SortRank = "SortRank",
    Death = "Death",
    CameraShake = "CameraShake",
    PathGridLoaded = "PathGridLoaded",
    GameOverEvent = "GameOverEvent"
}
