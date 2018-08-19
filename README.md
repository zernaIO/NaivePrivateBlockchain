# NaivePrivateBlockchain

**This project is for training purposes. Although it bears the term PrivateBlockchain in its name, this is not a complete implementation of a full blockchain. There is no consensus on this and there are still a few security features missing. In other words, please do not use the code in production :) .**

# Features

  * Run simulation and step throw every single feature which are described below.
  * Generate genesis Block.
  * Add blocks to chain.
  * Get blockchain statistics.
  * Verify blockchain.
  
# Limitations
  * The project was build with node version 8.9.4. To switch between the node versions, I recommend to use nvm. Within the project there is a .nvmrc file, which should make it easier to change the node version within the project.
  * Add the moment it is just possible to run the whole blockchain simulation on empty leveldb. Please delete your db before run blockchain:simulation or use another DB variable described in your env file.
  
# Get Started
  * Clone the project
  * Run `npm install` 
  * Run `npm run build` This should build the core and executes the tests.
  * Rename the `.env.example` to `.env` and get familiar with the variables which you can control.
  
# Customize your experience 
  * Rename DB variable within your `.env` file. This switching your db.
  * Exchange value of BLOCKS_TO_CREATE within your `.env` file. This value is responsible for how many blocks are created.

# Short recap about the service invocation 
This project is controlled via env parameters.More precisely, the environment variables are used to decide which service is to be called. If this variable is not set, a warning is output and a default is used. This default is currently the verification of the blockchain. 
So that not every service key has to be known, all service calls are provided as npm script. These are now presented.
   * `npm run blockchain:service:genesis` will generate a genesis block. As in this version it will override existing genesis blocks. Please use a new DB or delete a existing LevelDB directory.
   * `npm run blockchain:service:createBlocks` will generate a specific number of blocks. It will throw an error if the genesis block was not found.
   * `npm run blockchain:service:stats` will output simple blockchain statistics.
   * `npm run blockchain:service:verify` will verify the hashes of every block on the chain out outputs the result.
   * `npm run blockchain:simulation` runs every command above in order.