import { Matrix } from '../../modules/matrix.js';


test('making a matrix should actually make a 0 matrix', () => {
  const matrix = new Matrix(7,3,3); 

  // console.log(matrix); 
  expect(matrix.contents == [
    [0, 0, 0], 
    [0, 0, 0], 
    [0, 0, 0]
  ])
  
})

test('multiplying a 3x3 matrix should return a correct matrix', () => { 
  const matrix = new Matrix(3,3,3); 
  matrix.contents = [
    [1,1,1],
    [1,2,1],
    [0,0,1]]; 
  const test = matrix.mult(matrix); 
  // console.log(test.contents); 


  const answer = new Matrix(3,3,3); 
  answer.contents = [
    [2,0,0], 
    [0,2,1], 
    [0,0,1]
  ]


  expect(Matrix.isEqual(test, answer)).toBe(true); 

  
})

test('multiplying 1x1 matrix should return a correct matrix', () => { 
  const matrix = new Matrix(Number.MAX_SAFE_INTEGER,1,1); 

  matrix.contents = [[-1]]; 
    
  const test = matrix.mult(matrix); 
  // console.log(test);

  expect(test.contents[0][0]).toEqual(1); 

})

test('transpose should swap rows and columns', () => {
    const matrix = new Matrix(7, 2, 3);
    // Initialize matrix with distinct values
    matrix.contents = [
      [1, 2, 3],
      [4, 5, 6]
    ];  
    const transposed = matrix.transpose();
    
    expect(transposed.rows).toBe(3);
    expect(transposed.cols).toBe(2);
    expect(transposed.contents).toEqual([
      [1, 4],
      [2, 5],
      [3, 6]
    ]);
  });

test('determinant should return correct value', () => {
  const matrix = new Matrix(10,3,3); 
  //Initialize matrix with distinct values
  matrix.contents = [
    [1,0,0], 
    [0,1,1], 
    [0,1,1]
  ]; 

  const dtm = matrix.det(); 
  expect(dtm).toBe(0)
})


test('cofactor should return correct matrix', () => { 
  const matrix = new Matrix(7,3,3); 
  matrix.contents = [
    [1, 0, 0], 
    [3, 3, 0], 
    [5, 2, 6]
  ]
  const cof = matrix.cofactor(); 

  const test_cof = new Matrix(7,3,3); 
  test_cof.contents = [
    [4, 3, 5], 
    [0, 6, 5], 
    [0, 0, 3]]; 
  
  // console.log("this is cofactor test contents: " + test_cof.contents); 
  // console.log("this is cofactor function contents: " + cof.contents); 

  expect(Matrix.isEqual(cof, test_cof)).toBe(true);

})

test ('adjugate of 2x2 matrix should return fixed formula', () => {
  const matrix = new Matrix(5,2,2); 

  matrix.contents = [
    [1, 2],
    [3, 4]]
  
  const test = matrix.adjugate(); 
  
  // console.log(test.contents);

  expect(test.contents).toEqual([
    [4, 3],
    [2, 1]]
  )


})



test ('adjugate should return correct matrix', () => {
  const matrix = new Matrix(7,3,3); 
  matrix.contents = [ 
    [1, 0, 0], 
    [3, 3, 0], 
    [5, 2, 6]];

  const adj = matrix.adjugate(); 
  const test_adj = new Matrix(7,3,3); 

  test_adj.contents = [
    [4, 0, 0], 
    [3, 6, 0], 
    [5, 5, 3]]; 

  // console.log("this is test adj's contents: "+ test_adj.contents); 

  // console.log("this is adj function contents: " + adj.contents); 

  expect(Matrix.isEqual(adj, test_adj)).toBe(true);

})

test('inversion should return correct matrix', () =>  { 
  const matrix = new Matrix(7, 3, 3); 
  matrix.contents = [
    [1, 0, 0], 
    [3, 3, 0], 
    [5, 2, 6]
  ]; 

  const inv = matrix.invert(); 
  let test = new Matrix(7,3,3); 
  test.contents = [
    [1, 0, 0],
    [6, 5, 0],
    [3, 3, 6]];

  expect(Matrix.isEqual(test, inv)).toBe(true); 
  
  })
  




 test('inversion of [-1] should return correct inverse, [-1]', () => {
  const matrix = new Matrix(5,1,1); 
  matrix.contents = [[-1]]; 
  const inv = matrix.invert(); 

  expect(inv.contents != [-1]);
  expect(inv.contents) == [[-1]]; 
  })

test('taking submatrx of 2x2 matrices should return proper minors', () => {
  const matrix = new Matrix(Number.MAX_SAFE_INTEGER, 2); 
  matrix.contents = [
    [1, 2], 
    [3, 4]]; 
  // console.log(matrix.subMatrix(0,0));

  // console.log(matrix.subMatrix(0,0).contents[0][0]);
  expect(matrix.subMatrix(0,0).contents[0][0]).toBe(4); 
  expect(matrix.subMatrix(1,1).contents[0][0]).toBe(1); 
  expect(matrix.subMatrix(0,1).contents[0][0]).toBe(3); 
  expect(matrix.subMatrix(1,0).contents[0][0]).toBe(2); 




}) 


test('inverting [-1 0; 0 1] should return [0 1; -1 0]', () => { 
  const matrix = new Matrix(Number.MAX_SAFE_INTEGER, 2);
  matrix.contents = [[0, -1], [1, 0]]; 

  const inverse = matrix.invert(); 


  console.log(inverse.contents);
  

  const test = new Matrix(Number.MAX_SAFE_INTEGER, 2); 
  test.contents = [[0, 1], [-1, 0]];


  expect(matrix.det()).toEqual(1);



  expect(Matrix.isEqual(inverse, test)).toBe(true);

})

test('comparing identities should return positive', () => {
  const id1 = Matrix.identity(4,2); 
  const id2 = Matrix.identity(4,2); 
  const id3 = new Matrix(4,2); 
  id3.contents = [
    [1,0], 
    [0,1]
  ]

  console.log(id1);
  console.log(id2); 
  console.log(id3); 

  const id4 = new Matrix(4,2); 

  expect(Matrix.isEqual(id1, id2)).toBe(true); 
  expect(Matrix.isEqual(id1, id3)).toBe(true);
  expect(Matrix.isEqual(id1, id4)).toBe(false); 
  expect(Matrix.isEqual(id3, id2)).toBe(true); 

})

test('comparing 1x1 matrices should return positive', () => {
  const id1 = Matrix.identity(2,1);
  test = new Matrix(2,1); 
  test.contents = [[1]]; 

  expect(Matrix.isEqual(id1, test)).toBe(true); 


})


