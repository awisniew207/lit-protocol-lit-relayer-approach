## Prerequisites

- Node.js (v20.13.1)

## Installation

1. Clone the repository
    ```bash
    git clone <repository-url>
    ```

2. Install dependencies
    ```bash
    yarn install
    ```

3. Run the script
    ```bash
    node create-lit-wallet.js
    ```

* No need to have .env file
* Lit relayer key is a demo one, but works. I did test with a real one with same result.


## LOG
```bash

node create-lit-wallet.js

Starting createLitWallet process...
[Lit-JS-SDK v6.0.5] [2024-07-06T14:43:27.857Z] [DEBUG] [auth-client] Lit's relay server URL: https://manzano-relayer.getlit.dev
querying latest blockhash current value is  0xff70779fac5841e741c8ff18ab37602b5132aa3e7b5e326619d0af897746b44c
[Lit-JS-SDK v6.0.5] [2024-07-06T14:43:30.667Z] [DEBUG] [auth-client] Successfully initiated minting PKP with relayer
[Lit-JS-SDK v6.0.5] [2024-07-06T14:43:35.444Z] [DEBUG] [auth-client] Response OK {
  body: {
    status: 'Succeeded',
    pkpTokenId: '0xff17b7c74596e7249b56c470a7610a382c7de6b656a67b6f0b9be25e2549a097',
    pkpEthAddress: '0x54399DF2bB97565eA00cf85Aa39127F335Ec7b66',
    pkpPublicKey: '0x04707c2915f989b40f7758b22f076088df2b4c25f04324edf4d527a7a737b714d18582c6254b1ed019e3895c9bafe9641822b0512d1d03cb9561115f354bd03b33'
  }
}
[Lit-JS-SDK v6.0.5] [2024-07-06T14:43:35.446Z] [DEBUG] [auth-client] Successfully authed {
  status: 'Succeeded',
  pkpTokenId: '0xff17b7c74596e7249b56c470a7610a382c7de6b656a67b6f0b9be25e2549a097',
  pkpEthAddress: '0x54399DF2bB97565eA00cf85Aa39127F335Ec7b66',
  pkpPublicKey: '0x04707c2915f989b40f7758b22f076088df2b4c25f04324edf4d527a7a737b714d18582c6254b1ed019e3895c9bafe9641822b0512d1d03cb9561115f354bd03b33'
}
Storage key "lit-session-key" is missing. Not a problem. Contiune...
Storage key "lit-wallet-sig" is missing. Not a problem. Continue...
Error creating Lit Wallet: errConstructorFunc {
  message: 'Wallet Signature not in JSON format',
  errorCode: 'NodeWalletSignatureJSONError',
  errorKind: 'Parser',
  status: 502,
  details: [
    'parser error: Unable to parse string into a JsonAuthSig: invalid type: map, expected a string at line 1 column 7'
  ],
  requestId: '8e1fdb9a16108'
}

```
