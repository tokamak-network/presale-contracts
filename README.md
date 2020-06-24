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

# Building testing environment

Run test script to build testing environment. Features include:

* Run ganache-cli
* Setup test addresses to use
* Deploy necessory contracts
    All token is deployed by owner(0xDf08F82De32B8d460adbE8D72043E3a7e25A3B39).
    * 5 pre-sale *TON tokens. Each address has each token as shown below.
    
  owner 0xDf08F82De32B8d460adbE8D72043E3a7e25A3B39
  | | | 1 | 2 | 3 | 4 | 5 |
  | ---- | ---- | ---- | ---- | ---- | ---- | ---- |
  | holder1 | 0x6704Fbfcd5Ef766B287262fA2281C105d57246a6 | o | o | o | o | o | 
  | holder2 | 0x9E1Ef1eC212F5DFfB41d35d9E5c14054F26c6560 | o | o | o | o |   | 
  | holder3 | 0xce42bdB34189a93c55De250E011c68FaeE374Dd3 | o | o | o |   |   | 
  | holder4 | 0x97A3FC5Ee46852C1Cf92A97B7BaD42F2622267cC | o | o |   |   |   | 
  | holder5 | 0xB9dcBf8A52Edc0C8DD9983fCc1d97b1F5d975Ed7 | o |   |   |   |   | 
  | holder6 | 0x26064a2E2b568D9A6D01B93D039D1da9Cf2A58CD |   | o | o | o | o | 
  | holder7 | 0xe84Da28128a48Dd5585d1aBB1ba67276FdD70776 |   |   | o | o | o | 
  | holder8 | 0xCc036143C68A7A9a41558Eae739B428eCDe5EF66 |   |   |   | o | o | 
  | holder9 | 0xE2b3204F29Ab45d5fd074Ff02aDE098FbC381D42 |   |   |   |   | o |
    
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
deployed.json : Deployed contract address information. This is generated after token deployment.
