pragma circom 2.0.0;

include "../../node_modules/circomlib/circuits/comparators.circom";
include "../../node_modules/circomlib-matrix/circuits/matMul.circom"; 
include "../../node_modules/circomlib/circuits/comparators.circom";
// hint: you can use more than one templates in circomlib-matrix to help you

template SystemOfEquations(n) { // n is the number of variables in the system of equations
    // assert(n <= 252);
    signal input x[n]; // this is the solution to the system of equations
    signal input A[n][n]; // this is the coefficient matrix
    signal input b[n]; // this are the constants in the system of equations
    signal output out; // 1 for correct solution, 0 for incorrect solution
    signal diff[n];
    signal temp;
    var sum=0;

    // [bonus] insert your code here

    component matmul = matMul(n,n,1);
    component isZero = IsZero();


    for (var i= 0; i < n; i++){
        for (var j=0; j< n; j++){
            matmul.a[i][j] <== A[i][j];
            // log(matmul.a[i][j]);
        }
        matmul.b[i][0] <== x[i];
        // log(matmul.b[i][0]);
    }

    // for (var i=0; i<n; i++){
    //     log(matmul.out[i][0]);
    //     log(b[i]);
    // }
    for (var i=0; i<n; i++){
        diff[i] <== matmul.out[i][0] - b[i];
        sum += diff[i];
    }
    log(sum);

    isZero.in <== sum;

    // log(isZero.out);
   
    
    

    out <== isZero.out;
    
}

component main {public [A, b]} = SystemOfEquations(3);