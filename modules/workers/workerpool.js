export class WorkerPool {
    constructor(url, size = Math.max(1, (navigator.hardwareConcurrency|0) - 1)) {
        this.idle = [];
        this.busy = new Set(); 
        for (let i = 0 ; i < size; i++) this.idle.push(new Worker(url, {type: "module"})); 
    }

    #waitForIdle() {
        return new Promise(r => {
            const check = () => this.idle.length ? r(this.idle.pop()) : setTimeout(check, 1);
            check(); 
        })
    }

    async run(payload) {
        const worker = this.idle.pop() ?? await this.#waitForIdle();
        this.busy.push(worker);
        const res = await call(worker, payload); 
        this.busy.delete(worker); 
        this.idle.push(worker);
    }

    end() {
        for (const worker of [...this.idle, ...this.busy]) worker.terminate(); 
    }
}