import { Buffer } from "buffer";
import { Address } from '@stellar/stellar-sdk';
import {
  AssembledTransaction,
  Client as ContractClient,
  ClientOptions as ContractClientOptions,
  MethodOptions,
  Result,
  Spec as ContractSpec,
} from '@stellar/stellar-sdk/contract';
import type {
  u32,
  i32,
  u64,
  i64,
  u128,
  i128,
  u256,
  i256,
  Option,
  Typepoint,
  Duration,
} from '@stellar/stellar-sdk/contract';
export * from '@stellar/stellar-sdk'
export * as contract from '@stellar/stellar-sdk/contract'
export * as rpc from '@stellar/stellar-sdk/rpc'

if (typeof window !== 'undefined') {
  //@ts-ignore Buffer exists
  window.Buffer = window.Buffer || Buffer;
}


export const networks = {
  testnet: {
    networkPassphrase: "Test SDF Network ; September 2015",
    contractId: "CA72AEQGZX4J4T6ODLQ34CCN7B74TOVYSP6KLLZBAOC23YPMTK6N2NRD",
  }
} as const


export interface Campaign {
  deadline: u64;
  donations: Map<string, i128>;
  goal: i128;
  owner: string;
  raised: i128;
  token: string;
}

export interface Client {
  /**
   * Construct and simulate a create_campaign transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   * Membuat campaign baru.
   * Siapapun bisa memanggil ini.
   * Mengembalikan ID (u64) dari campaign yang baru dibuat.
   */
  create_campaign: ({owner, goal, deadline, token}: {owner: string, goal: i128, deadline: u64, token: string}, options?: {
    /**
     * The fee to pay for the transaction. Default: BASE_FEE
     */
    fee?: number;

    /**
     * The maximum amount of time to wait for the transaction to complete. Default: DEFAULT_TIMEOUT
     */
    timeoutInSeconds?: number;

    /**
     * Whether to automatically simulate the transaction when constructing the AssembledTransaction. Default: true
     */
    simulate?: boolean;
  }) => Promise<AssembledTransaction<u64>>

  /**
   * Construct and simulate a donate transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   * Donasi ke campaign tertentu menggunakan token transfer
   */
  donate: ({campaign_id, donor, amount}: {campaign_id: u64, donor: string, amount: i128}, options?: {
    /**
     * The fee to pay for the transaction. Default: BASE_FEE
     */
    fee?: number;

    /**
     * The maximum amount of time to wait for the transaction to complete. Default: DEFAULT_TIMEOUT
     */
    timeoutInSeconds?: number;

    /**
     * Whether to automatically simulate the transaction when constructing the AssembledTransaction. Default: true
     */
    simulate?: boolean;
  }) => Promise<AssembledTransaction<null>>

  /**
   * Construct and simulate a refund transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   * Refund mechanism jika campaign gagal (hanya bisa dipanggil oleh donatur)
   */
  refund: ({campaign_id, donor}: {campaign_id: u64, donor: string}, options?: {
    /**
     * The fee to pay for the transaction. Default: BASE_FEE
     */
    fee?: number;

    /**
     * The maximum amount of time to wait for the transaction to complete. Default: DEFAULT_TIMEOUT
     */
    timeoutInSeconds?: number;

    /**
     * Whether to automatically simulate the transaction when constructing the AssembledTransaction. Default: true
     */
    simulate?: boolean;
  }) => Promise<AssembledTransaction<i128>>

  /**
   * Construct and simulate a get_campaign transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   * Get data lengkap dari satu campaign (untuk frontend)
   */
  get_campaign: ({id}: {id: u64}, options?: {
    /**
     * The fee to pay for the transaction. Default: BASE_FEE
     */
    fee?: number;

    /**
     * The maximum amount of time to wait for the transaction to complete. Default: DEFAULT_TIMEOUT
     */
    timeoutInSeconds?: number;

    /**
     * Whether to automatically simulate the transaction when constructing the AssembledTransaction. Default: true
     */
    simulate?: boolean;
  }) => Promise<AssembledTransaction<Campaign>>

