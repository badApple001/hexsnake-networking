
/*


修改事件: 视频播放辅助类
修改时间: 2020/11/19
程序猿: ChenJC


*/



import Watcher from "./Watcher";

const { ccclass, property } = cc._decorator;

@ccclass
export default class VideoTool extends cc.Component {


    // onLoad () {}

    private videoPlayer: cc.VideoPlayer = null;
    private isReaded = false;
    start() {
        this.videoPlayer = this.getComponent(cc.VideoPlayer);
        this.node.on('ready-to-play',this.onRead,this);
        this.node.on('touchstart',this.onTouchPlay,this);
    }

    onTouchPlay(){
        if( this.isReaded && this.videoPlayer ){
            this.videoPlayer.play();
        }
    }

    onRead(){
        this.isReaded = true;
    }

    // play(){

    //     this.videoPlayer.play();
    //     this.videoPlayer.node.on('ready-to-play', this.playFinish, this);
    // }


    // playFinish(event) {
    //     console.log(`playFinish: ${event}`);
    //     this.node.active = false;
    // }

    // update (dt) {}
}
