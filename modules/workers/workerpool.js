export function createPool(workerURL, size = navigator.hardwareConcurrency || 4) {
    const workers = Array.from({length: size}, () => { 
        new Worker(workerURL, {type: 'module'}); 
    })

    let r = 0; 
    /**
     * 
     * @param {*} stepsPayload = ByteMatrix.toPayload()[]; 
     */
    function broadcastInitialization(stepsPayload) { 
        const transfers = stepsPayload.map(s => s.buffer); 
        for (const worker of workers) worker.postMessage({type: 'init', steps:stepsPayload}, transfers);
    }

    function expandBatches(batches) {
        return Promise.all(batches.map(batch => new Promise(res => {
            const worker = workers[r++ % workers.length];
            const onMessage = e => {
                worker.removeEventListener('message', onMessage); 
                res(e.data)}
            
            worker.addEventListener('message', onMessage); 
            const transfers = batch.items.map(item => item.buffer); 
            worker.postMessage({type: 'expand', items: batch.items}, transfers);  
        })))
    }
    
    function destroy() {
        workers.forEach((worker) =>  {
            worker.terminate(); 
        })
    }

    return {broadcastInitialization, expandBatches, destroy, _poolInitialized: false}; 

}