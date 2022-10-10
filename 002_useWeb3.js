let web3auth = null;
let web3authProvider = null;
let userInfo = null;
let accounts = null;
let balance = null;
let wethBalance = null;
let ethersProvider = null;
const web3authClientId =
  "BFTfdpQVevyJqFTUX2XrYvRgWcRiGRWhFcmp4iKyWQxyeYBPLK12YOz9S6Zz0G7Klq9TqNl9UmqVL5FRVOdRvfc";
const nftContractAddress = "0xDEc7862A07a2c359C4Cd4B9897F290ad0e55201e";
const wethContractAddress = "0x882D74C02cAD0C01621E0e18388975eC4a84C44a";
const chainId = 5;
const rpcTarget =
  "https://goerli.infura.io/v3/d0a6d8af26d343eb97eb771517e5016a";

const errorHandler = (error) => {
  console.trace(error);
};

const getProvider = (provider) => {
  return new ethers.providers.Web3Provider(provider);
};

const createContractInstance = (addr, abi, providerOrSigner) => {
  return new ethers.Contract(addr, abi, providerOrSigner);
};

$("#buy").click(async (event) => {
  try {
    const buyAmount = parseInt($("#buy-amount").val());
    const signer = ethersProvider.getSigner();
    const amountToPay = ethers.utils.parseUnits((buyAmount * 1.5, 18 + ""));
    const addr = await signer.getAddress();
    const nftContract = createContractInstance(
      nftContractAddress,
      NFT_ABI,
      signer
    );

    const wethContract = createContractInstance(
      wethContractAddress,
      WETH_ABI,
      signer
    );

    console.log(amountToPay);

    // approve spend erc20
    const tx1 = await wethContract.approve(
      nftContractAddress,
      "0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff"
    );
    console.log(tx1);
    await tx1.wait();

    const tx2 = await nftContract.mintBatch(addr, 5, amountToPay);
    console.log(tx2);
    await tx2.wait();
    console.log({
      tx1,
      tx2,
    });
  } catch (error) {
    errorHandler(error);
  }
});

$("#login").click(async (event) => {
  try {
    web3auth = new window.Web3auth.Web3Auth({
      clientId: web3authClientId,
      chainConfig: {
        chainNamespace: "eip155",
        chainId: ethers.utils.hexValue(chainId),
        rpcTarget,
      },
    });

    await web3auth.initModal();
    web3authProvider = await web3auth.connect();
    userInfo = await web3auth.getUserInfo();
    ethersProvider = new ethers.providers.Web3Provider(web3authProvider, {
      chainId,
    });
    accounts = await ethersProvider.listAccounts();
    balance = (await ethersProvider.getBalance(accounts[0])).toString();

    const nftContract = createContractInstance(
      nftContractAddress,
      NFT_ABI,
      ethersProvider
    );

    const wethContract = createContractInstance(
      wethContractAddress,
      WETH_ABI,
      ethersProvider
    );

    wethBalance = ethers.utils.formatUnits(
      await wethContract.balanceOf(accounts[0]),
      18
    );

    console.log({
      web3auth,
      web3authProvider,
      userInfo,
      ethersProvider,
      accounts,
      balance,
      wethBalance,
      nftContract,
      wethContract,
      wethBalance,
    });
  } catch (error) {
    errorHandler(error);
  }
});

$("#logout").click(async function (event) {
  try {
    await web3auth.logout();
    user = null;
    provider = null;
  } catch (error) {
    errorHandler(error);
  }
});
