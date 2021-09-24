import {FrameBehavior} from "./FrameBehavior";
import NetCore from "./NetCore";

const {ccclass, property} = cc._decorator;

@ccclass
export default class FrameSyncMgr {

  
    private static _instance:FrameSyncMgr = null;
    public static get instance(){

        if(this._instance == null){
            this._instance = new FrameSyncMgr();
            this._instance.init();
        }
        return this._instance;
    }

    private elements:{ 
        [gid:string]:FrameBehavior
    } = {}
    public static deltaTime = 0; //消息间隔时间增量
    private init(){
        const elements = this.elements;
        
        let lastTime = performance.now()  
        let now;
        let fdata;
        NetCore.instance.on("f",(data)=>{

            now = performance.now();
            FrameSyncMgr.deltaTime = now - lastTime;
            lastTime = now;

            let actions = data.actions;
            for(let gid in actions){
                fdata = actions[gid];
                elements[gid] && elements[gid].frameSync(fdata);
            }

        },this);
    }

    public recordSelf( gid, element: FrameBehavior ){
        
        if( gid in this.elements ){
            throw new Error(">>>> gid重复 !!!!");
        }
        this.elements[gid] = element;
    }
}
