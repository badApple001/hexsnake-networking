import { BaseWsClient } from 'tsrpc-base-client';
import { WsClient as WsClientBrowser } from "tsrpc-browser";
import { WsClient as WsClientMiniapp } from "tsrpc-miniapp";
import { ServiceType,serviceProto } from './shared/protocols/serviceProto';
import { MsgFrame } from './shared/protocols/server/MsgFrame';
import { ClientInput, MsgClientInput } from './shared/protocols/client/MsgClientInput';
import { GameSystem, GameSystemState } from './shared/game/GameSystem';
import { gameConfig } from './shared/game/gameConfig';

export default class GameManager {

    client: BaseWsClient<ServiceType>;
    gameSystem = new GameSystem();
    lastServerState: GameSystemState = this.gameSystem.state;
    lastRecvSetverStateTime = 0;
    selfPlayerId: number = -1;
    lastSN = 0;

    get state() {
        return this.gameSystem.state;
    }

    private static _ins: GameManager = null;
    public static get Ins(): GameManager {
        if (!GameManager._ins) {
            GameManager._ins = new GameManager();
        }
        return GameManager._ins;
    }

    constructor() {

        let MINIGAME = cc.sys.platform == cc.sys.WECHAT_GAME;

        // Use browser client or miniapp client depend on the platform 
        let client = this.client = new (MINIGAME ? WsClientMiniapp : WsClientBrowser)(serviceProto, {
            server: `ws://${location.hostname}:${gameConfig.port}`,
            json: true,
            // logger: console,
            heartbeat: {
                interval: 1000,
                timeout: 5000
            }
        });
        client.listenMsg('server/Frame', msg => { this._onServerSync(msg) });

        // 模拟网络延迟 可通过 URL 参数 ?lag=200 设置延迟
        let res = location.search.match(/\blag=(\d+)/);
        if (res && res.length > 1) {
            let networkLag = parseInt(res[1] || '0');
            if (networkLag) {
                client.flows.preRecvDataFlow.push(async v => {
                    await new Promise(rs => { setTimeout(rs, networkLag) })
                    return v;
                });
                client.flows.preSendDataFlow.push(async v => {
                    await new Promise(rs => { setTimeout(rs, networkLag) })
                    return v;
                });
            }
        }

        (window as any).gm = this;
    }

    private player_name: string = null;
    async join(player_name: string = null): Promise<void> {

        this.player_name = player_name ? player_name : this.player_name;

        if (!this.client.isConnected) {
            let resConnect = await this.client.connect();
            if (!resConnect.isSucc) {
                await new Promise(rs => { setTimeout(rs, 2000) })
                return this.join();
            }
        }

        let ret = await this.client.callApi('Join', {
            player_name: this.player_name
        });

        if (!ret.isSucc) {
            if (confirm(`加入房间失败\n${ret.err.message}\n是否重试 ?`)) {
                return this.join();
            }
            else {
                return;
            }
        }

        this.gameSystem.reset(ret.res.gameState);
        this.lastServerState = Object.assign({}, ret.res.gameState);
        this.lastRecvSetverStateTime = Date.now();
        this.selfPlayerId = ret.res.playerId;
    }

    private _onServerSync(frame: MsgFrame) {
        // 回滚至上一次的权威状态
        this.gameSystem.reset(this.lastServerState);

        // 计算最新的权威状态
        for (let input of frame.inputs) {
            this.gameSystem.applyInput(input);
        }
        this.lastServerState = Object.assign({}, this.gameSystem.state);
        this.lastRecvSetverStateTime = Date.now();

        // 和解 = 权威状态 + 本地输入 （最新的本地预测状态）
        let lastSn = frame.lastSn ? frame.lastSn : -1;
        // this.pendingInputMsgs.remove(v => v.sn <= lastSn);
        let delIndex = this.pendingInputMsgs.findIndex(v => v.sn <= lastSn);
        if (delIndex != -1) {
            this.pendingInputMsgs.splice(delIndex);
        }
        this.pendingInputMsgs.forEach(m => {
            m.inputs.forEach(v => {
                this.gameSystem.applyInput({
                    ...v,
                    playerId: this.selfPlayerId
                });
            })
        })
    }

    pendingInputMsgs: MsgClientInput[] = [];
    sendClientInput(input: ClientInput) {
        // 已掉线或暂未加入，忽略本地输入
        if (!this.selfPlayerId || !this.client.isConnected) {
            return;
        }

        // 构造消息
        let msg: MsgClientInput = {
            sn: ++this.lastSN,
            inputs: [input]
        }

        // 向服务端发送输入
        this.pendingInputMsgs.push(msg);
        this.client.sendMsg('client/ClientInput', msg);

        // 预测状态：本地立即应用输入
        this.gameSystem.applyInput({
            ...input,
            playerId: this.selfPlayerId
        });
    }

    // 本地时间流逝（会被下一次服务器状态覆盖）
    localTimePast() {
        this.gameSystem.applyInput({
            type: 'TimePast',
            dt: Date.now() - this.lastRecvSetverStateTime
        });
        this.lastRecvSetverStateTime = Date.now();
    }
}
