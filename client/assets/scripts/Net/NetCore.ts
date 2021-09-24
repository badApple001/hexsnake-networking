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

    private isConnected = false;
    private static _instance: NetCore = null;
    public static get instance() {
        if (!this._instance) {
            this._instance = new NetCore();
            this._instance.init(ServerConfig);
        }
        return this._instance;
    }

    /* -----------------------------private method-------------------------------- */
    private onopen(ev: Event) {
        let handle = this.handler['on-link-succeed'];
        handle && handle.functor.call(handle.caller, ev);
        this.isConnected = true;
    }
    private handler: {
        [key: string]: { caller: any, functor: Function }
    } = {};
    private onreceive(result: MessageEvent) {
        try {
            let obj = JSON.parse(result.data);
            let handle = this.handler[obj.type];
            handle.functor.call(handle.caller, obj);
        }
        catch (e) {
            console.log(`NetCore.receive erro: ${e}`);
        }
    }
    private onclose(ev: CloseEvent) {
        let handle = this.handler['on-link-close'];
        handle && handle.functor.call(handle.caller, ev);
        this.isConnected = false;
    }
    private onerror(ev: Event) {
        let handle = this.handler['on-link-erro'];
        handle && handle.functor.call(handle.caller, ev);
        this.isConnected = false;
    }
    private createSocket(address) {
        this.ws = new WebSocket(address);
        this.ws.onopen = this.onopen.bind(this);
        this.ws.onclose = this.onclose.bind(this);
        this.ws.onerror = this.onerror.bind(this);
        this.ws.onmessage = this.onreceive.bind(this);
    }
    private ws: WebSocket = null;
    private init(config) {
        let address = config.ip;
        this.createSocket(address);
    }
    /* -----------------------------private method-------------------------------- */

    /* -----------------------------public method-------------------------------- */
    public send(type: string, msgpkt: any) {
        msgpkt.type = type;
        this.isConnected && this.ws.send(JSON.stringify(msgpkt));
    }
    public on(type: string, functor: Function, caller: any) {
        if (this.handler[type] != undefined) {
            CC_DEBUG && console.log(">>>>>重复绑定同一事件");
        }
        this.handler[type] = {
            functor,
            caller
        };
    }
    /* -----------------------------public method-------------------------------- */

}
