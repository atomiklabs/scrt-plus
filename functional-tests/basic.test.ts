import { SecretNetworkClient, Wallet } from "secretjs";
import fs from 'fs';
import { MsgCreateViewingKey } from "secretjs/dist/extensions/access_control/viewing_key/msgs";

jest.setTimeout(1000 * 60 * 5);

// Test accounts data from https://docs.scrt.network/dev/LocalSecret.html#accounts

const TEST_ACCOUNT_A_MNEMONIC =
  "grant rice replace explain federal release fix clever romance raise often wild taxi quarter soccer fiber love must tape steak together observe swap guitar";

const TEST_ACCOUNT_B_MNEMONIC =
  "jelly shadow frog dirt dragon use armed praise universe win jungle close inmate rain oil canvas beauty pioneer chef soccer icon dizzy thunder meadow";

const TEST_ACCOUNT_C_MNEMONIC =
  "chair love bleak wonder skirt permit say assist aunt credit roast size obtain minute throw sand usual age smart exact enough room shadow charge";

type SetupArgs = {
  wallet?: Wallet;
  walletAddress?: string;
}

let wallets: Array<Wallet>;

const _defaultSetup: SetupArgs = {
  wallet: undefined,
  walletAddress: undefined,
}

beforeAll(() => {
  wallets = [TEST_ACCOUNT_A_MNEMONIC, TEST_ACCOUNT_B_MNEMONIC, TEST_ACCOUNT_C_MNEMONIC].map(m => new Wallet(m));
})

afterAll(() => {
  wallets = []
})

async function setup({ wallet, walletAddress }: SetupArgs = _defaultSetup) {
  const client = await SecretNetworkClient.create({
    chainId: "secretdev-1",
    grpcWebUrl: "http://localhost:9091",
    wallet,
    walletAddress,
  });

  return { client };
}

async function setupSnipix({ wallet, walletAddress }: SetupArgs = _defaultSetup) {
  const { client } = await setup({ wallet, walletAddress })
  const { contractAddress, contractCodeHash } = await initializeContract(client, '/workspace/scrt-network-dev-setup-example/artifacts/snipix.wasm')

  return { client, contractAddress, contractCodeHash };
}

async function initializeContract(client: SecretNetworkClient, contractPath: string) {
  const wasmCode = fs.readFileSync(contractPath)
  console.log('Uploading contract')

  const uploadReceipt = await client.tx.compute.storeCode(
    {
      wasmByteCode: wasmCode,
      sender: client.address,
      source: '',
      builder: '',
    },
    {
      gasLimit: 5000000,
    }
  )

  if (uploadReceipt.code !== 0) {
    console.log(`Failed to get code id: ${JSON.stringify(uploadReceipt.rawLog)}`)
    throw new Error(`Failed to upload contract`)
  }

  const codeIdKv = uploadReceipt.jsonLog![0].events[0].attributes.find((a: any) => {
    return a.key === 'code_id'
  })

  const codeId = Number(codeIdKv!.value)
  console.log('Contract codeId: ', codeId)

  const contractCodeHash = await client.query.compute.codeHash(codeId)
  console.log(`Contract hash: ${contractCodeHash}`)

  const prngSeed = 'ZW5pZ21hLXJvY2tzCg==';
  console.log({ prngSeed })
  const initMsg = {
    "admin": null,
    "config": null,
    "decimals": 6,
    "initial_balances": null,
    "name": "atl-snp-20",
    "prng_seed": prngSeed,
    "symbol": "ATLSPX"
  }
  console.log({ initMsg })
  const contract = await client.tx.compute.instantiateContract(
    {
      sender: client.address,
      codeId,
      initMsg, // Initialize our counter to start from 4. This message will trigger our Init function
      codeHash: contractCodeHash,
      label: 'My contract' + Math.ceil(Math.random() * 10000), // The label should be unique for every contract, add random string in order to maintain uniqueness
    },
    {
      gasLimit: 1000000,
    }
  )

  if (contract.code !== 0) {
    throw new Error(`Failed to instantiate the contract with the following error ${contract.rawLog}`)
  }

  const contractAddress = contract.arrayLog!.find(
    log => log.type === 'message' && log.key === 'contract_address'
  )!.value

  console.log(`Contract address: ${contractAddress}`)

  return { contractCodeHash, contractAddress }
}

describe("basic setup", () => {
  it("handles bank transfers", async () => {
    const alice = wallets[0];
    const bob = wallets[1];

    const { client } = await setup({
      wallet: bob,
      walletAddress: bob.address
    });

    const balance_response_pre = await client.query.bank.balance({
      address: alice.address,
      denom: "uscrt",
    });

    const transferAmount = 789_321;
    const amount = transferAmount.toString();

    const transfer = await client.tx.bank.send({
      fromAddress: bob.address,
      toAddress: alice.address,
      amount: [{ amount, denom: "uscrt" }],
    });

    expect(transfer.code).toEqual(0);

    const balance_response_post = await client.query.bank.balance({
      address: alice.address,
      denom: "uscrt",
    });

    const state = {
      balance_response_pre: BigInt(balance_response_pre?.balance?.amount!),
      balance_response_post: BigInt(balance_response_post?.balance?.amount!),
    }

    expect(state.balance_response_pre + BigInt(amount)).toBe(
      state.balance_response_post
    );
  });
});

describe("snipix setup", () => {
  it("should instantiate SNIP-20 token contract", async () => {
    const bob = wallets[1];

    const { client, contractAddress } = await setupSnipix({
      wallet: bob,
      walletAddress: bob.address
    });

    expect(client).toBeDefined();

    expect(contractAddress).toBeDefined();
  })

  it.only("should create viewing key", async () => {
    const bob = wallets[1];

    const { client, contractAddress, contractCodeHash } = await setupSnipix({
      wallet: bob,
      walletAddress: bob.address
    });

    const result = await client.tx.compute.executeContract(
      new MsgCreateViewingKey({
        codeHash: contractCodeHash,
        msg: {
          create_viewing_key: {
            entropy: 'badabing'
          }
        },
        sender: client.address,
        contractAddress,
      })
    );

    expect(result).toBeDefined();

    const viewingKey = result.data[0];

    console.log(viewingKey)
  })
})