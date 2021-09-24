// Learn TypeScript:
//  - https://docs.cocos.com/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html

import FrameSyncMgr from "./FrameSyncMgr";
import NetCore from "./NetCore";

const { ccclass, property } = cc._decorator;

@ccclass
export abstract class FrameBehavior extends cc.Component {

    netCore: NetCore;
    gid:number = -1;

    INIT( gid:number ){
        FrameSyncMgr.instance.recordSelf(gid,this);
        this.netCore = NetCore.instance;
        this.gid = gid;
    }

    SEND(type, pkt) {
        pkt.gid = this.gid;
        this.netCore.send(type, pkt);
    }

    abstract frameSync(frame_data);
}
