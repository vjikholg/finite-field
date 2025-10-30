import { ByteMatrix, unsafeFromArray } from "../../modules/bytematrix.js";
import { FiniteGroup, assertGroup } from "../../modules/finitegroup.new.js";

const allGroups = require('../../data/output_order500.json')
// const groupInfo = JSON.parse(json); 
const groupTest = function(group) { 
    return assertGroup(group); 
}

const order100 = allGroups.filter(g => g.order >= 100 && g.order <= 300);

const ZGroups = allGroups.filter(g => g.glforder === Number.MAX_SAFE_INTEGER);

// describe(" 'generating all groups' ", () => { 
//     test.each(allGroups) ( 
//         "testing %p to assert each generates a group of specified order", 
//         ({generators, glforder, name, order}) => {              // 1. allGroup is an array of OBJECTS, which means reading in (arg1, arg2,...) will not work
//                                                                 // solution: convert into object {arg1, arg2,...}
//             // first convert 2D arrays to matrix objects 
//             const mtc = generators.map(mtx => unsafeFromArray(mtx.flat(), glforder, mtx.length, mtx[0].length));
//             // console.log(`testing group: ${name}`)
//             let group = new FiniteGroup(mtc, name, order); 
//             expect(group.order).toEqual(order); 
//             expect(groupTest(group)).toBe(true); 
//         }, 
//         1000
//     )
// })

order100.forEach((groupInfo) => { 
    describe("", () => {
        
    })
})

describe(" 'generating all groups of order 100 < n < 300' ", () => { 
    test.each(order100) ( 
        "testing %p to assert each generates a group of specified order", 
        ({generators, glforder, name, order}) => {              // 1. allGroup is an array of OBJECTS, which means reading in (arg1, arg2,...) will not work
                                                                // solution: convert into object {arg1, arg2,...}
            // first convert 2D arrays to matrix objects 
            const mtc = generators.map(mtx => unsafeFromArray(mtx.flat(), glforder, mtx.length, mtx[0].length));
            // console.log(`testing group: ${name}`)
            let group = new FiniteGroup(mtc, name, order); 
            expect(group.order).toEqual(order); 
            expect(groupTest(group)).toBe(true); 
        }, 
        1000
    )
})


// describe(" 'generating Z groups' ", () => { 
//     test.each(ZGroups) ( 
//         "testing %p to assert each generates a group of specified order", 
//         ({generators, glforder, name, order}) => {              // 1. allGroup is an array of OBJECTS, which means reading in (arg1, arg2,...) will not work
//                                                                 // solution: convert into object {arg1, arg2,...}
//             // first convert 2D arrays to matrix objects 
//             const mtc = generators.map(mtx => unsafeFromArray(mtx.flat(), glforder, mtx.length, mtx[0].length));
//             // console.log(`testing group: ${name}`)
//             let group = new FiniteGroup(mtc, name, order); 
//             expect(group.order).toEqual(order); 
//             expect(groupTest(group)).toBe(true); 
//         }, 
//         10000
//     )
// })