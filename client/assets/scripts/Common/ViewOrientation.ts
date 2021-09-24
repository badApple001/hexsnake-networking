

/*

 * 适配横竖屏
 *
 *
 * 程序猿:
 *   ChenJC
 * 最后修改日期:
 *    2020/06/09
 */



import Watcher from "./Watcher";

const { ccclass, property } = cc._decorator;

export enum EOrientation {
    /**
     * 横屏
     */
    LANDSCAPE = 0,

    /**
     * 竖屏
     */
    PORTRAIT = 1
}

@ccclass
export default class ViewOrientation extends cc.Component {

    private canvas: cc.Canvas = null;
    private canvasframe = {
        min: 0,
        max: 0
    }

    private oldOrientation = EOrientation.PORTRAIT;
    start() {
        this.canvas = cc.Canvas.instance;
        let canvasSize = this.canvas.designResolution;

        this.canvasframe.min = Math.min(canvasSize.width, canvasSize.height);
        this.canvasframe.max = Math.max(canvasSize.width, canvasSize.height);

        //初始化方向
        this.oldOrientation = canvasSize.width > canvasSize.height ? EOrientation.LANDSCAPE : EOrientation.PORTRAIT;
        window['AdaptiveProc'] = () => {

            let curOrientation = window.innerWidth > window.innerHeight ? EOrientation.LANDSCAPE : EOrientation.PORTRAIT;
            let frameSize = cc.view.getFrameSize();

            /**
             * 竖屏
             */
            if (curOrientation == EOrientation.PORTRAIT && curOrientation != this.oldOrientation) {
                //刷新记录方向
                this.oldOrientation = curOrientation;

                //设置视角方向为竖屏
                cc.view.setOrientation(cc.macro.ORIENTATION_PORTRAIT);

                //更正视图尺寸
                if (frameSize.width > frameSize.height) {
                    //视图尺寸
                    cc.view.setFrameSize(frameSize.height, frameSize.width)
                }

                //画布大小
                this.canvas.designResolution = cc.size(this.canvasframe.min, this.canvasframe.max);

                Watcher.dispatch(Watcher.ON_VIEW_RESIZE, curOrientation);
            }
            else if (curOrientation == EOrientation.LANDSCAPE && curOrientation != this.oldOrientation) {
                //刷新记录方向
                this.oldOrientation = curOrientation;

                //设置视角方向为横屏
                cc.view.setOrientation(cc.macro.ORIENTATION_LANDSCAPE);

                //更正视图尺寸
                if (frameSize.width < frameSize.height) {
                    //视图尺寸
                    cc.view.setFrameSize(frameSize.height, frameSize.width)
                }

                //画布大小
                this.canvas.designResolution = cc.size(this.canvasframe.max, this.canvasframe.min);

                Watcher.dispatch(Watcher.ON_VIEW_RESIZE, curOrientation);
            }

        }

        cc.view.setResizeCallback(window['AdaptiveProc']);
        window['AdaptiveProc'].call(this); //主动调用一次

    }
}
