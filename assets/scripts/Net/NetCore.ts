import { FuncSignature } from "../Common/DefineData";
import Watcher from "../Common/Watcher";
import { ServerConfig } from "./ServerConfig";
const { ccclass, property } = cc._decorator;



/**
 * 
 * 联网模块
 * 
 * @function instance 获取实例 如果未初始化 将首次初始化一次
 * 
 * 
 * TODO 重连机制
 * 
 */
@ccclass
export default class NetCore {


    private static _instance: NetCore = null;
    public static get instance() {
        if (!this._instance) {
            this._instance = new NetCore();
            this._instance.init(ServerConfig);
        }
        return this._instance;
    }


    /* -----------------------------private method-------------------------------- */
    private onopen(ev: Event){
        Watcher.dispatch("server-linked");
    }
    private handler: {
        [key: string]: FuncSignature
    } = {};
    private receive(result: MessageEvent){

    }
    private onclose(ev: CloseEvent){

    }
    private onerror(ev: Event){

    }
    private createSocket(address) {
        this.ws = new WebSocket(address);
        this.ws.onopen = this.onopen.bind(this);
        this.ws.onclose = this.onclose.bind(this);
        this.ws.onerror = this.onerror.bind(this);
        this.ws.onmessage = this.receive.bind(this);
    }
    private ws: WebSocket = null;
    private init(config) {
        let address = config.ip;
        this.createSocket(address);
    }
    /* -----------------------------private method-------------------------------- */


    /* -----------------------------public method-------------------------------- */
    public send( type:string, msgpkt:any ){

    }
    /* -----------------------------public method-------------------------------- */
 
}
