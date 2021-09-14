const { ccclass, property } = cc._decorator;

@ccclass
export default class Login_Control extends cc.Component {


    _editor_name: cc.EditBox = null;
    _erro_tip: cc.Label = null;
    onLoad() {

        //this._editor_name = cc.find("Canvas/Editor_Name").getComponent(cc.EditBox);
        this._erro_tip = cc.find("Canvas/erro_tip").getComponent(cc.Label);
        this._erro_tip.node.active = false;

        //UNetMgr.model = UNetMgr.SyncModel.SelfNoDelay;
    }


    onJoinRoot() {

        // CC_DEBUG && console.log("Try join room");

        // if (this._editor_name.string.length < 1) {
        //     this._erro_tip.node.active = true;
        //     this._erro_tip.string = "username cannot be empty!";
        // }

        // let success = () => {
        //     CC_DEBUG && console.log("join room success");

        //     let name = this._editor_name.string;
        //     UNetMgr.JoinRoom(name);
        // }
        
        // UNetMgr.event.on('join_result', (v) => {
        //     this.node.active = false;
        //     //进入游戏场景
        //     console.log(v);
        // }, null)

        // let fail = () => {
        //     CC_DEBUG && console.log("join room fail");
        //     this._erro_tip.string = "username already exists!";
        // }

        // UNetMgr.StartConnect({
        //     isSSL: false, // wss 时参数为true，并且提供证书的cert路径
        //     cert: '', //相对于resource的路径
        //     host: '192.168.3.17',
        //     port: '9527',
        //     autoConnect: true //非人为断开时自动重连
        // }, {
        //     id: 0
        // }, success, fail)
    }

}
