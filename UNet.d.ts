
declare interface __SocketConfig {
    isSSL : boolean,
    host:string,
    port : number | string,
    autoConnect:true;
}

declare module UNet {
    declare class Event {
        /**
         * 监听事件
         * @param eventName 事件名
         * @param fun 回调函数
         * @param target 回调对象
         */
        on(eventName:string, fun:Function, target:any);
        /**
         * 取消监听事件 只有一个参数的话，取消该事件名的所有监听
         * @param eventName 事件名
         * @param fun 回调函数
         * @param target 回调对象
         */
        off(eventName:string|any, fun?:Function, target?:any);
        /**
         * 触发事件
         * @param eventName 事件名
         * @param args 参数
         */
        emit(eventName:string, ...args:any[]);
        /**
         * 移除所有监听
         * @param eventName string依据事件名，否则依据target
         */
        removeAllListeners(eventName:string|any);
        /**
         * 监听一次性事件
         * @param eventName 事件名
         * @param fun 回调函数
         * @param target 回调对象
         */
        once(eventName:string, fun:Function, target:any);
        /**
         * 清空 
         * */
        clean();
    }
    var EventType:{
        OPEN:string,
        CLOSE:string,
        ERROR:string
    }
    declare class Socket {
        constructor(cfg:__SocketConfig)

        Connect():void
        Close():void;
        Send(key:string|any,v?:any):void;
        
        SendString(str:string):void

        On(eventName:string,func:Function,target:any);
        Once(eventName:string,func:Function,target:any);
        Off(eventName:string | any,func?:Function,target?:any);
    }
}