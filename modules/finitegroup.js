import {Matrix} from "./matrix";

class FiniteGroup {
    constructor(generators, n) { 
        // for our case since we're using groups with |G| < 1000, we can use normal closures to find groups 
        // 
        this.elems = new Array();
        this.order = n;
        this.makeGroup(generators, n); 
    }

    makeGroup(generators, n) {                              // this is horribly inefficient... if |G| was very large.  
        generators.forEach((mtx) => this.elems.add(mtx));   // we'd just use shreier-sims at that point...
        generators.forEach((mtx) => this.elems.add(mtx.invert())); 
        let i = 0; 
        while (i < this.elems.length()) {  
            let curr = elems[i];
            for(let g of this.elems) {

                let newElem = curr.mult(g); 
                let newInvElem = g.invert().mult(curr);     // if only there was a O(n) matrix mult alg... 

                if (!this.contains(newElem)) {
                    this.elems.push(newElem)
                } 
                if (!this.contains(newInvElem)) {
                    this.elems.push(newInvElem); 
                }
            }
            i++; 
        }
    }
    contains(elem) {
        return this.elems.includes(elem); 
    }

    assertClosed(){ 
        for(let g of this.elems) {
            for (let h of this.elems) {
                this.elems.contains()
            }
        }
    }
}