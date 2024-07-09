const ethers = require('ethers');
const {
    LitAuthClient,
    EthWalletProvider,
} = require('@lit-protocol/lit-auth-client');
const { LitNodeClient } = require('@lit-protocol/lit-node-client');
const { AuthMethodScope, ProviderType } = require('@lit-protocol/constants');
const {
    LitAbility,
    LitPKPResource,
    LitActionResource,
    createSiweMessageWithRecaps,
    generateAuthSig,
} = require('@lit-protocol/auth-helpers');

const LIT_NETWORK = process.env.NEXT_PUBLIC_LIT_NETWORK || 'datil-dev';
const RELAYER_LIT_API =
    process.env.NEXT_PUBLIC_RELAYER_LIT_API ||
    'y5bd3lpp-v3oy-8xrm-21sp-not-a-valid-one-but-works';
const DOMAIN = process.env.NEXT_PUBLIC_DOMAIN || 'localhost';
const ORIGIN = process.env.NEXT_PUBLIC_ORIGIN || 'http://localhost:3000';

async function createLitWallet() {
    console.log('Starting createLitWallet process...');

    const authUserKeys = createAuthUserKeys();
    const ethersSigner = createEthersSigner(authUserKeys.privateKey);
    const { litNodeClient, litAuthClient } = await initializeLitClients();
    const provider = initializeProvider(litAuthClient);
    const authMethod = await authenticateProvider(
        provider,
        ethersSigner,
        litNodeClient,
    );
    console.log("AuthMethod:", authMethod);
    const newPKP = await mintPKP(provider, authMethod);
    const pkpSessionSigs = await createPKPSessionSigs(
        litNodeClient,
        newPKP,
        authMethod,
    );
    console.log("SessionSigs:", pkpSessionSigs);
    await litNodeClient.disconnect();
    return newPKP;
}

function createAuthUserKeys() {
    const randomWallet = ethers.Wallet.createRandom();
    return {
        address: randomWallet.address,
        privateKey: randomWallet.privateKey,
    };
}

function createEthersSigner(privateKey) {
    return new ethers.Wallet(
        privateKey,
        new ethers.providers.JsonRpcProvider(
            'https://chain-rpc.litprotocol.com/http',
        ),
    );
}

async function initializeLitClients() {
    const litNodeClient = new LitNodeClient({
        alertWhenUnauthorized: false,
        litNetwork: LIT_NETWORK,
        debug: false,
    });
    await litNodeClient.connect();

    const litAuthClient = new LitAuthClient({
        litRelayConfig: {
            relayApiKey: RELAYER_LIT_API,
            debug: false,
        },
        litNodeClient,
    });

    return { litNodeClient, litAuthClient };
}

function initializeProvider(litAuthClient) {
    if (!DOMAIN || !ORIGIN) {
        throw new Error(
            'DOMAIN and ORIGIN must be set in environment variables',
        );
    }
    return litAuthClient.initProvider(ProviderType.EthWallet, {
        domain: DOMAIN,
        origin: ORIGIN,
    });
}
async function authenticateProvider(provider, ethersSigner, litNodeClient) {
    const signMessage = async () => { // needs {expiration, uri}
        const toSign = await createSiweMessageWithRecaps({
            walletAddress: ethersSigner.address,
            nonce: await litNodeClient.getLatestBlockhash(),
            resources: [
                {
                    resource: new LitPKPResource('*'),
                    ability: LitAbility.PKPSigning,
                },
                {
                    resource: new LitActionResource('*'),
                    ability: LitAbility.LitActionExecution,
                },
            ],
            litNodeClient,
            domain: DOMAIN,
        });
        const authSig = await generateAuthSig({ signer: ethersSigner, toSign });
        return authSig;
    };

    ethersSigner.signMessage = await signMessage();

    const authMethod = {
        authMethodType: 1, 
        accessToken: JSON.stringify(ethersSigner.signMessage),
    };

    return authMethod;
}

async function mintPKP(provider, authMethod) {
    const options = {
        permittedAuthMethodScopes: [[AuthMethodScope.SignAnything]],
    };
    const mintTx = await provider.mintPKPThroughRelayer(authMethod, options);
    const response = await provider.relay.pollRequestUntilTerminalState(mintTx);

    if (response.status !== 'Succeeded') {
        throw new Error('Minting failed');
    }

    return {
        tokenId: response.pkpTokenId,
        publicKey: response.pkpPublicKey,
        ethAddress: response.pkpEthAddress,
    };
}

async function createPKPSessionSigs(litNodeClient, newPKP, authMethod) {
    const expirationTime = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes
    return litNodeClient.getPkpSessionSigs({
        pkpPublicKey: newPKP.publicKey,
        authMethods: [authMethod],
        resourceAbilityRequests: [
            {
                resource: new LitPKPResource('*'),
                ability: LitAbility.PKPSigning,
            },
            {
                resource: new LitActionResource('*'),
                ability: LitAbility.LitActionExecution,
            },
        ],
        expiration: expirationTime.toISOString(),
    });
}

createLitWallet()
    .then((newPKP) => {
        console.log('Lit Wallet created successfully!');
        console.log('New PKP:', newPKP);
    })
    .catch((error) => {
        console.error('Error creating Lit Wallet:', error);
    });
