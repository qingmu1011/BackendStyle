type Callback = (...args:any[])=>void

interface BusType {
    emit: (name: string)=>void
    on: (name: string, callback: Callback)=>void
    off: (name: string, callback: Callback)=>void
    clear: (name: string)=>void
}

interface BusList {
    [key: string | number | symbol]: Array<Callback>
}



class Bus implements BusType{
    #list:BusList

    constructor(){
        this.#list = {}
    }

    // 触发
    emit(name:string, ...args:any[]){
        const eventList = this.#list[name]
        if(!eventList){
            return new Error('没有该事件 ' + name)
        }
        eventList.forEach(fn => {
            fn.apply(this, args)
        });
    }

    // 监听
    on(name: string, callback:Callback){
        const eventList = this.#list[name] || []
        eventList.push(callback)
        this.#list[name] = eventList
    }

    // 取消监听
    off(name: string, callback:Callback){
        const eventList = this.#list[name]
        if(!eventList){
            return new Error('没有该事件 ' + name)
        }
        const index = eventList.indexOf(callback)
        if(index !== -1){
            eventList.splice(index, 1)
        }
    }

    // 清空
    clear(name: string){
        delete this.#list[name]
    }
}


export default new Bus