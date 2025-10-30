import { createPool } from "./workerpool";

let _pool = null, refs = 0; 

export function acquirePool(url, size) { 
    if (!_pool) _pool = createPool(url, size); 
    refs++; 
    return _pool;
}
    
export function releasePool() { 
    refs = Math.max(0, refs - 1); 
    if (refs === 0 && _pool) {_pool.destroy(); _pool = null};
}
