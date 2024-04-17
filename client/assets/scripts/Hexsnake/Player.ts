import { PlayerState } from "../TRPC/shared/game/state/PlayerState";
import Splixio from "./Splixio";

const { ccclass, property } = cc._decorator;

@ccclass
export default class Player extends cc.Component {


    deltaXY = cc.v2();
    isPlayer: boolean = false;
    playerId = -1;
    splixio:Splixio;
    start() {
        this.splixio = this.getComponent(Splixio);
    }

    init(state: PlayerState, isPlayer: boolean) {
        this.isPlayer = isPlayer;
        this.playerId = state.id;
        this.node.getChildByName("Direction").active = this.isPlayer;
    }

    


    updateState(state: PlayerState, now: number) {

    }
}


