const express = require('express')
const router = express.Router()
const Blockchain = require('../models/blockchain')
const chain = require('../buildChain')

// Get all
router.get('/', async (req,res) =>{
    try{
        const blockchains = await Blockchain.find()
        res.json(blockchains)
    } catch (err) {
        res.status(500).json({message: err.message})
    }
})

router.get('/:id', getBlockchain, (req,res) =>{
    res.send(req.blockchain.name)
})

router.post('/', async (req,res) =>{
     
    const tempChain = new chain();
    const blockchain = new Blockchain({
        difficulty: tempChain.difficulty,
        chain: tempChain.chain
    })

    try {
        const newChain = await blockchain.save()
        res.status(201).json(newChain)
    } catch(err){
        res.status(400).json({message: err.message})
    }
})

// patch: update base on the id, put will update all the info
router.patch('/', getBlockchain ,(req,res) =>{
    
})

router.delete('/:id', getBlockchain, async (req,res) =>{
    try {
        await res.blockchain.remove()
        res.json({message: 'Deleted Blockchain'})
    } catch (err){
        res.status(500).json({message: err.message})
    }
})

async function getBlockchain(req,res,next){
    let blockchain
    try {
        blockchain = await Blockchain.findById(req.params.id)
        if (blockchain == null){
            return res.status(400).json({ message: 'Cannot find blockchain'})
        }
    } catch (err) {
        return res.status(500).json({message: err.message})
    }

    res.blockchain = blockchain
    next()
}

module.exports = router