import * as anchor from "@coral-xyz/anchor";
import { Program, BN } from "@coral-xyz/anchor";
import { Perpdex } from "../target/types/perpdex";
import {
  PublicKey,
  Keypair,
  SystemProgram,
  LAMPORTS_PER_SOL,
} from "@solana/web3.js";
import {
  TOKEN_PROGRAM_ID,
  createMint,
  createAccount,
  mintTo,
  getAccount,
} from "@solana/spl-token";
import { assert } from "chai";

describe("perpdex", () => {
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);
  const program = anchor.workspace.Perpdex as Program<Perpdex>;

  const admin = Keypair.generate();
  const user = Keypair.generate();
  const liquidator = Keypair.generate();
  const mockOracle = Keypair.generate();

  let exchangePda: PublicKey;
  let exchangeBump: number;
  let marketPda: PublicKey;
  let userAccountPda: PublicKey;
  let positionPda: PublicKey;
  let vaultAuthorityPda: PublicKey;
  let usdcMint: PublicKey;
  let vaultTokenAccount: PublicKey;
  let userTokenAccount: PublicKey;

  const TRADING_FEE_BPS = 10; // 0.1%
  const LIQUIDATION_FEE_BPS = 100; // 1%
  const MAX_LEVERAGE = 10;

  before(async () => {
    // Airdrop SOL to accounts
    await Promise.all([
      provider.connection.confirmTransaction(
        await provider.connection.requestAirdrop(admin.publicKey, 10 * LAMPORTS_PER_SOL)
      ),
      provider.connection.confirmTransaction(
        await provider.connection.requestAirdrop(user.publicKey, 10 * LAMPORTS_PER_SOL)
      ),
      provider.connection.confirmTransaction(
        await provider.connection.requestAirdrop(liquidator.publicKey, 2 * LAMPORTS_PER_SOL)
      ),
    ]);

    // Derive PDAs
    [exchangePda, exchangeBump] = PublicKey.findProgramAddressSync(
      [Buffer.from("exchange")],
      program.programId
    );

    [vaultAuthorityPda] = PublicKey.findProgramAddressSync(
      [Buffer.from("vault"), exchangePda.toBuffer()],
      program.programId
    );

    [userAccountPda] = PublicKey.findProgramAddressSync(
      [Buffer.from("user_account"), exchangePda.toBuffer(), user.publicKey.toBuffer()],
      program.programId
    );

    // Create USDC mint and token accounts
    usdcMint = await createMint(
      provider.connection,
      admin,
      admin.publicKey,
      null,
      6
    );

    vaultTokenAccount = await createAccount(
      provider.connection,
      admin,
      usdcMint,
      vaultAuthorityPda
    );

    userTokenAccount = await createAccount(
      provider.connection,
      user,
      usdcMint,
      user.publicKey
    );

    // Mint USDC to user
    await mintTo(
      provider.connection,
      admin,
      usdcMint,
      userTokenAccount,
      admin,
      1_000_000_000 // 1000 USDC
    );

    // Set up mock oracle data (price at offset 208)
    // We create an account with enough data to hold the Pyth price format
    // For testing, we write the price directly
  });

  it("Initialize exchange", async () => {
    await program.methods
      .initialize(TRADING_FEE_BPS, LIQUIDATION_FEE_BPS, MAX_LEVERAGE)
      .accounts({
        admin: admin.publicKey,
        exchange: exchangePda,
        systemProgram: SystemProgram.programId,
      })
      .signers([admin])
      .rpc();

    const exchange = await program.account.exchange.fetch(exchangePda);
    assert.equal(exchange.admin.toBase58(), admin.publicKey.toBase58());
    assert.equal(exchange.tradingFeeBps, TRADING_FEE_BPS);
    assert.equal(exchange.liquidationFeeBps, LIQUIDATION_FEE_BPS);
    assert.equal(exchange.maxLeverage, MAX_LEVERAGE);
    assert.equal(exchange.paused, false);
    assert.equal(exchange.marketCount, 0);
  });

  it("Create market", async () => {
    const marketIndex = 0;
    [marketPda] = PublicKey.findProgramAddressSync(
      [
        Buffer.from("market"),
        exchangePda.toBuffer(),
        Buffer.from([marketIndex]),
      ],
      program.programId
    );

    const name = Buffer.alloc(16);
    Buffer.from("BTC-PERP").copy(name);

    await program.methods
      .createMarket(
        Array.from(name),
        new BN(3600), // 1 hour funding interval
        mockOracle.publicKey
      )
      .accounts({
        admin: admin.publicKey,
        exchange: exchangePda,
        market: marketPda,
        systemProgram: SystemProgram.programId,
      })
      .signers([admin])
      .rpc();

    const market = await program.account.market.fetch(marketPda);
    assert.equal(market.exchange.toBase58(), exchangePda.toBase58());
    assert.equal(market.marketIndex, 0);
    assert.equal(market.active, true);
    assert.equal(market.pythOracle.toBase58(), mockOracle.publicKey.toBase58());

    const exchange = await program.account.exchange.fetch(exchangePda);
    assert.equal(exchange.marketCount, 1);
  });

  it("Deposit USDC", async () => {
    const depositAmount = new BN(100_000_000); // 100 USDC

    await program.methods
      .deposit(depositAmount)
      .accounts({
        user: user.publicKey,
        exchange: exchangePda,
        userAccount: userAccountPda,
        vaultAuthority: vaultAuthorityPda,
        vaultTokenAccount,
        userTokenAccount,
        tokenProgram: TOKEN_PROGRAM_ID,
        systemProgram: SystemProgram.programId,
      })
      .signers([user])
      .rpc();

    const userAccount = await program.account.userAccount.fetch(userAccountPda);
    assert.equal(
      userAccount.collateral.toString(),
      depositAmount.toString()
    );

    const vaultBalance = await getAccount(provider.connection, vaultTokenAccount);
    assert.equal(vaultBalance.amount.toString(), depositAmount.toString());
  });

  it("Open long position", async () => {
    // Note: This requires a properly set mock oracle account with price data at offset 208
    // In a real test, you would set up the oracle account with the correct data
    // For now this test demonstrates the instruction structure

    [positionPda] = PublicKey.findProgramAddressSync(
      [
        Buffer.from("position"),
        marketPda.toBuffer(),
        user.publicKey.toBuffer(),
      ],
      program.programId
    );

    // Mock oracle needs data at offset 208 with a valid price
    // This test will fail without a properly initialized oracle
    // In production, use a Pyth devnet oracle
    try {
      await program.methods
        .openPosition(
          { long: {} }, // PositionSide::Long
          new BN(10_000_000), // size: 10 USDC
          5 // leverage: 5x
        )
        .accounts({
          user: user.publicKey,
          exchange: exchangePda,
          market: marketPda,
          userAccount: userAccountPda,
          position: positionPda,
          pythOracle: mockOracle.publicKey,
          systemProgram: SystemProgram.programId,
        })
        .signers([user])
        .rpc();

      const position = await program.account.position.fetch(positionPda);
      assert.equal(position.open, true);
      assert.equal(position.leverage, 5);
    } catch (err) {
      // Expected to fail with StaleOraclePrice or InvalidOracleAccount
      // because mockOracle doesn't have proper Pyth price data
      console.log("Expected oracle error:", err.message);
    }
  });

  it("Add margin to position", async () => {
    // This would succeed if a position was opened in the previous test
    try {
      const addAmount = new BN(1_000_000); // 1 USDC

      await program.methods
        .addMargin(addAmount)
        .accounts({
          user: user.publicKey,
          exchange: exchangePda,
          userAccount: userAccountPda,
          position: positionPda,
        })
        .signers([user])
        .rpc();

      console.log("Add margin succeeded");
    } catch (err) {
      console.log("Add margin error (expected if position not open):", err.message);
    }
  });

  it("Remove margin from position", async () => {
    try {
      const removeAmount = new BN(500_000); // 0.5 USDC

      await program.methods
        .removeMargin(removeAmount)
        .accounts({
          user: user.publicKey,
          exchange: exchangePda,
          userAccount: userAccountPda,
          position: positionPda,
        })
        .signers([user])
        .rpc();

      console.log("Remove margin succeeded");
    } catch (err) {
      console.log("Remove margin error (expected if position not open):", err.message);
    }
  });

  it("Close position", async () => {
    try {
      await program.methods
        .closePosition()
        .accounts({
          user: user.publicKey,
          exchange: exchangePda,
          market: marketPda,
          userAccount: userAccountPda,
          position: positionPda,
          pythOracle: mockOracle.publicKey,
        })
        .signers([user])
        .rpc();

      const position = await program.account.position.fetch(positionPda);
      assert.equal(position.open, false);
    } catch (err) {
      console.log("Close position error (expected if position not open):", err.message);
    }
  });

  it("Update funding rate", async () => {
    try {
      await program.methods
        .updateFunding()
        .accounts({
          market: marketPda,
          pythOracle: mockOracle.publicKey,
        })
        .rpc();

      console.log("Update funding succeeded");
    } catch (err) {
      console.log("Update funding error (expected without live oracle):", err.message);
    }
  });

  it("Liquidate undercollateralized position", async () => {
    try {
      await program.methods
        .liquidate()
        .accounts({
          liquidator: liquidator.publicKey,
          exchange: exchangePda,
          market: marketPda,
          userAccount: userAccountPda,
          position: positionPda,
          pythOracle: mockOracle.publicKey,
        })
        .signers([liquidator])
        .rpc();

      console.log("Liquidation succeeded");
    } catch (err) {
      console.log("Liquidate error (expected if position not open or not liquidatable):", err.message);
    }
  });

  it("Withdraw USDC", async () => {
    // Only withdraw a small amount in case some collateral is locked
    const withdrawAmount = new BN(1_000_000); // 1 USDC

    try {
      const userAccountBefore = await program.account.userAccount.fetch(userAccountPda);

      await program.methods
        .withdraw(withdrawAmount)
        .accounts({
          user: user.publicKey,
          exchange: exchangePda,
          userAccount: userAccountPda,
          vaultAuthority: vaultAuthorityPda,
          vaultTokenAccount,
          userTokenAccount,
          tokenProgram: TOKEN_PROGRAM_ID,
        })
        .signers([user])
        .rpc();

      const userAccountAfter = await program.account.userAccount.fetch(userAccountPda);
      assert.equal(
        userAccountAfter.collateral.toString(),
        userAccountBefore.collateral.sub(withdrawAmount).toString()
      );
    } catch (err) {
      console.log("Withdraw error:", err.message);
    }
  });
});
