/**
 * 简单实现rxjs中的Observable，以处理需要数据订阅时的麻烦，降低工具库与项目代码耦合度
 */
export class Observable {
    constructor() { }
    //订阅者列表，每个订阅者其实是一个处理得到信息的函数
    private subscribers: Array<any> = [];
    /**
     * 发布方法
     * @param data 要发布的数据
     * @returns 返回实例对象 
     */
    next(data: any) {
        // //将信息发布给每个订阅者，fn代表订阅者
        this.subscribers.forEach(fn => fn(data));
        return this;
    }

    /**
     * 订阅方法
     * @param callback 回调方法
     * @returns 返回实例对象
     */
    subscribe(callback: (t: any) => void) {
        let alreadyIn = this.subscribers.some(sub => sub == callback);
        if (!alreadyIn) {
            this.subscribers.push(callback);
        }
        return this;
    }

    /**
     * 取消订阅
     */
    unsubscribe() {
        // this.subscribers.filter(subscriber=>subscriber!==this);
        this.subscribers = [];
    }
}