import { Account, AllowArray, Call, hash, InvocationsSignerDetails, RPC, stark, transaction, TransactionType, uint256, UniversalDetails, V2InvocationsSignerDetails, V3InvocationsSignerDetails } from "starknet";
import { MERCENARIES_CROSSBOWMEN_LOWER_BOUND, MERCENARIES_CROSSBOWMEN_UPPER_BOUND, MERCENARIES_KNIGHTS_LOWER_BOUND, MERCENARIES_KNIGHTS_UPPER_BOUND, MERCENARIES_PALADINS_LOWER_BOUND, MERCENARIES_PALADINS_UPPER_BOUND } from "../constants";


function getKnights(transactionHash: bigint, salt: bigint): number {
    const seed = uint256.bnToUint256(BigInt(salt));
    const rng = random(transactionHash, BigInt(seed.low), BigInt(MERCENARIES_KNIGHTS_UPPER_BOUND * 1000 - MERCENARIES_KNIGHTS_LOWER_BOUND * 1000));
    const value = Number(rng) + MERCENARIES_KNIGHTS_LOWER_BOUND * 1000;
    return Math.floor(value / 1000);
}

function getPaladins(transactionHash: bigint, salt: bigint): number {
    const seed = uint256.bnToUint256(BigInt(salt));
    const rng = random(transactionHash, BigInt(seed.low), BigInt(MERCENARIES_PALADINS_UPPER_BOUND * 1000 - MERCENARIES_PALADINS_LOWER_BOUND * 1000));
    const value = Number(rng) + MERCENARIES_PALADINS_LOWER_BOUND * 1000;
    return Math.floor(value / 1000);
}

function getCrossbowmen(transactionHash: bigint, salt: bigint): number {
    const seed = uint256.bnToUint256(BigInt(salt));
    const rng = random(transactionHash, BigInt(seed.low), BigInt(MERCENARIES_CROSSBOWMEN_UPPER_BOUND * 1000 - MERCENARIES_CROSSBOWMEN_LOWER_BOUND * 1000));
    const value = Number(rng) + MERCENARIES_CROSSBOWMEN_LOWER_BOUND * 1000;
    return Math.floor(value / 1000);
}

// Génère une valeur aléatoire dans une limite donnée
function random(transactionHash: bigint, salt: bigint, upperBound: bigint): bigint {
    const seed = makeSeedFromTransactionHash(transactionHash, salt);
    const seedUint256 = uint256.bnToUint256(BigInt(seed));
    return BigInt(seedUint256.low) % upperBound;
}

function makeSeedFromTransactionHash(transactionHash: bigint, salt: bigint): bigint {
    const value = hash.computePoseidonHashOnElements([transactionHash, salt]);
    return BigInt(value); // Poseidon retourne un BigInt
}

// Retourne une liste de k éléments choisis aléatoirement dans la population
function choices<T>(
    population: T[],
    weights: bigint[] = [],
    cumWeights: bigint[] = [],
    k: number,
    withReplacement: boolean,
    transactionHash: string,
    blockTimestamp: number
): T[] {
    const n = population.length;
    let salt = BigInt(blockTimestamp);
    let txHash = BigInt(transactionHash);
    const result: T[] = [];

    if (cumWeights.length === 0) {
        if (weights.length === 0) {
            for (let i = 0; i < k; i++) {
                const index = Number(random(txHash, salt + BigInt(i), BigInt(n)));
                result.push(population[index]);
            }
            return result;
        }

        // Calcule la somme cumulative des poids
        cumWeights = cumSum(weights);
    } else if (weights.length > 0) {
        throw new Error("Cannot specify both weights and cumulative weights.");
    }

    if (cumWeights.length !== n) {
        throw new Error("Weight length mismatch.");
    }

    const total = cumWeights[cumWeights.length - 1];
    if (total === BigInt(0)) {
        throw new Error("Weights sum is zero.");
    }

    const hi = n - 1;
    const chosenIndexMap = new Map<number, boolean>();

    for (let i = 0; i < k; ) {
        salt += BigInt(18);

        const chosenIndex = bisectRight(cumWeights, random(txHash, salt, total), 0, hi);
        if (!withReplacement) {
            if (!chosenIndexMap.has(chosenIndex)) {
                chosenIndexMap.set(chosenIndex, true);
                result.push(population[chosenIndex]);
                i++;
            }
        } else {
            result.push(population[chosenIndex]);
            i++;
        }
    }

    return result;
}

