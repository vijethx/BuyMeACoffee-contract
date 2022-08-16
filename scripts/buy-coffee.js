const hre = require("hardhat");

// returns the ETH balance of a given address
async function getBalance(address) {
  const balanceBigInt = await hre.ethers.provider.getBalance(address);
  return hre.ethers.utils.formatEther(balanceBigInt);
}

// logs the ether balances for a list of addresses
async function printBalances(addresses) {
  let idx = 0;
  for (const address of addresses) {
    console.log(`Address of ${idx} balance: `, await getBalance(address));
    idx++;
  }
}

// logs the memos stored on-chain from coffee purchases
async function printMemos(memos) {
  for (const memo of memos) {
    const timestamp = memo.timestamp;
    const tipper = memo.name;
    const tipperAddress = memo.from;
    const message = memo.message;
    console.log(
      `At ${timestamp}, ${tipper} (${tipperAddress}) said: "${message}"`
    );
  }
}

async function main() {
  const [owner, tipper, tipper2, tipper3] = await hre.ethers.getSigners();

  const BuyMeACoffeeFactory = await hre.ethers.getContractFactory(
    "BuyMeACoffee"
  );
  const BuyMeACoffee = await BuyMeACoffeeFactory.deploy();

  await BuyMeACoffee.deployed();
  console.log("BuyMeACoffee deployed to:", BuyMeACoffee.address);

  // check balances before coffee purchase
  const addresses = [owner.address, tipper.address, BuyMeACoffee.address];
  console.log("----------START----------");
  await printBalances(addresses);

  //  buy the owner a few coffees
  const tip = { value: hre.ethers.utils.parseEther("1") };
  await BuyMeACoffee.connect(tipper).buyCoffee(
    "Carolina",
    "You're the best!",
    tip
  );
  await BuyMeACoffee.connect(tipper2).buyCoffee(
    "Vitto",
    "Amazing teacher",
    tip
  );
  await BuyMeACoffee.connect(tipper3).buyCoffee(
    "Kay",
    "I love my Proof of Knowledge",
    tip
  );

  // check balances after the coffee purchase
  console.log("----------BOUGHT COFFEE----------");
  await printBalances(addresses);

  // withdraw
  await BuyMeACoffee.connect(owner).withdrawTips();

  // check balances after withdrawal
  console.log("----------WITHDRAW TIPS----------");
  await printBalances(addresses);

  // check out the memos
  console.log("----------MEMOS----------");
  const memos = await BuyMeACoffee.getMemos();
  printMemos(memos);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
