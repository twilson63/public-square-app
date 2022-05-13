import { WebBundlr } from "@bundlr-network/client/build/web";
import { getWallet } from './near'

const getBundlr = async () => {
  const wallet = await getWallet()
  const bundlr = new WebBundlr(
    "https://node1.bundlr.network",
    "near",
    wallet
  );
  await bundlr.ready();
  return bundlr
}

export const createTx = async (text, tags) => {
  const bundlr = await getBundlr()
  return await bundlr.createTransaction(text, { tags })
}

export const fundBundlr = async (size) => {
  const bundlr = await getBundlr()
  // calculate amount based on size * 10%
  const total = Math.round(Number(size) * 1.10)

  const amount = (await bundlr.getPrice(total)).toString()
  await bundlr.fund(amount);
  await delay(1000) // wait for funding to occur
  // check balance
  const balance = (await bundlr.getLoadedBalance()).toString();
  if (Number(balance) >= Number(amount)) {
    return true
  }
  return false
}


function delay(t) {
  return new Promise(function (resolve) {
    setTimeout(function () {
      resolve();
    }, t);
  });
}