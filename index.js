const { ethers } = require("ethers");
const crypto = require("crypto");

// New contract address
const contractAddress = "0xEE9115A1096630056da826494448B833f138DECd";

// Generate a new wallet
const wallet = ethers.Wallet.createRandom();
console.log("New Wallet Address:", wallet.address);

// Encrypt the private key
const password = "bubblegum";
const cipher = crypto.createCipher("aes-256-cbc", password);
let encryptedPrivateKey = cipher.update(wallet.privateKey, "utf8", "hex");
encryptedPrivateKey += cipher.final("hex");

// Store the encrypted private key securely
console.log("Encrypted Private Key:", encryptedPrivateKey);

// Decrypt function for later use
function decryptPrivateKey(encryptedKey, password) {
  const decipher = crypto.createDecipher("aes-256-cbc", password);
  let decryptedPrivateKey = decipher.update(encryptedKey, "hex", "utf8");
  decryptedPrivateKey += decipher.final("utf8");
  return decryptedPrivateKey;
}

// Connect to the Ethereum network
const provider = new ethers.providers.InfuraProvider("mainnet", "yourinfuraproject_id");

// Decrypt the private key to use it
const decryptedPrivateKey = decryptPrivateKey(encryptedPrivateKey, password);
const walletWithProvider = new ethers.Wallet(decryptedPrivateKey, provider);

// Interact with the contract
const contractABI = [
  // ...existing ABI...
];
const contract = new ethers.Contract(contractAddress, contractABI, walletWithProvider);

// Example function to interact with the contract
async function callContractFunction() {
  const result = await contract.yourFunction(); // Replace with your function
  console.log(result);
}

callContractFunction().catch(console.error);
