import { Buffer } from "buffer";
import { Client as ContractClient, Spec as ContractSpec, } from '@stellar/stellar-sdk/contract';
export * from '@stellar/stellar-sdk';
export * as contract from '@stellar/stellar-sdk/contract';
export * as rpc from '@stellar/stellar-sdk/rpc';
if (typeof window !== 'undefined') {
    //@ts-ignore Buffer exists
    window.Buffer = window.Buffer || Buffer;
}
export const networks = {
    testnet: {
        networkPassphrase: "Test SDF Network ; September 2015",
        contractId: "CA72AEQGZX4J4T6ODLQ34CCN7B74TOVYSP6KLLZBAOC23YPMTK6N2NRD",
    }
};
export class Client extends ContractClient {
    options;
    static async deploy(
    /** Options for initializing a Client as well as for calling a method, with extras specific to deploying. */
    options) {
        return ContractClient.deploy(null, options);
    }
    constructor(options) {
        super(new ContractSpec(["AAAAAQAAAAAAAAAAAAAACENhbXBhaWduAAAABgAAAAAAAAAIZGVhZGxpbmUAAAAGAAAAAAAAAAlkb25hdGlvbnMAAAAAAAPsAAAAEwAAAAsAAAAAAAAABGdvYWwAAAALAAAAAAAAAAVvd25lcgAAAAAAABMAAAAAAAAABnJhaXNlZAAAAAAACwAAAAAAAAAFdG9rZW4AAAAAAAAT",
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
            "AAAAAAAAACtDYWxjdWxhdGUgcHJvZ3Jlc3MgcGVyY2VudGFnZSBkYXJpIGNhbXBhaWduAAAAABdnZXRfcHJvZ3Jlc3NfcGVyY2VudGFnZQAAAAABAAAAAAAAAAtjYW1wYWlnbl9pZAAAAAAGAAAAAQAAAAs="]), options);
        this.options = options;
    }
    fromJSON = {
        create_campaign: (this.txFromJSON),
        donate: (this.txFromJSON),
        refund: (this.txFromJSON),
        get_campaign: (this.txFromJSON),
        get_next_id: (this.txFromJSON),
        get_total_raised: (this.txFromJSON),
        get_donation: (this.txFromJSON),
        get_goal: (this.txFromJSON),
        get_deadline: (this.txFromJSON),
        is_goal_reached: (this.txFromJSON),
        is_ended: (this.txFromJSON),
        get_progress_percentage: (this.txFromJSON)
    };
}