  /**
   * Construct and simulate a get_next_id transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   * Get ID (u64) untuk campaign berikutnya
   */
  get_next_id: (options?: {
    /**
     * The fee to pay for the transaction. Default: BASE_FEE
     */
    fee?: number;

    /**
     * The maximum amount of time to wait for the transaction to complete. Default: DEFAULT_TIMEOUT
     */
    timeoutInSeconds?: number;

    /**
     * Whether to automatically simulate the transaction when constructing the AssembledTransaction. Default: true
     */
    simulate?: boolean;
  }) => Promise<AssembledTransaction<u64>>

  /**
   * Construct and simulate a get_total_raised transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   * Get total amount yang sudah terkumpul untuk campaign tertentu
   */
  get_total_raised: ({campaign_id}: {campaign_id: u64}, options?: {
    /**
     * The fee to pay for the transaction. Default: BASE_FEE
     */
    fee?: number;

    /**
     * The maximum amount of time to wait for the transaction to complete. Default: DEFAULT_TIMEOUT
     */
    timeoutInSeconds?: number;

    /**
     * Whether to automatically simulate the transaction when constructing the AssembledTransaction. Default: true
     */
    simulate?: boolean;
  }) => Promise<AssembledTransaction<i128>>

  /**
   * Construct and simulate a get_donation transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   * Get berapa banyak specific donor sudah donate ke campaign tertentu
   */
  get_donation: ({campaign_id, donor}: {campaign_id: u64, donor: string}, options?: {
    /**
     * The fee to pay for the transaction. Default: BASE_FEE
     */
    fee?: number;

    /**
     * The maximum amount of time to wait for the transaction to complete. Default: DEFAULT_TIMEOUT
     */
    timeoutInSeconds?: number;

    /**
     * Whether to automatically simulate the transaction when constructing the AssembledTransaction. Default: true
     */
    simulate?: boolean;
  }) => Promise<AssembledTransaction<i128>>

  /**
   * Construct and simulate a get_goal transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   * Get campaign goal amount
   */
  get_goal: ({campaign_id}: {campaign_id: u64}, options?: {
    /**
     * The fee to pay for the transaction. Default: BASE_FEE
     */
    fee?: number;

    /**
     * The maximum amount of time to wait for the transaction to complete. Default: DEFAULT_TIMEOUT
     */
    timeoutInSeconds?: number;

    /**
     * Whether to automatically simulate the transaction when constructing the AssembledTransaction. Default: true
     */
    simulate?: boolean;
  }) => Promise<AssembledTransaction<i128>>

  /**
   * Construct and simulate a get_deadline transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   * Get campaign deadline timestamp
   */
  get_deadline: ({campaign_id}: {campaign_id: u64}, options?: {
    /**
     * The fee to pay for the transaction. Default: BASE_FEE
     */
    fee?: number;

    /**
     * The maximum amount of time to wait for the transaction to complete. Default: DEFAULT_TIMEOUT
     */
    timeoutInSeconds?: number;

    /**
     * Whether to automatically simulate the transaction when constructing the AssembledTransaction. Default: true
     */
    simulate?: boolean;
  }) => Promise<AssembledTransaction<u64>>

  /**
   * Construct and simulate a is_goal_reached transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   * Check apakah campaign sudah reach goal
   */
  is_goal_reached: ({campaign_id}: {campaign_id: u64}, options?: {
    /**
     * The fee to pay for the transaction. Default: BASE_FEE
     */
    fee?: number;

    /**
     * The maximum amount of time to wait for the transaction to complete. Default: DEFAULT_TIMEOUT
     */
    timeoutInSeconds?: number;

    /**
     * Whether to automatically simulate the transaction when constructing the AssembledTransaction. Default: true
     */
    simulate?: boolean;
  }) => Promise<AssembledTransaction<boolean>>

