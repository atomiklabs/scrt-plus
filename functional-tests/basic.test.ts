import { SecretNetworkClient, Wallet } from "secretjs";


jest.setTimeout(15_000);

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

    const transfer = await client.tx.bank.send({
      fromAddress: bob.address,
      toAddress: alice.address,
      amount: [{ amount: transferAmount.toString(), denom: "uscrt" }],
    });

    expect(transfer.code).toEqual(0);

    const balance_response_post = await client.query.bank.balance({
      address: alice.address,
      denom: "uscrt",
    });

    expect(parseInt(balance_response_pre?.balance?.amount!, 10)).toBe(
      parseInt(balance_response_post?.balance?.amount!, 10) - transferAmount
    );
  });
});
