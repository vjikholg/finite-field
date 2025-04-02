import { Matrix } from "./matrix";
import { FiniteField } from "./finitefield";
import {FiniteFieldRegistry} from "./finitefield"


export class FiniteGroup {
    /**
     * Represents a finite group. Uses matrices over GL(p^k) or integers over Z/nZ as elements.  
     * @constructor
     * @param {Array} generators matrix(ces) over GLFs  
     * @param {Number} n order of the GLF
     */
    constructor(generator, n) { 
        // for our case since we're using groups with |G| < 1000, we can use normal closures to find groups 
        // 
        this.elems = []; // we could potentially use sets, its probably better to convert to set then do stuff 
        this.generators = generator; 
        this.glf = FiniteFieldRegistry.getField(n) //i wonder if i can come up with a better solution
        this.makeGroup(generator, n); 
        this.order = this.elems.length; 
    }

    makeGroup(generators) {                              // large G -> use shreier sims
        this.elems = [...generators];
        let i = 0; 
        // console.log(this.elems);
        // console.log(this.elems[0]);

        while (i < this.elems.length) {
            let curr = this.elems[i]; 
            // console.log(curr); 

            this.elems.forEach( (g) => {    
                // console.log("processing: " + curr.contents + " and " + g.contents); 
                let newElem = curr.mult(g); 
                if (!this.contains(newElem)) {
                    console.log("we dont have: " + g.contents + ", pushing...");
                    this.elems.push(newElem);
                } 
            })
            i++; 
        }
    }

    contains(g) {
        return this.elems.some((elem) => Matrix.isEqual(g,elem));
    }

    static assertClosed(group){ 
        for(let g of group.elems) {
            for (let h of group.elems) {
                let temp = g.mult(h); 
                if(!group.contains(temp)) {
                    console.log("g: " + g.contents + "h: " + h.contents + " do not exist!");
                    return false; 
                }
            }
        }
        return true; 
    }

    static assertInverse(group) {
        for (let g of group.elems) { 
            let temp = g.invert(); 
            if (!group.contains(temp)) {
                console.log("group does not contain inverse of g: " + g.contents + ", " + temp.contents);
                return false; 
            }
        }
        return true; 
    }

    static assertIdentityExist(group) { 
        const id = Matrix.identity(group.glf.order, group.elems[0].rows); 
        return (group.contains(id));
    }

    static assertGroup(group) {
        return FiniteGroup.assertInverse(group) && FiniteGroup.assertIdentityExist(group) && FiniteGroup.assertClosed(group); 
        // associativity trivial given rep. by matrix, so dont need to check
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
            if (!delta.includes(gamma)) { 
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