  /**
   * Construct and simulate a is_ended transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   * Check apakah campaign sudah berakhir (deadline passed)
   */
  is_ended: ({campaign_id}: {campaign_id: u64}, options?: {
    /**
     * The fee to pay for the transaction. Default: BASE_FEE
     */
    fee?: number;

    /**
     * The maximum amount of time to wait for the transaction to complete. Default: DEFAULT_TIMEOUT
     */
    timeoutInSeconds?: number;

    /**
     * Whether to automatically simulate the transaction when constructing the AssembledTransaction. Default: true
     */
    simulate?: boolean;
  }) => Promise<AssembledTransaction<boolean>>

  /**
   * Construct and simulate a get_progress_percentage transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   * Calculate progress percentage dari campaign
   */
  get_progress_percentage: ({campaign_id}: {campaign_id: u64}, options?: {
    /**
     * The fee to pay for the transaction. Default: BASE_FEE
     */
    fee?: number;

    /**
     * The maximum amount of time to wait for the transaction to complete. Default: DEFAULT_TIMEOUT
     */
    timeoutInSeconds?: number;

    /**
     * Whether to automatically simulate the transaction when constructing the AssembledTransaction. Default: true
     */
    simulate?: boolean;
  }) => Promise<AssembledTransaction<i128>>

}
export class Client extends ContractClient {
  static async deploy<T = Client>(
    /** Options for initializing a Client as well as for calling a method, with extras specific to deploying. */
    options: MethodOptions &
      Omit<ContractClientOptions, "contractId"> & {
        /** The hash of the Wasm blob, which must already be installed on-chain. */
        wasmHash: Buffer | string;
        /** Salt used to generate the contract's ID. Passed through to {@link Operation.createCustomContract}. Default: random. */
        salt?: Buffer | Uint8Array;
        /** The format used to decode `wasmHash`, if it's provided as a string. */
        format?: "hex" | "base64";
      }
  ): Promise<AssembledTransaction<T>> {
    return ContractClient.deploy(null, options)
  }
  constructor(public readonly options: ContractClientOptions) {
    super(
      new ContractSpec([ "AAAAAQAAAAAAAAAAAAAACENhbXBhaWduAAAABgAAAAAAAAAIZGVhZGxpbmUAAAAGAAAAAAAAAAlkb25hdGlvbnMAAAAAAAPsAAAAEwAAAAsAAAAAAAAABGdvYWwAAAALAAAAAAAAAAVvd25lcgAAAAAAABMAAAAAAAAABnJhaXNlZAAAAAAACwAAAAAAAAAFdG9rZW4AAAAAAAAT",
        "AAAAAAAAAGpNZW1idWF0IGNhbXBhaWduIGJhcnUuClNpYXBhcHVuIGJpc2EgbWVtYW5nZ2lsIGluaS4KTWVuZ2VtYmFsaWthbiBJRCAodTY0KSBkYXJpIGNhbXBhaWduIHlhbmcgYmFydSBkaWJ1YXQuAAAAAAAPY3JlYXRlX2NhbXBhaWduAAAAAAQAAAAAAAAABW93bmVyAAAAAAAAEwAAAAAAAAAEZ29hbAAAAAsAAAAAAAAACGRlYWRsaW5lAAAABgAAAAAAAAAFdG9rZW4AAAAAAAATAAAAAQAAAAY=",
        "AAAAAAAAADZEb25hc2kga2UgY2FtcGFpZ24gdGVydGVudHUgbWVuZ2d1bmFrYW4gdG9rZW4gdHJhbnNmZXIAAAAAAAZkb25hdGUAAAAAAAMAAAAAAAAAC2NhbXBhaWduX2lkAAAAAAYAAAAAAAAABWRvbm9yAAAAAAAAEwAAAAAAAAAGYW1vdW50AAAAAAALAAAAAA==",
        "AAAAAAAAAEhSZWZ1bmQgbWVjaGFuaXNtIGppa2EgY2FtcGFpZ24gZ2FnYWwgKGhhbnlhIGJpc2EgZGlwYW5nZ2lsIG9sZWggZG9uYXR1cikAAAAGcmVmdW5kAAAAAAACAAAAAAAAAAtjYW1wYWlnbl9pZAAAAAAGAAAAAAAAAAVkb25vcgAAAAAAABMAAAABAAAACw==",
        "AAAAAAAAADRHZXQgZGF0YSBsZW5na2FwIGRhcmkgc2F0dSBjYW1wYWlnbiAodW50dWsgZnJvbnRlbmQpAAAADGdldF9jYW1wYWlnbgAAAAEAAAAAAAAAAmlkAAAAAAAGAAAAAQAAB9AAAAAIQ2FtcGFpZ24=",
        "AAAAAAAAACZHZXQgSUQgKHU2NCkgdW50dWsgY2FtcGFpZ24gYmVyaWt1dG55YQAAAAAAC2dldF9uZXh0X2lkAAAAAAAAAAABAAAABg==",
        "AAAAAAAAAD1HZXQgdG90YWwgYW1vdW50IHlhbmcgc3VkYWggdGVya3VtcHVsIHVudHVrIGNhbXBhaWduIHRlcnRlbnR1AAAAAAAAEGdldF90b3RhbF9yYWlzZWQAAAABAAAAAAAAAAtjYW1wYWlnbl9pZAAAAAAGAAAAAQAAAAs=",
        "AAAAAAAAAEJHZXQgYmVyYXBhIGJhbnlhayBzcGVjaWZpYyBkb25vciBzdWRhaCBkb25hdGUga2UgY2FtcGFpZ24gdGVydGVudHUAAAAAAAxnZXRfZG9uYXRpb24AAAACAAAAAAAAAAtjYW1wYWlnbl9pZAAAAAAGAAAAAAAAAAVkb25vcgAAAAAAABMAAAABAAAACw==",
        "AAAAAAAAABhHZXQgY2FtcGFpZ24gZ29hbCBhbW91bnQAAAAIZ2V0X2dvYWwAAAABAAAAAAAAAAtjYW1wYWlnbl9pZAAAAAAGAAAAAQAAAAs=",
        "AAAAAAAAAB9HZXQgY2FtcGFpZ24gZGVhZGxpbmUgdGltZXN0YW1wAAAAAAxnZXRfZGVhZGxpbmUAAAABAAAAAAAAAAtjYW1wYWlnbl9pZAAAAAAGAAAAAQAAAAY=",
        "AAAAAAAAACZDaGVjayBhcGFrYWggY2FtcGFpZ24gc3VkYWggcmVhY2ggZ29hbAAAAAAAD2lzX2dvYWxfcmVhY2hlZAAAAAABAAAAAAAAAAtjYW1wYWlnbl9pZAAAAAAGAAAAAQAAAAE=",
        "AAAAAAAAADZDaGVjayBhcGFrYWggY2FtcGFpZ24gc3VkYWggYmVyYWtoaXIgKGRlYWRsaW5lIHBhc3NlZCkAAAAAAAhpc19lbmRlZAAAAAEAAAAAAAAAC2NhbXBhaWduX2lkAAAAAAYAAAABAAAAAQ==",
        "AAAAAAAAACtDYWxjdWxhdGUgcHJvZ3Jlc3MgcGVyY2VudGFnZSBkYXJpIGNhbXBhaWduAAAAABdnZXRfcHJvZ3Jlc3NfcGVyY2VudGFnZQAAAAABAAAAAAAAAAtjYW1wYWlnbl9pZAAAAAAGAAAAAQAAAAs=" ]),
      options
    )
  }
  public readonly fromJSON = {
    create_campaign: this.txFromJSON<u64>,
        donate: this.txFromJSON<null>,
        refund: this.txFromJSON<i128>,
        get_campaign: this.txFromJSON<Campaign>,
        get_next_id: this.txFromJSON<u64>,
        get_total_raised: this.txFromJSON<i128>,
        get_donation: this.txFromJSON<i128>,
        get_goal: this.txFromJSON<i128>,
        get_deadline: this.txFromJSON<u64>,
        is_goal_reached: this.txFromJSON<boolean>,
        is_ended: this.txFromJSON<boolean>,
        get_progress_percentage: this.txFromJSON<i128>
  }
}