/**
 * Receives: 
 * {type: 'init', steps: [ByteMatrix.toPayload()...] - generator mtc}; 
 * {type: 'expand', items: [groupID: number, ...ByteMatrix.toPayload()]};  
 * 
 * returns 
 *  Array<{groupID: number, stepIndex: number, ...ByteMatrix.toPayload()}>; 
 *  stepIndex
 */

import {byteWidth, makeView } from "../bytematrix";

let STEPS = []; 

self.onmessage = (e) =>  {
    const msg = e.data; 

    if (msg.type === 'init') { 
        STEPS = msg.steps.map((s) => ({
           rows: s.rows, 
           cols: s.cols, 
           domain: s.domain, 
           view: makeView(s.buffer, s.word), 
           k: s.cols 
        }))
        return; 
    }

    if (msg.type === 'expand') { 
        const out = []; 

        for (const item of msg.items) { 
            const AView = makeView(item.buffer, item.domain.word); 
            const n = item.rows; const m = item.cols; 

            for (let stepIdx = 0; stepIdx < STEPS.length; stepIdx++) {
                const S = STEPS[stepIdx]; 
                const k = S.cols; 
                
                const outBuffer = new ArrayBuffer(n * k * byteWidth()); 
                const outView = makeView(outBuffer, S.domain.word); 
                // GFp = 0, we could convert to bytemtx and let internal methods handle, but embedding for loop here slightly more efficient. 
                if (S.domain.id === '0') { 
                    const p = S.domain.p; 
                    for (let i = 0; i < n; i++) { 
                        const io = i * k; 
                        const ia = i * m; 
                        
                        for (let j = 0; j < m; j++) { 
                            let s = 0 ;
                            for (let t = 0; t < m; t++) s = (s + AView[ia + t] * S.view[t * k + j]) % p; 
                            outView[io + j] = (s < 0) ? s + p : s; // fast representative
                        }
                    }
                } else { 
                    for (let i = 0; i < n; i++) { 
                        const io = i * k; 
                        const ia = i * m; 
                        for (let j = 0; j < m; j++) { 
                            let s = 0 ;
                            for (let t = 0; t < m; t++) s = (s + AView[ia + t] * S.view[t * k + j]); 
                            outView[io + j] = s; // fast representative
                        }
                    }
                }
                out.push({ 
                    groupID: item.groupID, 
                    stepIndex: stepIdx, 
                    rows: n, 
                    cols: m, 
                    domain: S.domain, 
                    buffer: outBuffer
                })
            }
        }
    }
    self.postMessage(out, out.map(o => o.buffer)) ;
}