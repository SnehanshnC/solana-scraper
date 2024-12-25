import { Connection, PublicKey } from "@solana/web3.js";
import dotenv from "dotenv";

dotenv.config(); // Load environment variables from .env file

const HELIUS_API_KEY = process.env.HELIUS_API_KEY;

if (!HELIUS_API_KEY) {
  throw new Error("HELIUS_API_KEY is not set in the .env file.");
}

// 2. Helius RPC URL (mainnet)
const connection = new Connection(
  `https://rpc.helius.xyz/?api-key=${HELIUS_API_KEY}`
);

// 3. A sample transaction signature (base-58 encoded).
// Replace with your actual signature that sells or transfers WSOL.
const TRANSACTION_SIGNATURE =
  "3Zwewzar6cFPd7u1wXjThtVw4J6yCndnfJeFW9tRgBngGPBSHfsMVeoZ2VapCqFdpvJVGRTxLQR7Y9xBSbmhwsCM";

// 4. WSOL Mint (mainnet)
const WSOL_MINT = "So11111111111111111111111111111111111111112";

// Helper: Extract WSOL differences from pre/post token balances
function getWsolChange(preTokenBalances, postTokenBalances) {
  // Find WSOL entries
  const preWsol = preTokenBalances.find((b) => b.mint === WSOL_MINT);
  const postWsol = postTokenBalances.find((b) => b.mint === WSOL_MINT);

  const preAmount = preWsol
    ? parseFloat(preWsol.uiTokenAmount.uiAmountString || "0")
    : 0;
  const postAmount = postWsol
    ? parseFloat(postWsol.uiTokenAmount.uiAmountString || "0")
    : 0;

  // Net change (could be positive or negative)
  return postAmount - preAmount;
}

(async () => {
  try {
    // 1) Fetch parsed transaction data
    const parsedTx = await connection.getParsedTransaction(
      TRANSACTION_SIGNATURE,
      {
        maxSupportedTransactionVersion: 2, // or just 'finalized'
      }
    );

    if (!parsedTx) {
      console.log("Transaction not found or not finalized.");
      return;
    }

    // 2) Get pre/post balances
    const preTokenBalances = parsedTx.meta?.preTokenBalances || [];
    const postTokenBalances = parsedTx.meta?.postTokenBalances || [];

    // 3) Calculate the net WSOL difference
    const wsolChange = getWsolChange(preTokenBalances, postTokenBalances);

    if (wsolChange === 0) {
      console.log("No WSOL movement in this transaction.");
    } else if (wsolChange > 0) {
      console.log(`WSOL amount: ${wsolChange} WSOL`);
    } else {
      console.log(`WSOL amount: ${Math.abs(wsolChange)} WSOL`);
    }

    // You can also inspect the entire transaction to see
    // token accounts, instructions, logs, etc.
  } catch (error) {
    console.error("Error fetching or parsing transaction:", error);
  }
})();
