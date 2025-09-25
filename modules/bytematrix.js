import { FieldRegistry, GFp, Z, isDomain } from "./domains";
import { cyrb53 } from "./helpers/hashcode";

export const UNSAFE = false; 

function byteWidth(word) { 
    if (word === 'u8') return 1; 
    if (word === 'u16') return 2; 
    if (word === 'i32') return 4; 
    if (word === 'f32') return 8; 
    throw new Error(`${word} is an invalid/unknown word`); 
}

function makeView(buffer, word) {
    if (word === 'u8') return new Uint8Array(buffer); 
    if (word === 'u16') return new Uint16Array(buffer); 
    if (word === 'i32') return new Int32Array(buffer);
    if (word === 'f32') return new Float32Array(buffer);
    throw new Error(`${word} is an invalid/unknown word`); 
}

export class byteMatrix {
    #rows; #cols; #domain; #buffer; #view; #key; #dirty;
    static #invCache = new Map(); // (k, v) = (key, matrix); 
    
    constructor({rows, cols, p, buffer}) { 
        this.#rows = rows, 
        this.#cols = cols || rows; 
        this.#domain = FieldRegistry.getField(p); 
        const len = rows * cols || rows * rows; 
        const bw = byteWidth(this.#domain.word)
        this.#buffer = (buffer instanceof ArrayBuffer) ? buffer : new ArrayBuffer(len * bw); 
        this.#view = makeView(this.#buffer, this.#domain.word); 
        this.#key = null; 
        this.#dirty = true;
    }

    get rows() {return this.#rows;}
    get cols() {return this.#cols;}
    get domain() {return this.#domain}
    get view() {return this.#view} // DANGEROUS MUTABLE REF


    index(i,j) {
        if (i < 0 || i >= this.#rows || j < 0 || j >= this.#cols) throw new Error(`Index out of range: ${i}, ${j}`); 
        return i * this.#cols + j;
    }

    get(i, j) {
        return this.#view[this.index(i,j)];
    }

    set(i,j,n) { 
        if (i < 0 || i >= this.#rows || j < 0 || j >= this.#cols) throw new Error(`Index out of range: ${i}, ${j}`); 
        n = this.#domain.representative(n);
        this.#view[this.index(i,j)] = n; 
        return true; 
    } 

    get key() {
        if (this.key !== null && !this.#dirty) return this.#key; 
        const meta = (this.#domain instanceof GFp) ? `GF(${this.#domain.p})` : 'Z';
        const head = `${meta}:${this.#rows}x${this.cols}`;
        const bytes = new Uint8Array(this.#buffer);

        this.#key = cyrb53(head + Array.from(bytes).join(","));
        this.#dirty = false;   
        
        return this.#key;
    }

    mult(B) { 
        if(! B instanceof byteMatrix) throw new Error(`B: ${typeof(B)} is not instance of byteMatrix`); 
        if(this.#cols !== B.#rows) throw new Error(`Dimensional mismatch: A rows: ${this.#rows}, B cols: ${B.#cols}`); 
        if(this.#domain.id !== B.#domain.id) throw new Error(`Domain mismatch: A: ${this.#domain.id}, B:${B.domain.id}`);
        if(this.#domain instanceof GFp && this.#domain.p !== B.#domain.p) throw new Error(`p-Domain mismatch: A:${this.domain.p},  B:${B.domain.p}`)
        
        const n  = this.#rows, m = this.#cols, k = B.#cols; 
        const C = new Matrix2({rows: n, cols: k, p: this.#domain.p})
        const A = this.#view, BB = B.#view, CC = C.#view

        if (this.#domain instanceof GFp) { 
            const p = this.#domain.p;  
            for (let i = 0; i < n; i++) { 
                const io = i*k, ia = i*m; 
                
                for(let j = 0 ; j < k; j++) {
                    let s = 0; 
                    
                    for (let t = 0; t < m; t++) {
                        s += this.#domain.representative((A[ia + t] * BB[t*k + j])); 
                        CC[io + j] = s; 
                    }
                }
            }
        } else { // Z 
            for (let i = 0; i < n; i++ ) { 
                for (let j = 0 ; j < k; j++) { 
                    let s = 0; 
                    for (let t = 0; t < m; t++) {
                        s += A[ia + t] * BB[t*k + j]
                        CC[io + j] = s; 
                    }
                }
            }
        }
        C.#dirty = true; C.#key = null; 
        return C;
   }
}