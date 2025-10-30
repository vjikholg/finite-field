import { ByteMatrix, makeIdentity } from "./bytematrix";
import { indexedSet } from "./structs/indexedset";
import { cantor } from "./helpers/hashcode";
export class FiniteGroup {
    /**
     * Represents a finite group. Uses matrices over GL(p^k) or integers over Z/nZ as elements.
     * @constructor
     * @param {Array} generators matrix(ces) over GLFs  
     * @param {Number} n order of the GLF
     */

    constructor(generator, name, expected) { 
        this.name = name; 
        this.elems = new indexedSet()
        this.elems.set(generator); 
        
        // keeps initial length of elems - keep index of generators rather than generators themselves
        this.generators = Array.from((Array(generator.length).keys()));
        this.opCache = new Map(); 
        this.makeGroup(expected); 
        this.order = this.elems.size;
    }

    makeGroup(expected) {
        // console.log('making group...')                         
        let i = 0; 
        let stepSet = this.generators.map((i) => this.elems.get(i))
        // console.log(stepSet);
        this.generators.forEach((gIndex) => {
            let inv = this.elems.get(gIndex).invert();
            stepSet.push(inv);
            this.elems.add(inv);
        })

        while (i < this.elems.size) {        
            let curr = this.elems.get(i);
            for (let s = 0; s < stepSet.length; s++) {                          // O(G^{2s}), where s = |S|, slightly better than O(G^|G|) 
                let newElem = curr.mult(stepSet[s]);
                // // console.log(`Multiplying: ${curr.view} with ${stepSet[s].view} with result ${newElem.view}`);
            
                if (!this.contains(newElem)) {      
                    this.elems.add(newElem);                                    
                    if (s < this.generators.length) {                           // cache the multiplication result for use in cayley graph
                        const key = cantor(i,s);                                     // i.e., geneators = [0, 1, 2], then s = 3 -> inverse of 1st elem, do not cache
                        this.opCache.set(key, this.elems.size-1);
                    }
                    if (this.elems.size === expected) return;                   // early end. 
                } 
            }
            i++;
        }
    }

    makeGroupParallel(expected, options) {

    }


    contains(g) {
        // // console.log("checking if: :" + g.contents + " is contained in group: " + this.name); 
        return this.elems.has(g); 
    }
}

/** 
 * @param {FiniteGroup} group - a finite group represented by matrices over finite fields. 
 * assertClosed goes through the entire group to check that its multiplicatively closed (since we're using matrix mult.)
 * 
 */ 
export function assertClosed(group){ 
    for(let g of group.elems) {
        for (let h of group.elems) {
            let temp = g.mult(h); 
            if(!group.elems.has(temp)) {
                // console.log(`the product between g: ${g.view} and h: ${h.view} does not exist: ${temp.view} `);
                return false; 
            }
        }
    }
    return true; 
}

/**
 * @param {FiniteGroup} group - a finite group represented by matrices over finite fields. 
 * assertInverse goes through the entire group and ensures 
 */
export function assertInverse(group) { // yeah this is legit O(|G|^2) garbage fixed using indexed set though
    for (let g of group.elems) { 
        let temp = g.invert(); 
        if (!group.contains(temp)) { // indexed set takes this from O(|G|) -> O(1) lookup  
            // console.log("group does not contain inverse of g: " + g.contents + ", " + temp.contents);
            return false; 
        }
    }
    return true; 
}

/**
 * @param {FiniteGroup} group - a finite group represented by matrices over finite fields. 
 * assert Identity ensures that we have an identity element in the group, i.e., I_n over GL(k) or similar 
 */
export function assertIdentityExist(group) { 
    const sample = group.elems.get(0)
    const id = makeIdentity({order: sample.domain.p, dims: sample.rows}); // yet another garbage line but whatever
    return (group.contains(id));
}

/**
 * @param {FiniteGroup} group - a finite group represented by matrices over finite fields. 
 * wrapper for group axiom assertions
 */

export function assertGroup(group) {
    return assertInverse(group) && assertIdentityExist(group) && assertClosed(group); 
    // associativity trivial given rep. by matrix, so dont need to check
}

export const GroupHandler = {
    groups: new Map(), 
    get(key) {
        return this.groups.get(key); 
    }, 
    set(key, group) {
        this.groups.set(key, group); 
    },
    has(key) {
        return this.groups.has(key);
    }
}