// Retourne la somme cumulative d'une liste de valeurs
function cumSum(values: bigint[]): bigint[] {
    const result: bigint[] = [];
    let total = BigInt(0);
    for (const value of values) {
        total += value;
        result.push(total);
    }
    return result;
}

// Retourne l'index où insérer un élément dans une liste triée
function bisectRight(array: bigint[], x: bigint, lo: number, hi: number): number {
    while (lo < hi) {
        const mid = Math.floor((lo + hi) / 2);
        if (x < array[mid]) {
            hi = mid;
        } else {
            lo = mid + 1;
        }
    }
    return lo;
}

export { bisectRight, choices, cumSum, random };


export const calculateTxHash = async (
    transactions: Call[],
    details: InvocationsSignerDetails
  ): Promise<string> => {
    const compiledCalldata = transaction.getExecuteCalldata(transactions, details.cairoVersion);
    let msgHash;

    // TODO: How to do generic union discriminator for all like this
    if (Object.values(RPC.ETransactionVersion2).includes(details.version as any)) {
      const det = details as V2InvocationsSignerDetails;
      msgHash = hash.calculateInvokeTransactionHash({
        ...det,
        senderAddress: det.walletAddress,
        compiledCalldata,
        version: det.version,
      });
    } else if (Object.values(RPC.ETransactionVersion3).includes(details.version as any)) {
      const det = details as V3InvocationsSignerDetails;
      msgHash = hash.calculateInvokeTransactionHash({
        ...det,
        senderAddress: det.walletAddress,
        compiledCalldata,
        version: det.version,
        nonceDataAvailabilityMode: stark.intDAM(det.nonceDataAvailabilityMode),
        feeDataAvailabilityMode: stark.intDAM(det.feeDataAvailabilityMode),
      });
    } else {
      throw Error('unsupported signTransaction version');
    }

    return msgHash;
  }


export async function getEstimate(account: Account, transactions: AllowArray<Call>, transactionsDetail: UniversalDetails = {}): Promise<any> {
    const details = transactionsDetail;
    const version = stark.toTransactionVersion(
        (account as any).getPreferredVersion(RPC.ETransactionVersion.V1, RPC.ETransactionVersion.V3), // TODO: does account depend on cairo version ?
        details.version
    );
    return (account as any).getUniversalSuggestedFee(
        version,
        { type: TransactionType.INVOKE, payload: transactions },
        {
            ...details,
            version,
        }
    );
}

export async function computeTxHash(
    account: Account,
    nonce: bigint,
    timestamp: number,
    chainId: any,
    cairoVersion: any,
    transactions: AllowArray<Call>,
    details: UniversalDetails = {}
): Promise<{ txHash: string; amount: number }> {
    const version = stark.toTransactionVersion(
        (account as any).getPreferredVersion(RPC.ETransactionVersion.V1, RPC.ETransactionVersion.V3), // TODO: does this depend on cairo version ?
        details.version
    );
    const signerDetails: InvocationsSignerDetails = {
        ...stark.v3Details(details),
        resourceBounds: details.resourceBounds!,
        walletAddress: account.address,
        nonce,
        maxFee: details.maxFee!,
        version,
        chainId,
        cairoVersion: await account.getCairoVersion(),
    };
    console.log("computeTxHash", transactions, signerDetails);
    const msgHash = await calculateTxHash(transactions as Call[], signerDetails);

    const knights = getKnights(BigInt(msgHash), BigInt(msgHash));
    const paladins = getPaladins(BigInt(msgHash), BigInt(timestamp));
    const crossbowmen = getCrossbowmen(BigInt(msgHash), BigInt(nonce));
    const amount = knights + paladins + crossbowmen;

    return { txHash: msgHash, amount };
}