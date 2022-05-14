import * as nearAPI from "near-api-js";
import { WalletConnection } from "near-api-js";

const { connect, keyStores } = nearAPI;

const NEAR_OPTS = {
  networkId: "mainnet",
  keyStore: new keyStores.BrowserLocalStorageKeyStore(),
  nodeUrl: "https://rpc.mainnet.near.org",
  walletUrl: "https://wallet.mainnet.near.org",
  helperUrl: "https://helper.mainnet.near.org",
};


export const getWallet = async () => {
  const near = await connect(NEAR_OPTS);
  return new WalletConnection(near, "bundlr");
}

export const isSignedIn = async () => {
  const wallet = await getWallet()
  return wallet.isSignedIn()
}

export const getAccountId = async () => {
  const wallet = await getWallet()
  return wallet.getAccountId()
}

export const signIn = async () => {
  const wallet = await getWallet()
  wallet.requestSignIn()
}

export const signOut = async () => {
  const wallet = await getWallet()
  wallet.signOut()
}