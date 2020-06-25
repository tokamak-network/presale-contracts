# Presale contract

## Contracts (deployed in mainnet)

### SEED SALE
- SeedTON: [0x8Ae43F11DDd3fac5bbD84ab0BA795E1e51b78df7](https://etherscan.io/address/0x8Ae43F11DDd3fac5bbD84ab0BA795E1e51b78df7)
- Seedsale: [0xEb3da79882F1f0565e6C80eb7313Df6bB2428E2f](https://etherscan.io/address/0xEb3da79882F1f0565e6C80eb7313Df6bB2428E2f)

### PRIVATE SALE
- PrivateTON: [0x2C0F8e85ad3DCbEc1561f6cE632DFF86294e479f](https://etherscan.io/address/0x2C0F8e85ad3DCbEc1561f6cE632DFF86294e479f)
- Privatesale: [0xDe3f5301800A262C196D26a9048023Bd81f203Eb](https://etherscan.io/address/0xDe3f5301800A262C196D26a9048023Bd81f203Eb)

### STRATEGIC SALE
- StrategicTON: [0x2801265c6f888f5a9e1b72ee175fc0091e007080](https://etherscan.io/address/0x2801265c6f888f5a9e1b72ee175fc0091e007080)
- Strategicsale: [0x3A9f29BAe47670aD9755bB226A155015D922c305](https://etherscan.io/address/0x3A9f29BAe47670aD9755bB226A155015D922c305)

## Contracts (deployed in rinkeby)
```
token:
    "VestingTokenAddress1":"0x999cd9f58C9C4283f94c1C66b3f65CE1130889E3", swap rate : 1
    "VestingTokenAddress2":"0x90F0AB1EA35a98176e82932bDf01A0a0FcA2A2Ee", swap rate : 2
    "VestingTokenAddress3":"0x059572D593C0d84dfEE1662061344615FECb6486", swap rate : 3
    "VestingTokenAddress4":"0x9611aEee8174687a614C1E3FA22806a6410e2953", swap rate : 4
    "VestingTokenAddress5":"0x50f27d040D24B51d7E0d39122C2E367228cC2D2A", swap rate : 5
    "VestingTokenAddress6":"0x81ED96D20244D83Aa8226469e145c7589eDf8012", swap rate : 6
    "TON":"0xceBc1eBcAFc7dB4F5A6848554F385aEa2Da86c09",
    "Swapper":"0x4d678902A155bcd40A061410E85B1614dd8E314A"

address: 
    "owner": "0xDf08F82De32B8d460adbE8D72043E3a7e25A3B39",
    "holder1": "0x6704Fbfcd5Ef766B287262fA2281C105d57246a6",
    "holder2": "0x9E1Ef1eC212F5DFfB41d35d9E5c14054F26c6560",
    "holder3": "0xce42bdB34189a93c55De250E011c68FaeE374Dd3",
    "holder4": "0x97A3FC5Ee46852C1Cf92A97B7BaD42F2622267cC",
    "holder5": "0xB9dcBf8A52Edc0C8DD9983fCc1d97b1F5d975Ed7",
    "holder6": "0x26064a2E2b568D9A6D01B93D039D1da9Cf2A58CD",
    "holder7": "0xe84Da28128a48Dd5585d1aBB1ba67276FdD70776",
    "holder8": "0xCc036143C68A7A9a41558Eae739B428eCDe5EF66",
    "holder9": "0xE2b3204F29Ab45d5fd074Ff02aDE098FbC381D42"

address: private-key
    "0xDf08F82De32B8d460adbE8D72043E3a7e25A3B39": "0x2bdd21761a483f71054e14f5b827213567971c676928d9a1808cbfa4b7501200"
    "0x6704Fbfcd5Ef766B287262fA2281C105d57246a6": "0x2bdd21761a483f71054e14f5b827213567971c676928d9a1808cbfa4b7501201"
    "0x9E1Ef1eC212F5DFfB41d35d9E5c14054F26c6560": "0x2bdd21761a483f71054e14f5b827213567971c676928d9a1808cbfa4b7501202"
    "0xce42bdB34189a93c55De250E011c68FaeE374Dd3": "0x2bdd21761a483f71054e14f5b827213567971c676928d9a1808cbfa4b7501203"
    "0x97A3FC5Ee46852C1Cf92A97B7BaD42F2622267cC": "0x2bdd21761a483f71054e14f5b827213567971c676928d9a1808cbfa4b7501204"
    "0xB9dcBf8A52Edc0C8DD9983fCc1d97b1F5d975Ed7": "0x2bdd21761a483f71054e14f5b827213567971c676928d9a1808cbfa4b7501205"
    "0x26064a2E2b568D9A6D01B93D039D1da9Cf2A58CD": "0x2bdd21761a483f71054e14f5b827213567971c676928d9a1808cbfa4b7501206"
    "0xe84Da28128a48Dd5585d1aBB1ba67276FdD70776": "0x2bdd21761a483f71054e14f5b827213567971c676928d9a1808cbfa4b7501207"
    "0xCc036143C68A7A9a41558Eae739B428eCDe5EF66": "0x2bdd21761a483f71054e14f5b827213567971c676928d9a1808cbfa4b7501208"
    "0xE2b3204F29Ab45d5fd074Ff02aDE098FbC381D42": "0x2bdd21761a483f71054e14f5b827213567971c676928d9a1808cbfa4b7501209"
```

# Building testing environment

Run test script to build testing environment. Features include:

* Run ganache-cli
* Setup test addresses to use
* Deploy necessory contracts
    All token is deployed by owner(0xDf08F82De32B8d460adbE8D72043E3a7e25A3B39).
    * 5 pre-sale *TON tokens. Each address has each token as shown below.
    
  owner 0xDf08F82De32B8d460adbE8D72043E3a7e25A3B39
  | | | 1 | 2 | 3 | 4 | 5 | 6 |
  | ---- | ---- | ---- | ---- | ---- | ---- | ---- | ---- |
  | holder1 | 0x6704Fbfcd5Ef766B287262fA2281C105d57246a6 | o | o | o | o | o | o | 
  | holder2 | 0x9E1Ef1eC212F5DFfB41d35d9E5c14054F26c6560 | o | o | o | o |   | o | 
  | holder3 | 0xce42bdB34189a93c55De250E011c68FaeE374Dd3 | o | o | o |   |   | o | 
  | holder4 | 0x97A3FC5Ee46852C1Cf92A97B7BaD42F2622267cC | o | o |   |   |   | o | 
  | holder5 | 0xB9dcBf8A52Edc0C8DD9983fCc1d97b1F5d975Ed7 | o |   |   |   |   | o | 
  | holder6 | 0x26064a2E2b568D9A6D01B93D039D1da9Cf2A58CD |   | o | o | o | o |   | 
  | holder7 | 0xe84Da28128a48Dd5585d1aBB1ba67276FdD70776 |   |   | o | o | o |   | 
  | holder8 | 0xCc036143C68A7A9a41558Eae739B428eCDe5EF66 |   |   |   | o | o |   | 
  | holder9 | 0xE2b3204F29Ab45d5fd074Ff02aDE098FbC381D42 |   |   |   |   | o |   | 
    
    * TON token.
    * Swapper token. It has 10,000 TON.

## Requirements

### Setup

<pre>$ npm install</pre>

### External repository

* Compiled TON token file in plasma-evm-contracts

<pre>$ cd plasma-evm-contracts && truffle compile && cd -</pre>

## Testing

<pre>$ npm run-script test_daemon</pre>

## Ethereum network information

```
development_daemon: {
  host: 'localhost',
  port: 8545,
  network_id: '*',
  from: '0xDf08F82De32B8d460adbE8D72043E3a7e25A3B39',
}
```

## Files

test_accounts.json : address information.   
```
{
    "owner": "0xDf08F82De32B8d460adbE8D72043E3a7e25A3B39",
    "holder1": "0x6704Fbfcd5Ef766B287262fA2281C105d57246a6",
    "holder2": "0x9E1Ef1eC212F5DFfB41d35d9E5c14054F26c6560",
    "holder3": "0xce42bdB34189a93c55De250E011c68FaeE374Dd3",
    "holder4": "0x97A3FC5Ee46852C1Cf92A97B7BaD42F2622267cC",
    "holder5": "0xB9dcBf8A52Edc0C8DD9983fCc1d97b1F5d975Ed7",
    "holder6": "0x26064a2E2b568D9A6D01B93D039D1da9Cf2A58CD",
    "holder7": "0xe84Da28128a48Dd5585d1aBB1ba67276FdD70776",
    "holder8": "0xCc036143C68A7A9a41558Eae739B428eCDe5EF66",
    "holder9": "0xE2b3204F29Ab45d5fd074Ff02aDE098FbC381D42"
}
```   
deployed.json : Deployed contract address information. This is generated after token deployment.   
ex)
```
{"VestingTokenAddress1":"0x0f5Ea0A652E851678Ebf77B69484bFcD31F9459B","VestingTokenAddress2":"0x6732c278C58FC90542cce498981844A073D693d7","VestingTokenAddress3":"0x5baB00b1582B170DBAE7557586A29BA9EeA6f55b","VestingTokenAddress5":"0x3d627fE11843eF6b3D5EC6683D53BD9822696Ef6","TON":"0x254C1eAE847823B664D1Acb1BdfE5e19172D8336","Swapper":"0x7DCC8D20Ff08A8cd50464544139aF34abC1384fB"}
```

# Information

## releasableAmount result
* before initiate(before a) : 0
* after initiate, before start(a~b) : 0
* after start, before cliff(b~c) : 0
* after start, zero cliff, before duration(before d, b~c period is zero) : vested_amount * (block_timestamp - start_timestamp) / duration - released_amount
* after cliff, before duration(c~d) : vested_amount * (block_timestamp - start_timestamp) / duration - released_amount
* after duration(after d) : vested_amount - released_amount

![alt text](https://s3.us-west-2.amazonaws.com/secure.notion-static.com/e358ca29-7a13-4974-8e1f-19850d3adb73/Untitled.png?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=AKIAT73L2G45O3KS52Y5%2F20200625%2Fus-west-2%2Fs3%2Faws4_request&X-Amz-Date=20200625T035100Z&X-Amz-Expires=86400&X-Amz-Signature=80d1c5f7383f28aa5448d153e086a5aa8b1bf8bbb9508b9c3062631c779ea028&X-Amz-SignedHeaders=host&response-content-disposition=filename%20%3D%22Untitled.png%22)
