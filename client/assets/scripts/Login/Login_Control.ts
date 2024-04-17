import GameManager from "../TRPC/GameManager";

const { ccclass, property } = cc._decorator;

@ccclass
export default class Login_Control extends cc.Component {
 

    _editor_name: cc.EditBox = null;
    _erro_tip: cc.Label = null;

    onLoad() {

        this._editor_name = cc.find("Canvas/Editor_Name").getComponent(cc.EditBox);
        this._erro_tip = cc.find("Canvas/erro_tip").getComponent(cc.Label);
        this._erro_tip.node.active = false;

        let gmgr = GameManager.Ins;
        //断线 2 秒后自动重连
        gmgr.client.flows.postDisconnectFlow.push(v => {
            setTimeout(() => {
                GameManager.Ins.join();
            }, 2000)
            return v;
        });


        // NetCore.instance.on("on-link-succeed", (e) => {
        //     Toolkit.log(">>>>>>连接成功", "g", "black");
        // }, this);

        // NetCore.instance.on("login_result", (r) => {
        //     if (r.fail == 0) {
        //         gameData.loginData = r;
        //         gameData.loginData.name = this._editor_name.string;
        //         cc.director.loadScene("game");
        //         this._erro_tip.node.active = false;
        //     }
        //     else {

        //         this.showTip("昵称已存在!!!");
        //         Toolkit.log(`login fail:\n ${r}`, 'r', 'black');
        //     }
        // }, this);

        // NetCore.instance.on("on-link-erro", (r) => {
        //     this.showTip("服务器连接失败!!!");
        // }, this);
    }


    showTip(str) {
        this._erro_tip.node.active = true;
        if (this._erro_tip.node.getNumberOfRunningActions() > 0)
            this._erro_tip.node.stopAllActions();

        this._erro_tip.string = str;
        this._erro_tip.node.runAction(cc.sequence(cc.delayTime(4.0), cc.callFunc(() => {
            this._erro_tip.node.active = false;
        })));
    }


    private req_login = false;
    login() {
        if (this._editor_name.string.length < 1 || this.req_login) {

            this.showTip("名称不能为空!!!");
            return;
        }
        this.req_login = true;
        // NetCore.instance.send("login", {
        //     name: this._editor_name.string
        // });

        GameManager.Ins.join(this._editor_name.string);
    }


    protected lateUpdate(): void {
        if (GameManager.Ins.selfPlayerId != -1) {
            this.enabled = false;
            cc.director.loadScene("game");
        }
    }
}