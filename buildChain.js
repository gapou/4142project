let database = require('./models/blockchain')

let mongoose = require('mongoose')

let blockChainModel = mongoose.model('blockchain')

const SHA256 = require('crypto-js/sha256');
var EC = require('elliptic').ec;
var ec = new EC('secp256k1');
const utxo=[];
const mempool=[];

class Block {//Blockchain Prototype (2’)
    constructor(data) {
      //this.index = index;
      this.data = data;
      this.merkleRoot();
      this.nonce = 0;
    }
    calculateHash() {
        return SHA256(SHA256(this.index + 
            this.previousHash +
            this.timestamp +
            this.difficulty+
            JSON.stringify(this.data) +
            this.nonce +
            this.merkleRoot).toString()).toString();
    }

    merkleRoot() {
        let merkleRoot = [];
        //console.log("data");
        //console.log(this.data);
        for (let i = 0; i < this.data.length; i++) {
          merkleRoot.push(SHA256(this.data[i]).toString());
        }
        while (merkleRoot.length > 1) {
            //console.log(merkleRoot);
          let temp = [];
          for (let i = 0; i < merkleRoot.length; i += 2) {
            if (i + 1 < merkleRoot.length) {
                temp.push(SHA256(merkleRoot[i] + merkleRoot[i + 1]).toString());
            } else {
              temp.push(merkleRoot[i]);
            }
          }
          merkleRoot = temp;
        }
        let m = merkleRoot[0];
        //console.log(merkleRoot[0]);
        this.merkleRoot = m;
        //return merkleRoot[0].toString();
      }


    calLeadingZeros() {
        let zeros = 0;
        let non_zero =0;
        for (let i = 0; 1 < this.hash.length ; i++) {
            if (this.hash[i] == '0') {
                zeros++;}
            else {
                //console.log(this.hash[i]);
                non_zero = this.hash[i];
                break;}
        }
        let bin = parseInt(non_zero.toString(), 16).toString(2);
        //console.log(bin);
        //console.log(bin.length);
        zeros = zeros*4 + 4 - bin.length;
        //console.log(this.hash.toString() +"-------------------------        "+zeros.toString());
        return zeros;
    }
    /*PoW algorithm (2’): adjust the nonce and generate hashes until having a hash with 
    consecutive 0-bits which satisfies the difficulty requirement*/
    mineBlock(difficulty) {
        //console.log(this);
        console.log("Mining block...");
        this.timestamp = new Date().getTime()/1000|0 ; 
        this.hash = this.calculateHash();
        while (this.calLeadingZeros() < difficulty) {
            this.nonce++;
            this.timestamp = new Date().getTime()/1000|0 ;
            this.hash = this.calculateHash();
        }
        console.log("Block mined: " + this.hash);
      }

}

class Blockchain {
  constructor() {
    this.difficulty = 10;
    this.chain = [this.createGenesisBlock()];
    /*Dynamic difficulty (1’): adjust the difficulty dynamically based on the time taken 
    to generate the previous (10, 20, or more) blocks */
  }

  calDifficulty() {
      const latestBlock = this.getLatestBlock();
      if (latestBlock.index % 4 !== 0) {
        return;
      }
  
      const prevAdjustmentBlock = this.chain[this.chain.length - 4];
      if (typeof prevAdjustmentBlock === 'undefined') {
        return;
      }
      const timeExpected = 15 * 4 ;

      let timeTaken = latestBlock.timestamp - prevAdjustmentBlock.timestamp;
      let multiple = timeTaken / timeExpected;
      //console.log("multiple: " + multiple);
      this.difficulty = Math.round(Math.log(multiple) * this.difficulty);
      //console.log("adjust: " + adjust);
      if (this.difficulty < 1) {
          this.difficulty = 1;
        }

    }
    
  createGenesisBlock() {
      let genesis = new Block(["empty"]);
      genesis.index = 0;
      genesis.difficulty = this.difficulty;
      //genesis.merkleRoot();
      genesis.previousHash = '0';
      //console.log(genesis);
      genesis.mineBlock(this.difficulty);
      //console.log(genesis);
      return genesis;
  }
    
  getLatestBlock() {
      return this.chain[this.chain.length - 1];
  }

