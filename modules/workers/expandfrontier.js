import { ByteMatrix } from "../bytematrix";

export async function expandFrontierParallel({
    pool, 
    frontier,               // [{id, M: bytematrix}]
    steps,                  // ByteMatrix[]
    batchSize = 256,        // batch threshold
    domainWordCheck = true  
}) {
   const batches = []; 
   for (let i = 0; i < frontier.length; i += batchSize) {
        const items = []; 
        for (let j = i; j < Math.min(i + batchSize, frontier.length); j++) { 
            const payload = frontier[j].M.toPayload(); 
            items.push({groupID: frontier[j].id, ...payload}); // rows, cols, dom, etc.
        }
        batches.push({items})
    }

    const results = await pool.expandBatches(batches);

    // we can just rebuild on the mainthread - faster anyways. 
    const out = []; 
    for (const arr of results) {
        for (r of arr) {
            out.push({
                groupID: r.groupID, 
                stepIndex: r.stepIndex, 
                M: ByteMatrix.fromPayload(r)
            })
        }
    }
    return out;
}
