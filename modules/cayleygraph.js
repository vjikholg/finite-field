import ForceGraph3D from '3d-force-graph'; 
import { FiniteGroup } from './finitegroup';

class CayleyGraph extends ForceGraph3D {
    /** 
     * A Cayley Graph, or Cayley diagram, is a graph that encodes the structure in a Group which is a direct 
     * consequent of Cayley's theorem, stating every graph is isomorphic to a subgroup of its own symmetric group
     * 
     * Given element g in group G, generator s in generating set S (so G = <S> )
     *  - Assign g to a vertex v   
     *  - Assign s to a color c 
     *  
     * Then, for every element g, generator s, corresponding vertex v and color c, there is a directed edge e 
     * with color c from the vertex correspeonding to g -> gs, or v -> v'   
     *  
     * For example, given additive group Z/nZ for integer n, corresponding Cayley graph is a cyclic graph of length n.
     * A fast way to visualize this is 1 -> 2 -> 3 -> ... -> n through the additive operation with generator 1. 
     * 
     * 
     * @param {FiniteGroup} group - a finite group and its elements
     */
    constructor(group) {
        let nodes = [...group.elems.map(i => ({id: i}))]; // shallow copy. pointer arraay 
        let links = [];  
        for (let elem of group) {
            // 
        }

        


    
        this.gData = {
            nodes: group.elems.map(i => ({id: i})), 
            links:  

        } 

        
    }

}

const g = new CayleyGraph(); 
