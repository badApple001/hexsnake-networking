import { Toolkit } from "./Toolkit";

const { ccclass, property } = cc._decorator;

@ccclass("MulImgItem")
export class MulImgItem {
    @property({ type: cc.Sprite, displayName: "Sprite" })
    public img: cc.Sprite = null;

    public set current(languge: string) {
        //if( languge in this )
        if (this.hasOwnProperty(languge)) {
            this.img.spriteFrame = this[languge];
        }
        else {
            console.log(`MulImgItem.current ${this} no attributes ${languge}`);
        }
    }

    @property({ type: cc.SpriteFrame, displayName: "中文图片" })
    public zh: cc.SpriteFrame = null;
    @property({ type: cc.SpriteFrame, displayName: "英文图片" })
    public en: cc.SpriteFrame = null;
    @property({ type: cc.SpriteFrame, displayName: "日语图片" })
    public ja: cc.SpriteFrame = null;
    @property({ type: cc.SpriteFrame, displayName: "韩语图片" })
    public ko: cc.SpriteFrame = null;
    @property({ type: cc.SpriteFrame, displayName: "繁体图片" })
    public zhHant: cc.SpriteFrame = null;
}


@ccclass("MulLabelItem")
export class MulLabelItem {
    @property({ type: cc.Label, displayName: "Label" })
    public label:cc.Label = null;
    
    @property({displayName:"作为key去多语言配表拿对应的数据"})
    public key: string = "";


    public set current(languge: string) {

        if("" == this.key)
            this.key = this.label.string;

        if (this.hasOwnProperty(languge)) {
            if (this[languge] == "") this[languge] = MulLanguge.currentContent(this.key);
            if (this.label)
                this.label.string = this[languge];
        }
        else {
            console.log(`MulImgItem.current ${this} no attributes ${languge}`);
        }
    }

    @property({ displayName: "中文文本" })
    public zh: string = "";
    @property({ displayName: "英文文本" })
    public en: string = "";
    @property({ displayName: "日语文本" })
    public ja: string = "";
    @property({ displayName: "韩语文本" })
    public ko: string = "";
    @property({ displayName: "繁体文本" })
    public zhHant: string = "";
}



enum Languge {
    zh,
    en,
    ja,
    ko,
    zhHant
}

@ccclass
export default class MulLanguge extends cc.Component {

    @property({ type: [MulImgItem], displayName: "多语言图片" })
    mulimgs: MulImgItem[] = [];
    @property({ type: [MulLabelItem], displayName: "多语言文本" })
    mullabs: MulLabelItem[] = [];

    @property({ type: cc.Enum(Languge) })
    public set current(languge: Languge) {
        MulLanguge._current = Object.keys(Languge)[languge];
        
        this.loadMulConifg(()=>{
            this.UpdateStaticMulObj(MulLanguge._current);
        });
    }
    public get current(): Languge {
        return Object.keys(Languge).indexOf(MulLanguge._current);
    }
    private static _current: string = 'en';
    public static _mulData: any = null;
    public static currentContent(key: string) {
        var data = MulLanguge._mulData;
        if (data && data.hasOwnProperty(key)) {
            return data[key][MulLanguge._current] || "";
        }
        else {
            Toolkit.log(`mulLanguge dont contain key:${key}`);
            return "";
        }
    }


    /**
     * 返回当前上下文发布的语言
     * @returns string
     */
    public static GetCtxLanguage() {
        MulLanguge._current = window['hwCurLanguage'] || 'en';
        return MulLanguge._current;
    }

    /** 刷新静态多语言显示对象 */
    public UpdateStaticMulObj(languge: string) {
        for (let t of this.mulimgs)
            t.current = languge;
        for (let t of this.mullabs)
            t.current = languge;
    }


    loadMulConifg(callback: Function = null) {

        if(MulLanguge._mulData==null)
        {
            const ctx = this;
            //加载多语言配置
            cc.loader.loadRes('mulLanguge.json', function (err, obj) {
                if (!err) {
                    //初始化刷新本地多语言对象
                    MulLanguge._mulData = obj.json;
                    callback&&callback();
                }
            });
        }
        else{
            callback&&callback();
        }
    }

    onLoad() {
        const ctx = this;
        this.loadMulConifg(()=>{
            ctx.UpdateStaticMulObj(MulLanguge.GetCtxLanguage());
        });
    }
}


