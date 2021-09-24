const Utils = require("./Utils");



class Hexmap {

    clients = null;

    async getSpawnPoint(c) {


        let x = 0;
        let y = 0;

        const clients = this.clients;

        if (clients.length > 1) {

            //最多随机 20次
            for (let i = 0; i < 20; i++) {

                x = Utils.randomInt(-25, 25);
                y = Utils.randomInt(-30, 30);

                //遍历所有玩家身上的格子
                let flag = false;
                for (let c of clients) {

                    for (let g of c.fief) {
                        if (g.x == x && g.y == y) {
                            flag = true;
                            break;
                        }
                    }

                    if (flag) break;

                    for (let g of c.neck) {
                        if (g.x == x && g.y == y) {
                            flag = true;
                            break;
                        }
                    }

                    if (flag) break;
                }

                if (!flag) break;
            }
        }

        c.pos.x = x * 53;
        c.pos.y = y * 92;
        return [x, y];
    }

}
module.exports = Hexmap