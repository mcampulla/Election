var GioconePortone = artifacts.require("./GioconePortone.sol");

//module.exports = function(deployer) {
//  deployer.deploy(GioconePortone);
//};


module.exports = (deployer, network, accounts) => {
    let deployAddress = "0x45DedCad65107abD441170E6FA4486de524552Af"; //accounts[0]; // by convention
    //console.log('Preparing for deployment of GreatestShow...');
    
    if( network == "mainnet" ) {            
        throw "Halt. Sanity check. Not ready for deployment to mainnet. Manually remove this throw and try again.";
    }
    console.log('deploying from:' + deployAddress);
    
    //deployer.deploy(Election, 'Superpippo', {from: deployAddress});
    deployer.deploy(GioconePortone);
};
