import {Matrix} from "./matrix";
import {FiniteFieldRegistry} from "./finitefield"


export class FiniteGroup {
    /**
     * Represents a finite group. Uses matrices over GL(p^k) or integers over Z/nZ as elements.  
     * @constructor
     * @param {Array} generators either of matrix(ces) or integer(s) over GLFs  
     * @param {*} n order of the GLF
     */
    constructor(generators, n) { 
        // for our case since we're using groups with |G| < 1000, we can use normal closures to find groups 
        // 
        this.elems = new Array(); // we could potentially use sets, its probably better to convert to set then do stuff 
        this.generators = generators; 
        this.makeGroup(generators, n); 
        this.glf = FiniteFieldRegistry.getField(generators[0].glf.order) //i wonder if i can come up with a better solution
        this.order = this.elems.length; 
    }

    makeGroup(generators, n) {                              // large G -> use shreier sims
        generators.forEach((mtx) => this.elems.add(mtx));   
        generators.forEach((mtx) => this.elems.add(mtx.invert())); 
        let i = 0; 
        while (i < this.elems.length()) {  
            let curr = elems[i];
            for(let g of this.elems) {

                let newElem = curr.mult(g); 
                let newInvElem = g.invert().mult(curr);     

                if (!this.contains(newElem)) {
                    this.elems.push(newElem);
                } 
                if (!this.contains(newInvElem)) {
                    this.elems.push(newInvElem); 
                }
            }
            i++; 
        }
    }

    assertClosed(){ 
        for(let g of this.elems) {
            for (let h of this.elems) {
                this.elems.contains()
            }
        }
    }

    /**
     * "Algorithm 4" - Lemma 3 tells us satisfying certain conditions, orbit of an 
     * element under conjugation by is equivalent to orbit of the element by the group's generators. 
     * 
     * @param {Array} generators - Array of generators that would otherwise generate an entire group 
     * @param {Matrix, number} w - positive integer over a finite field 
     * @returns an array delta representing the orbit of w under conjugation
     * Remark 1: - |generators| = 1 tells us G is cyclic -> abelian, conjugation is equiv. to identity map in abelian groups
     * and so orbitConj(generators, w) would return {w}. 
     * 
     * Remark 2: 
     */ 

    static orbitConj(generators, w) {
        delta = {w}; 
        for (let d of delta) {
            for (let g of generators) {
                let gamma = conjugate(d,g); 
                if (!delta.includes(gamma)) {
                    delta.push(gamma);   
                } 
            }
        }
        return delta; 
    }

    /**
     * "Algorithm 4.1" - Orbit algorithm by right multiplication 
     * One of the consequences of the generalized orbit algorithm is we can then find all group elements g in G 
     * through the orbit of 1_G under right multiplication by G. Crude, but for SMALL groups (|G| < 1000) it's fine. 
     * 
     * 
     * @param {Array} generators - Array of generators that would otherwise generate an entire group 
     * @param {Matrix, number} w - positive integer over a finite field 
     * @returns orbit of w under G-action by right multiplication 
     */
    static orbitRight(generators, w) {
        delta = {w}; 
        for (let d of delta) {
            for (let g of generators) {
                let gamma = d.mult(g);  
                if (!delta.includes(gamma)) {
                    delta.push(gamma);   
                } 
            }
        }
        return delta; 
    }

    /**
     * "Algorithm 9" - Orbit Algorithm with transversal 
     * Assume the group action is by right multiplication. 
     * Goal: modify our orbit algorithm such that we're tracking 
     * 
     * 
     * @param {Group} group - a group, either a matrix group or the multiplicative group from a finite field
     * @param {Matrix, number} w - positive integer over a finite field 
     */

    static transversal(generators, w) { 
    let delta = {w};
    let id = Matrix.identity(generators[0].rows, generator[0].glf.order); 
    let transversal = {id};
    let i = 0; 
    for (let d of delta) {
        for (let g of generators) {
            let gamma = g.mult(d);
            if (!delta.contains(gamma)) { 
                delta.push(gamma); 
                transversal.push( T[delta.indexOf(d)].mult(g) ); // "append" T[d] * g_i to T
            }                                                    // the goal of this is to keep track of the path    
        }
        i++;
    }
    return {w,transversal};
    }

    static isIsomorphic(g1, g2) {
        
    }
}