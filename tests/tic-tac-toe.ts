import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { expect, assert } from "chai";
import { TicTacToe } from "../target/types/tic_tac_toe";

async function play(program: Program<TicTacToe>, game, player, tile, expectedTurn, expectedGameState, expectedBoard) {
  await program.methods
    .play(tile)
    .accounts({
      player: player.publicKey,
      game: game
    })
    .signers(player instanceof (anchor.Wallet as any) ? [] : [player])
    .rpc();

  const gameState = await program.account.game.fetch(game);
  expect(gameState.turn).to.equal(expectedTurn);
  expect(gameState.state).to.eql(expectedGameState);
  expect(gameState.board)
    .to
    .eql(expectedBoard);
}

describe("tic-tac-toe", () => {
  // Configure the client to use the local cluster.
  anchor.setProvider(anchor.AnchorProvider.env());

  const program = anchor.workspace.TicTacToe as Program<TicTacToe>;
  const gameKeyPair = anchor.web3.Keypair.generate();
  const playerOne = (program.provider as anchor.AnchorProvider).wallet;
  const playerTwo = anchor.web3.Keypair.generate();
  it('set up game!', async () => {

    await program.methods.setupGame(playerTwo.publicKey)
      .accounts({ game: gameKeyPair.publicKey, playerOne: playerOne.publicKey })
      .signers([gameKeyPair])
      .rpc();

    let gameState = await program.account.game.fetch(gameKeyPair.publicKey);
    expect(gameState.turn).to.equal(1);
    expect(gameState.players)
      .to
      .eql([playerOne.publicKey, playerTwo.publicKey]);
    expect(gameState.state).to.eql({ active: {} });
    expect(gameState.board)
      .to
      .eql([[null, null, null], [null, null, null], [null, null, null]]);
  })
  it('player 1 start', async () => {
    await play(
      program,
      gameKeyPair.publicKey,
      playerOne,
      { row: 1, column: 1 },
      2,
      { active: {}, },
      [
        [null, null, null],
        [null, { x: {} }, null],
        [null, null, null]
      ]
    );
  })
  it('player 2 turn', async () => {
    await play(
      program,
      gameKeyPair.publicKey,
      playerTwo,
      { row: 1, column: 2 },
      3,
      { active: {}, },
      [
        [null, null, null],
        [null, { x: {} }, { o: {} }],
        [null, null, null]
      ]
    );
  })
  it('player 1 turn', async () => {
    await play(
      program,
      gameKeyPair.publicKey,
      playerOne,
      { row: 0, column: 0 },
      4,
      { active: {}, },
      [
        [{ x: {} }, null, null],
        [null, { x: {} }, { o: {} }],
        [null, null, null]
      ]
    );
  })
  it('player 2 turn', async () => {
    await play(
      program,
      gameKeyPair.publicKey,
      playerTwo,
      { row: 0, column: 2 },
      5,
      { active: {}, },
      [
        [{ x: {} }, null, { o: {} }],
        [null, { x: {} }, { o: {} }],
        [null, null, null]
      ]
    );
  })
  // it('player 1 turn', async () => {
  //   await play(
  //     program,
  //     gameKeyPair.publicKey,
  //     playerOne,
  //     { row: 2, column: 2 },
  //     5,
  //     { won: { winner: playerOne.publicKey }, },
  //     [
  //       [{ x: {} }, null, { o: {} }],
  //       [null, { x: {} }, { o: {} }],
  //       [null, null, { x: {} }]
  //     ]
  //   );
  // })
});