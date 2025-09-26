const DOMAIN_BRAND = new Symbol("DomainBrand"); 

export class GFp { 
    #inverses
    #p
    #word

    constructor(p) { 
        if (!Number.isInteger(p) || p <= 1) throw new Error(`GF(p): ${p} is not an integer`);
        this.#p = p; 
        this.#word = (p <= 255) ? "u8" : (p <= 65535) ? "u16" : "i32";
        this.#inverses = new Map(); 
        Object.defineProperty(this, DOMAIN_BRAND, {value: 'GFp', enumerable: false}); 
        Object.freeze(this); 
    }

    get id() {return `GF(${p})`};
    get word() {return this.#word};
    get p() {return this.#p}; 

    mult(a,b) {return this.representative(a * b)};
    add(a,b) {return this.representative(a + b);};

    invert(n) { 
        if (n === 1) return 1; 
        if (!this.#inverses.has(n)) {
            let m = this.representative(n); 
            if (n === 0) this.throwNoInverse(n);

            const {g, y} = extGcd(this.#p, m);

            if (g !== 1) this.throwNoInverse(n); 

            const rep = this.representative(y);
            this.#inverses.set(n,rep);
            this.#inverses.set(rep,n);
            
            return rep;
        }
        return this.#inverses.get(n); 
    }

    representative(n) {
        n = n % this.#p; 
        return (n < 0) ? n + this.#p : n; 
    }

    /**
     * GFp Serialization payloads for workers. 
     * @returns 
     */

    toPayload() {return {type: 'GFp', p: this.#p, word: this.#word}}

    static fromPayload(obj) {
        if (!obj || obj.type !== 'GFp' || !Number.isInteger(obj.p)) throw new Error(`given object: ${obj} is bad payload`)
        return FieldRegistry.getField(obj.p);
    }

    throwNoInverse(n) { 
        throw new Error(`${n} has no inverses mod ${this.#p}`);
    }

}


function extGcd(a,b) {
    let r0 = Math.abs(a), r1 = Math.abs(b); 
    let s0 = 1; s1 = 0; 
    let t0 = 0; t1 = 1;

    while (r1 !== 0) { 
        const q = Math.floor(r0/r1); 
        const r2 = r0 - q * r1; r0 = r1; r1 = r2;
        const s2 = s0 - q * s1; s0 = s1; s1 = s2;
        const t2 = t0 - q * t1; t0 = t1; t1 = t2;
    }

    if (a < 0) t0 = -t0;
    if (b < 0) s0 = -s0; 
    
    return {g: r0, x: s0, y: t0}; 
}

export class Z {
    #word 

    constructor(word = 'f64') {
        this.#word = word; 
        Object.defineProperty(this, DOMAIN_BRAND, {value: 'Z', enumerable: false});
    }

    get id() {return 'Z'}; 
    get word() {return this.#word};
    
    add(a, b) {return a + b}; 
    mult(a, b) {return a * b}; 
    representative(n) {return n};
    /**
     * Serialization methods for workers;
     */
    toPayload() {return {type: 'Z', word: this.#word}}; 
    fromPayload(obj) {
        if (obj.type !== 'Z') throw new Error(`Object: ${obj} is invalid payload`); 
        return FieldRegistry.getField(Number.MAX_SAFE_INTEGER)
    }
}

export function isDomain(obj) {
    if(!obj) return false; 
    const brand = obj[DOMAIN_BRAND]; 
    return (brand === 'GFp' || brand === 'Z'); 
}

export const FieldRegistry = { 
    fields: new Map(), 
    getField: (n) => {
        if (!fields.has(n)) fields.set(n, makeDomain(n)); 
        return fields.get(n); 
    },
    makeDomain: (n) => { 
        if (n === Number.MAX_SAFE_INTEGER) return new Z(obj.word || 'f64'); 
        return new GFp(n); 
    }
}
