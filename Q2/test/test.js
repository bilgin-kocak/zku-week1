const { expect } = require("chai");
const { ethers } = require("hardhat");
const fs = require("fs");
const { groth16, plonk } = require("snarkjs");

function unstringifyBigInts(o) {
    if ((typeof(o) == "string") && (/^[0-9]+$/.test(o) ))  {
        return BigInt(o);
    } else if ((typeof(o) == "string") && (/^0x[0-9a-fA-F]+$/.test(o) ))  {
        return BigInt(o);
    } else if (Array.isArray(o)) {
        return o.map(unstringifyBigInts);
    } else if (typeof o == "object") {
        if (o===null) return null;
        const res = {};
        const keys = Object.keys(o);
        keys.forEach( (k) => {
            res[k] = unstringifyBigInts(o[k]);
        });
        return res;
    } else {
        return o;
    }
}

describe("HelloWorld", function () {
    let Verifier;
    let verifier;

    beforeEach(async function () {
        Verifier = await ethers.getContractFactory("HelloWorldVerifier");
        verifier = await Verifier.deploy();
        await verifier.deployed();
    });

    it("Should return true for correct proof", async function () {
        //[assignment] Add comments to explain what each line is doing
        // Create proof and public signals
        const { proof, publicSignals } = await groth16.fullProve({"a":"1","b":"2"}, "contracts/circuits/HelloWorld/HelloWorld_js/HelloWorld.wasm","contracts/circuits/HelloWorld/circuit_final.zkey");

        console.log('1x2 =',publicSignals[0]);
        // Obtaining calldata
        const editedPublicSignals = unstringifyBigInts(publicSignals);
        const editedProof = unstringifyBigInts(proof);
        const calldata = await groth16.exportSolidityCallData(editedProof, editedPublicSignals);
    
        // Parsing calldata
        const argv = calldata.replace(/["[\]\s]/g, "").split(',').map(x => BigInt(x).toString());
    
        // Finding parameters
        const a = [argv[0], argv[1]];
        const b = [[argv[2], argv[3]], [argv[4], argv[5]]];
        const c = [argv[6], argv[7]];
        const Input = argv.slice(8);

        expect(await verifier.verifyProof(a, b, c, Input)).to.be.true;
    });
    it("Should return false for invalid proof", async function () {
        let a = [0, 0];
        let b = [[0, 0], [0, 0]];
        let c = [0, 0];
        let d = [0]
        expect(await verifier.verifyProof(a, b, c, d)).to.be.false;
    });
});


describe("Multiplier3 with Groth16", function () {
    let Verifier;
    let verifier;

    beforeEach(async function () {
        //[assignment] insert your script here
        Verifier = await ethers.getContractFactory("Multiplier3_groth16Verifier");
        verifier = await Verifier.deploy();
        await verifier.deployed();
    });

    it("Should return true for correct proof", async function () {
        //[assignment] insert your script here
        const { proof, publicSignals } = await groth16.fullProve({"a":"1","b":"2","c":"5"}, "contracts/circuits/Multiplier3_groth16/Multiplier3_js/Multiplier3.wasm","contracts/circuits/Multiplier3_groth16/circuit_final.zkey");

        console.log('1x2x5 =',publicSignals[0]);

        const editedPublicSignals = unstringifyBigInts(publicSignals);
        const editedProof = unstringifyBigInts(proof);
        const calldata = await groth16.exportSolidityCallData(editedProof, editedPublicSignals);
    
        const argv = calldata.replace(/["[\]\s]/g, "").split(',').map(x => BigInt(x).toString());
    
        const a = [argv[0], argv[1]];
        const b = [[argv[2], argv[3]], [argv[4], argv[5]]];
        const c = [argv[6], argv[7]];
        const Input = argv.slice(8);

        expect(await verifier.verifyProof(a, b, c, Input)).to.be.true;
    });
    it("Should return false for invalid proof", async function () {
        //[assignment] insert your script here
        let a = [0, 0];
        let b = [[0, 0], [0, 0]];
        let c = [0, 0];
        let d = [0]
        expect(await verifier.verifyProof(a, b, c, d)).to.be.false;
    });
});


describe("Multiplier3 with PLONK", function () {
    let Verifier;
    let verifier;

    beforeEach(async function () {
        //[assignment] insert your script here
        Verifier = await ethers.getContractFactory("PlonkVerifier");
        verifier = await Verifier.deploy();
        await verifier.deployed();
    });

    it("Should return true for correct proof", async function () {
        //[assignment] insert your script here
        const { proof, publicSignals } = await plonk.fullProve({"a":"1","b":"2","c":"5"}, "contracts/circuits/Multiplier3_plonk/Multiplier3_js/Multiplier3.wasm","contracts/circuits/Multiplier3_plonk/circuit_final.zkey");

        console.log('1x2x5 =',publicSignals[0]);

        const editedPublicSignals = unstringifyBigInts(publicSignals);
        const editedProof = unstringifyBigInts(proof);
        const calldata = await plonk.exportSolidityCallData(editedProof, editedPublicSignals);
    
        const argv = calldata.split(',')
        
        // const a = [argv[0], argv[1]];
        // const b = [[argv[2], argv[3]], [argv[4], argv[5]]];
        // const c = [argv[6], argv[7]];
        // const Input = argv.slice(8);

        // console.log(argv[0].length)

        expect(await verifier.verifyProof(argv[0], JSON.parse(argv[1]))).to.be.true;
    });
    it("Should return false for invalid proof", async function () {
        //[assignment] insert your script here
        let a = '0x'+ '00'.repeat(800);
        // let a = '0x2213d31928a8176f98ec28fb6115c2b1be042dd3a6d745795154866b6812aab11edb3719c3026ca7d0c84ef3b0344783195282fe9278b17b35b490704d33e1ad2a9cf772053079149215663ba5533306067b94cbfae93fbb5008343960c5c2c02b44a778b516a4c8a7aeabf45351e0dcf2ca4bdabb75f20e831928cbb7d62347107c20898ea8159b40725d60a4bebbbd305f93dfbe0e47a552e9dae20968a36815f42d52f224d40215efcdabf57ef4b01f22df5377c8ea5334f881e5f17a5aff1f79a5896bffc0046cfcefcdc5cf537ed16b01efd707e1bb76fbfb137388258c00f10caf19f1b29366a6cb3fda9bb702f803950b5caff8a4c7d988d95eb0df0b08b24ef3ba7d9f79e3f30ca743f53701d8e76a31d81526144c3453dbf7cf1dec2d6944e60ae7065471d01c8bed9b28bde20e99610ce7c654c0cbed7e9556ff1a2f26fb72b16bdbb7035ff1325a0ef347f15ce6d47c3d17921ddd8a2cacc3079303e06ecd3005d1fb38a98fbd2593b370e2dbe67a957dd62c69dc276c21a162f512297f755ac5d32716edc810eecf604302a7e4b39494217a867bae8580777a1d26abd4ca0a1257782f64554495d72f67b8c7d5b3e522f56f3390ba52b53e37832fe715ec987decf8147bd6b46ec7bf24a35e00e826dbda08bb3f9d22c5467e372937ef15cbac1f5d415a81a23101b703fc902d5a1d657a8108b4104409970a03255ce8bc700d6c3357aa8559ba57406a2a2622ea14305549060bfb258e6e522a130ed579ecf68f6309a324d63b3fcc908a2281868cf8f9d8ed9df9ff958a44790072270d8b092e9edebd6bcf44eb62e3e8156012c91dab68f9ab8e1368786e4400a521aa9634910ddba582037975c883dfd43e6f66c4e1566948f5523bd1b2f417952e38845c3c60db8d7959dc8827d2d889082ca086dbb8f7c5f485b24436592bd804b9c254733f9669fcab0c3e0a2e919954c52f27d7cca6bf9d5e1c50fcc52f91729662c2773f02718de5813fb0a12da10de5c9d9055d7e3c01017d68bf9119e14902e734ad45c78dc5af408289a23ffe2ae68d1f21c8fc0d82180d62f8642acda4032b2b6e838721077a803dc46e379a1df05971de503f25c9d6b52c2a54';
        let d = [0];
        expect(await verifier.verifyProof(a, d)).to.be.false;
    });
});