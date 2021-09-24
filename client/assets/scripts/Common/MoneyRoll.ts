
/*

 * 
 * 金币滚动
 * 
 * 公用方法 在 Toolkit文件中
 * 
 * 程序猿: ChenJC
 * 最后修改日期: 2020/06/09
 * 
 */


import Watcher from "./Watcher";


const {ccclass, property} = cc._decorator;

@ccclass
export default class MoneyRoll extends cc.Component {


    @property({tooltip:"当前的金币数"})
    private curMoney:number = 0;

    @property({tooltip:"保留几位小数 0表示不保留"})
    private toFixed:number = 0;

    @property({tooltip:"跳动的时长"})
    private duration = 1.0;

    private startMoney:number = 0;
    private nextMoney:number = 0;
    private rollRange:number = 0;
    private rollTm:number = 0;
    public JumpTo( target:number ){
        this.nextMoney = target;
        this.startMoney = this.curMoney;
        this.rollRange = target - this.startMoney;
    }

    public JumpBy( delta:number ){
        this.startMoney = this.curMoney;
        this.nextMoney = this.nextMoney + delta;
        this.rollRange =  this.nextMoney - this.startMoney;
    }   

    private _label:cc.Label = null;
    public start () {
        this.curMoney = 10;
        this._label = this.getComponent(cc.Label);
        Watcher.addEventListener(Watcher.JUMP_MONEY,this,this.JumpTo);
        Watcher.addEventListener(Watcher.ADDITION_MONEY,this,this.JumpBy);
    }

    public update(dt:number){
        if( this.curMoney != this.nextMoney ){
            this.rollTm = Math.min(1.0,this.rollTm + dt);

            this.curMoney = this.startMoney +  this.rollTm * this.rollRange / this.duration; 
            if( this.rollTm == 1.0 ){
                this.curMoney = this.nextMoney;
                this.rollTm = 0;
            }
            
            // let value = "";
            // if( this.curMoney >= 1000000){
            //     value = `${(this.curMoney/1000000).toFixed(2)}M`; 
            // }
            // else if( this.curMoney >= 1000 )
            //     value = `${(this.curMoney/1000).toFixed(2)}K`;    
            // else
            //     value = this.curMoney.toFixed(this.toFixed).toString();
            
            // this._label.string = value;
            this._label.string = this.curMoney.toFixed(this.toFixed).toString();
        }
    }
}
