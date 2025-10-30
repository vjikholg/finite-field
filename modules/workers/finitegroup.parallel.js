import { ByteMatrix } from "../bytematrix";
import { expandFrontierParallel } from "./expandfrontier";
import { FiniteGroup } from "../finitegroup.new";
import { acquirePool } from "./poolmanager";


export async function makeGroupParallel(group, expect, {
    pool, 
    poolSize = 4, 
    batchSize = 256, 
    minOffload = 256
} = {}) { 
    if (!pool) pool = acquirePool(new URL("./workers/mult.worker.js", import.meta.url), 4); // autostartup pool but this is rly bad. 
    
    const steps = group.generators.map(i => group.elems.get(i));
    for (const groupIndex of group.generators) { 
        const inv = group.elems.get(groupIndex).inv(); 
        steps.push(inv); 
        group.elems.add(inv); 
    }

    const stepsPayload = steps.map(step => step.toPayload());

    pool.broadcastInitialization(stepsPayload);


    let i = 0; 
    while (i < group.elems.size) {
        const frontier = []; 
        for(; i < group.elems.size; i++) {
            frontier.push({id: i, M: group.elems.get(i)}); 
        }

        const totalJobs = frontier.length * steps.length; 
        if (totalJobs < minOffload) {
            
        }
    }
}