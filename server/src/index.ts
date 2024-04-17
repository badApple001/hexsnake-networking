import 'k8w-extend-native';
import * as path from "path";
import { WsConnection, WsServer } from "tsrpc";
import { Room } from './models/Room';
import { serviceProto, ServiceType } from './shared/protocols/serviceProto';
import { gameConfig } from './shared/game/gameConfig';

let port = gameConfig.port;
// 创建 TSRPC WebSocket Server
export const roomServer = new WsServer(serviceProto, {
    port: port,
    json: true,
    heartbeatWaitTime: 10000,
    // Enable this to see send/recv message details
    logMsg: true,
});

// 断开连接后退出房间
roomServer.flows.postDisconnectFlow.push(v => {
    let conn = v.conn as WsConnection<ServiceType>;
    if (conn.playerId) {
        roomInstance.leave(conn.playerId, conn);
    }
    return v;
});

export const roomInstance = new Room(roomServer);

// 初始化
async function init() {
    // 挂载 API 接口
    await roomServer.autoImplementApi(path.resolve(__dirname, 'api'));

    // TODO
    // Prepare something... (e.g. connect the db)
};

// 启动入口点
async function main() {
    await init();
    await roomServer.start(); 
}
main();