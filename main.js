// const crypto = require('crypto'), SHA256 = message => crypto.createHash('sha256').update(message).digest('hex')

const SHA256 = require('crypto-js/sha256')
multiplier = 15600000; //arbitrary number that gives close to blockTime.

// log16 in case we need it
function log16(val) {
  return Math.log(val) / Math.log(16);
}

// Block class
// we use SHA256 to calc the hash
// very simplistic mining function - checks difficulty against current hash
class Block{
    constructor( index, timestamp, data, previousHash = ''){
        this.index = index;
        this.timestamp = timestamp;
        this.data = data;
        this.previousHash = previousHash;
        this.hash = this.calculateHash();
        this.nonce = 0;
    }
    calculateHash(){
        return SHA256(JSON.stringify(this.data) + this.timestamp + this.previousHash + this.nonce).toString();
    }
    mineBlock(difficulty){
        // while(this.hash.substring(0,difficulty) !== Array(difficulty + 1).join("0")){        
        while (parseInt(this.hash,16) > 2**(256-Math.log(difficulty*multiplier))) {
            this.nonce++;
            this.hash = this.calculateHash()
        }
        console.log("nonce ......... " + this.nonce);
        console.log("block mined .. " + this.hash)
    }
}

// Blockhain class
//
class BlockChain {
    constructor(difficulty, blocktime){
        this.chain = [this.createGenesisBlock()];
        this.difficulty = difficulty;
        this.blockTime = blocktime;
    }
    createGenesisBlock(){
        return new Block(0, Date.now().toString(), "Genesis Block","0");
    }

    getLatestBlock(){
        return this.chain[this.chain.length - 1]
    }

    // Add new block to the blockchain
    // uses mining before adding
    // checks to see if we're up or down against the blocktime and adjust incrementally
    addBlock(newBlock){
        newBlock.previousHash = this.getLatestBlock().hash;
        newBlock.mineBlock(this.difficulty)
        this.chain.push(newBlock)
        this.difficulty += Date.now() - parseInt(this.getLatestBlock().timestamp) < this.blockTime ? 1 : -1;
    }

    // checks if blockchain has been tampered with
    isChainValid(){
        for (let index = 1; index < this.chain.length; index++) {
            const currentBlock = this.chain[index];
            const previousBlock = this.chain[index -1];
            if(currentBlock.hash != currentBlock.calculateHash() ){
                return false;
            }
            if (currentBlock.previousHash != previousBlock.hash) {
                return false;
            }            
        }
        return true;
    }
}


// Create a blockchain with difficulty set to n and t blocktime
n = 1;
t = 1000; // 1 seconds
blocks = 10; // total blocks to create
const TaChain = new BlockChain(n,t);

console.log("mining genesis block ...")
// TaChain.addBlock(new Block(1, Date.now().toString(),{ amount: 4 }));
// console.log("mining block 2....");

let start = process.hrtime();

// create some blocks for testing
for (let index = 1; index < blocks; index++) {
    console.log("\nchain valid ... " + TaChain.isChainValid());
    console.log("difficulty .... " + TaChain.difficulty);
    console.log("mining block .. " + index);
    TaChain.addBlock(new Block(1, Date.now().toString(), { amount: index }));
//   if (TaChain.isChainValid()) {
//     TaChain.addBlock(new Block(1, Date.now().toString(), { amount: index }));
//   }
}

let stop = process.hrtime(start);
console.log(JSON.stringify(TaChain, null, 4));
console.log(
  `Time Taken to execute: ${(stop[0] * 1e9 + stop[1]) / 1e9} seconds`
);