  addBlock(newBlock){
      this.calDifficulty();
      newBlock.difficulty = this.difficulty;
      newBlock.index = this.getLatestBlock().index + 1;
      newBlock.previousHash = this.getLatestBlock().hash;
      newBlock.mineBlock(this.difficulty);
      console.log("Block successfully added!");
      console.log(newBlock);
      this.chain.push(newBlock); 
  }


  isChainValid() {
    for (let i = 1; i < this.chain.length; i++) {
      const currentBlock = this.chain[i];
      const previousBlock = this.chain[i - 1];

      if (currentBlock.previousHash !== previousBlock.hash) {
        return false;
      }

      if (currentBlock.hash !== currentBlock.calculateHash()) {
        return false;
      }
    }


    return true;
  }

}  

class TransactionOutput {
    constructor(receiver, amount) {
      this.receiver = receiver;
      this.amount = amount;
  }
}

class TransactionInput {
    constructor(txId, txIndex) {
      this.txId = txId;
      this.txIndex = txIndex;
  }
}

class Transaction {
    constructor(inputs, outputs) {
      this.inputs = inputs;
      this.outputs = outputs;
  }
}
class UXTO{
    constructor(txId, txIndex, address, amount){
      this.txId = txId;
      this.txIndex = txIndex;
      this.address = address;
      //this.sig = sig;
      this.amount = amount;
  }
}

class Node {
    constructor() {
        //this.EC = require('elliptic').ec;
        //this.ec = new EC('secp256k1');
        this.key = ec.genKeyPair();
        this.publicKey = this.key.getPublic('hex');
        this.privateKey = this.key.getPrivate('hex');
        this.pubhash = SHA256(this.publicKey).toString();

        //this.keypair1 = ec.keyFromPrivate(this.privateKey, "hex");
        //this.keypair2 = ec.keyFromPublic(this.publicKey, "hex");
        //this.pri2 = this.keypair2.getPrivate("hex");
        //console.log(this.keypair1);
        //console.log(this.keypair2);
        //console.log(this.keypair1 === this.keypair2);
        //let sig = this.keypair1.sign("tiffanyQAQ").toDER("hex");
        //let message = this.publicKey.verify("tiffanyQAQ", sig);
        //console.log(message);
    }

    initiateTransaction(receiver, amount) {
      let inputs = [];
      let outputs = [];
      let total = 0;
      for (let i = 0; i < utxo.length; i++) {
          if (utxo[i].address === this.pubhash) {
            inputs.push(new TransactionInput(utxo[i].txId, utxo[i].txIndex));
            total += utxo[i].amount;
            if (total >= amount) {
              break;
            }
          }
      }
      console.log("total: " + total);
      if (total < amount) {
          console.log('Insufficient balance');
          return;
      }
      outputs.push(new TransactionOutput(receiver, amount));
      if (total > amount) {
          outputs.push(new TransactionOutput(this.pubhash, total - amount));
      }
      let tx = new Transaction(inputs, outputs);
      tx.txId = SHA256(JSON.stringify(tx)).toString();
      for (let i = 0; i < tx.inputs.length; i++) {
          let input = tx.inputs[i];
          input.sig = [this.key.sign(tx.txId).toDER('hex') , this.publicKey];
        }
        console.log(tx);
      if (this.verifyTransaction(tx)) {
          console.log('Transaction verified');
          mempool.push(tx);
          console.log('Transaction created');
      } else {
            console.log('Transaction verification failed');
        }
    }

    verifyTransaction(tx) {
        console.log("enter verify");
        for (let i = 0; i < tx.inputs.length; i++) {
            console.log(i);
            let input = tx.inputs[i];
            let uxto = this.findUxto(input.txId, input.txIndex);
            console.log(uxto);
            if (uxto === null) {
                console.log('Invalid transaction');
                return false;
            }

            if (uxto.address !== SHA256(input.sig[1]).toString()) {
                console.log('Invalid transaction');
                return false;
            }
            console.log("check");
            let key = ec.keyFromPublic(input.sig[1], 'hex');
            console.log(key.verify(tx.txId, input.sig[0]));
            if (!(key.verify(tx.txId, input.sig[0]))) {
                console.log('Invalid transaction');
                return false;
            }
        }
        console.log('Transaction verified');
        return true;
    }

