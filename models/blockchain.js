const mongoose = require('mongoose')
let Schema = mongoose.Schema;

const blockchiainSchema = new Schema({
    difficulty:{
        required: true, 
        type: Schema.Types.Number
        
    },
    chain : {
        require: true,
        type: Schema.Types.Array
    }
})

/*
Blockchain {
    difficulty: 10,
    chain: [
      Block {
        data: [Array],
        merkleRoot: '2e1cfa82b035c26cbbbdae632cea070514eb8b773f616aaeaf668e2f0be8f10d',
        nonce: 709,
        index: 0,
        difficulty: 10,
        previousHash: '0',
        timestamp: 1669218840,
        hash: '0037d0516dfebc63c5a6e70e5303e341a2d2c5acb9fc6455e7d3466e809fa5bd'
      },
      Block {
        data: [Array],
        merkleRoot: '4ea5c508a6566e76240543f8feb06fd457777be39549c4016436afda65d2330e',
        nonce: 111,
        difficulty: 10,
        index: 1,
        previousHash: '0037d0516dfebc63c5a6e70e5303e341a2d2c5acb9fc6455e7d3466e809fa5bd',
        timestamp: 1669218840,
        hash: '003dcf8be2017b3120f264aff64e527cd479ada2ddc637fbea53a61d9ae09c26'
      },
      Block {
        data: [Array],
        merkleRoot: 'c491327d711c1ca698788d3cd53b69d1c836d39af819f92bd338361cdc587228',
        nonce: 276,
        difficulty: 10,
        index: 2,
        previousHash: '003dcf8be2017b3120f264aff64e527cd479ada2ddc637fbea53a61d9ae09c26',
        timestamp: 1669218840,
        hash: '001dcdee7146d40b3742a36610d9ee0c4e2e6c3ceb5c337a3273e6919c817916'
      },
      Block {
        data: [Array],
        merkleRoot: '59f720959de97fe3a547148d36dc86fac7ec99b70cbdabe0120ee6648924628e',
        nonce: 276,
        difficulty: 10,
        index: 3,
        previousHash: '001dcdee7146d40b3742a36610d9ee0c4e2e6c3ceb5c337a3273e6919c817916',
        timestamp: 1669218840,
        hash: '00100b1e75c29752a9a09d65a89dc4077460e415a55f18a8d8b0548283d78807'
      }
    ]
  }
*/

module.exports = mongoose.model('blockchain', blockchiainSchema)