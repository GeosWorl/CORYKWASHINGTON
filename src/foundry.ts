import { ChainId, getClient } from '@bgd-labs/toolbox';
import { execSync } from 'child_process';

// Extend the ChainId object locally
const ExtendedChainId = {
  ...ChainId,
  NEW_CHAIN: 9999, // Replace 9999 with the actual chain ID
};

// Update the getChainName function to use the extended ChainId
function getChainName(chainId: number): string {
  const chainName = Object.keys(ExtendedChainId)
    .find((key) => ExtendedChainId[key as keyof typeof ExtendedChainId] === chainId)
    ?.toLowerCase();

  if (!chainName) {
    throw new Error(`Invalid chain ID: ${chainId}`);
  }

  return chainName;
}

export function simulateViaFoundry(
  payload: { chain: bigint | number; payloadId: number | bigint },
  blockNumber: number | bigint
) {
  const chainId = Number(payload.chain);
  const chainName = getChainName(chainId);

  const client = getClient(chainId, {
    providerConfig: {
      alchemyKey: process.env.ALCHEMY_API_KEY || '',
      quicknodeToken: process.env.QUICKNODE_TOKEN || '',
      quicknodeEndpointName: process.env.QUICKNODE_ENDPOINT_NAME || '',
    },
  });

  if (!client.transport.url) {
    throw new Error('Client transport URL is undefined.');
  }

  const command = [
    `FOUNDRY_PROFILE=${chainName}`,
    `forge script ${
      chainId === ChainId.zksync ? 'zksync/' : ''
    }script/E2EPayload.s.sol:E2EPayload`,
    chainId === ChainId.zksync ? '--zksync' : '',
    `--fork-url ${client.transport.url}`,
    blockNumber !== 0n ? `--fork-block-number ${blockNumber}` : '',
    '-vvvv',
    `--sig "run(uint40)" -- ${payload.payloadId}`,
  ]
    .filter(Boolean)
    .join(' ');

  if (process.env.VERBOSE === 'true') {
    console.log('Executing command:', command);
  }

  try {
    return execSync(command, { stdio: 'inherit' });
  } catch (error) {
    console.error('Error executing command:', error);
    throw error;
  }
}
