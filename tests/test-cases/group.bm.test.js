import { Matrix } from "../../modules/matrix.js";
import { FiniteGroup, assertClosed, assertIdentityExist, assertInverse} from "../../modules/finitegroup.new.js";
import { FiniteFieldRegistry } from "../../modules/finitefield.js";
import { ByteMatrix, fromArray, unsafeFromArray, makeBM } from "../../modules/bytematrix.js";


test ('Generate Z/2Z multiplicatively', () => {
    let generators = []; 
    let g1 = unsafeFromArray([-1], Number.MAX_SAFE_INTEGER, 1, 1)
    // console.log(g1.view);
    generators.push(g1); 

    let group = new FiniteGroup(generators, "Z/2Z", 2); 
    // console.log(group);
    // group.elems.forEach((g) => // console.log(g.contents)); 

    expect(group.order).toBe(2);
    expect(assertClosed(group)).toBe(true);
    expect(assertInverse(group)).toBe(true);
    expect(assertIdentityExist(group)).toBe(true);
})



test ('Generate Z/5Z multiplicatively using integers over Z/11Z', () => {
    let generators = []
    let g1 = unsafeFromArray([4], 11, 1, 1); 
    generators.push(g1);  

    let group = new FiniteGroup(generators, "Z/11Z", 5); 
    // group.elems.forEach((elem) => {
    //     for(const [key, value] of Object.entries(elem)) {
    //         // console.log(`${key}, ${value}`);
    //     }
    // })

    expect(group.order).toBe(5); 
    expect(assertClosed(group)).toBe(true);
    expect(assertInverse(group)).toBe(true);
    expect(assertIdentityExist(group)).toBe(true);
 })

// first non-trivial test 
test ('Generate the Dihedral group D4, using 2x2 matrices over GL2(Z)', () => {
    let generators = [];

    let g1 = unsafeFromArray([0, -1, 1, 0], Number.MAX_SAFE_INTEGER, 2, 2);
    let g2 = unsafeFromArray([1, 0, 0, -1], Number.MAX_SAFE_INTEGER, 2, 2); 

    generators.push(g1); 
    generators.push(g2); 

    generators.forEach(g => {
        // console.log(`generator is: ${g.view} with determinant: ${g.det()}`);
    })

    let group = new FiniteGroup(generators, "Dihedral D4", 8); 
    // // console.log(group.elems.check()); 


    expect(group.order).toEqual(8);
    expect(assertClosed(group)).toBe(true);
    expect(assertInverse(group)).toBe(true);
    expect(assertIdentityExist(group)).toBe(true);


})

test ('generate the Quaternions Q8 using 2x2 matrices over GL2(Z/3Z)', () => {
    let generators = []; 
    let g1 = unsafeFromArray([2, 2, 2, 1], 3, 2, 2);
    let g2 = unsafeFromArray([0, 2, 1, 0], 3, 2, 2);
    
    g2.contents = [
        [0, 2],
        [1, 0]];
    generators.push(g1); 
    generators.push(g2);     

    let group = new FiniteGroup(generators, "Quaternion Q8", 8); 

    // group.elems.forEach((g) => // console.log(g.contents));

    expect(assertClosed(group)).toBe(true);
    expect(assertInverse(group)).toBe(true);
    expect(assertIdentityExist(group)).toBe(true);
    expect(group.order).toEqual(8);
})

// this is the "real test" 
test ('generate the DP of C2 and SDP of C4, C4 using 4x4 matrices over GL4(Z/5Z)', () => {
    let g1 = unsafeFromArray([4,0,0,0,0,4,0,0,0,0,1,0,0,0,0,1], 5, 4, 4);
    let g2 = unsafeFromArray([1,0,0,0,0,1,0,0,0,0,0,4,0,0,1,0], 5, 4 ,4);
    let g3 = unsafeFromArray([3,0,0,0,0,1,0,0,0,0,0,3,0,0,3,0], 5, 4, 4);
    let generators = [g1,g2,g3]; 

    let group = new FiniteGroup(generators, "DP of C2 and SDP(C4,C4)", 32); 
    
    expect(assertClosed(group)).toBe(true);
    expect(assertInverse(group)).toBe(true);
    expect(assertIdentityExist(group)).toBe(true);
    expect(group.order).toEqual(32);
})

