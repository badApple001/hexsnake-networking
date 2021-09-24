import { ActorColliderTag } from "../Common/DefineData";
import Watcher, { HexsnakeEvent } from "../Common/Watcher";
import GameController from "./GameController";
import { pathItem } from "./MapCreator";
import Player from "./Player";
import Splixio, { RankItem } from "./Splixio";



const { ccclass, property } = cc._decorator;

@ccclass
export default class Hexsnake extends Splixio {

    //预定  玩家走哪占领到哪
    reserver(item: pathItem) {

        this.fill(item);
        item.state = 2;

        setTimeout(() => {
            item.state = 1;
        }, 200);
    }
}