    findUxto(txId, txIndex) {
        for (let i = 0; i < utxo.length; i++) {
            if (utxo[i].txId === txId && utxo[i].txIndex === txIndex) {
                return utxo[i];
            }
        }
        return null;
    }

    createCoinbaseTransaction(receiver, amount) {
        let tx = new Transaction([], [new TransactionOutput(receiver, amount)]);
        tx.txId = SHA256(JSON.stringify(tx)).toString();
        return tx;
    }


    //mining that takes at most first 3 transactions in the mempool
    Mining2(chain) {
      let count = 0;
      let del = [];
      let transaction = [];
      if (mempool.length === 0) {
        console.log("empty mempool");
        let tx = this.createCoinbaseTransaction(this.pubhash, 10);
        transaction.push(tx);
        let block = new Block(transaction);
        chain.addBlock(block);
        utxo.push(new UXTO(tx.txId, 0, this.pubhash, 10));
        console.log("mining success");
        return;
      }
      console.log("transaction: ---------------------------------------------------");
      if (mempool.length <= 3) {
        for (let i = 0; i < mempool.length; i++) {
            console.log(i)
          transaction.push(mempool[i]);
          count += 1;
        }
      } else {
         for (let i = 0; i < 3; i++) {
           count += 1;
           transaction.push(mempool[i]);
        }
        }
        transaction.push(this.createCoinbaseTransaction(this.pubhash, 10));
        console.log("----------------------number of transaction------------------------");
        console.log(transaction);
        let block = new Block(transaction);
        chain.addBlock(block);

        for (let i = 0; i < transaction.length; i++) {
            let tx = transaction[i];
            for (let j = 0; j < tx.inputs.length; j++) {
                let input = tx.inputs[j];
                for (let k = 0; k < utxo.length; k++) {
                if (utxo[k].txId === input.txId && utxo[k].txIndex === input.txIndex) {
                    utxo.splice(k, 1);
                    break;
                }
                }
            }
            for (let j = 0; j < tx.outputs.length; j++) {
                let output = tx.outputs[j];
                utxo.push(new UXTO(tx.txId, j, output.receiver, output.amount));
            }
        }

        mempool.splice(0, count);
    }
}


let COMP4114Coin = new Blockchain();
let node1 = new Node();
console.log("node1: "+node1.pubhash);
let node2 = new Node();
console.log("node2: "+node2.pubhash);
//let genesis = COMP4114Coin.chain[0];
let node3 = new Node();
console.log("node3: "+node3.pubhash);

//console.log(genesis);
node1.Mining2(COMP4114Coin);
//console.log(utxo);
node1.initiateTransaction(node2.pubhash, 5);
node2.Mining2(COMP4114Coin);
console.log(utxo);
node1.initiateTransaction(node2.pubhash, 3);
node2.initiateTransaction(node3.pubhash, 4);
node1.Mining2(COMP4114Coin);
console.log(utxo);
console.log(COMP4114Coin);




//console.log(utxo);
//////////////////////////MAIN//////////////////////////
//const EC = require('elliptic').ec;
//const ec = new EC('secp256k1');
//const key = ec.genKeyPair();
//const publicKey = key.getPublic('hex');
//const privateKey = key.getPrivate('hex');
//console.log('Private key: ', privateKey);
//console.log('Public key: ', publicKey);
//var msgHash = [ 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10 ];
//var signature = key.sign(msgHash);
//console.log('Signature: ', signature);

//let COMP4114Coin = new Blockchain();
///let date = new Date().toISOString();

//COMP4114Coin.addBlock(new Block({amount: 8}))
//COMP4114Coin.addBlock(new Block({amount: 2}))
//COMP4114Coin.addBlock(new Block({amount: 5}))
//COMP4114Coin.addBlock(new Block({amount: 8}))
//COMP4114Coin.addBlock(new Block({amount: 4}))
//COMP4114Coin.addBlock(new Block({amount: 87}))
//COMP4114Coin.addBlock(new Block({amount: 81}))
//COMP4114Coin.addBlock(new Block({amount: 80}))

//console.log(JSON.stringify(COMP4114Coin,null, 2));
//console.log(COMP4114Coin.getBalanceOfAddress('ac'));

console.log('Is blockchain valid? ' + COMP4114Coin.isChainValid());

module.exports = Blockchain;