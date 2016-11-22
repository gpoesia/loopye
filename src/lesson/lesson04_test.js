assert = require("assert");

l4 = require("./lesson04");

var source_test = l4.SourceFactory(1, 3, "from_list",
                                   {item_list: ["IRON", "IRON", "GOLD"]});

assert.equal(source_test.pop(), "IRON");
assert.equal(source_test.pop(), "IRON");
assert.equal(source_test.pop(), "GOLD");
assert.equal(source_test.pop() instanceof l4.SourceEnd, true);

source_test.reset();

assert.equal(source_test.pop(), "IRON");
assert.equal(source_test.pop(), "IRON");
assert.equal(source_test.pop(), "GOLD");
assert.equal(source_test.pop() instanceof l4.SourceEnd, true);

// -- * -- * --

var deposits = [
  new l4.Deposit(0, {IRON_BAR: 1})
];

var sources = [
  l4.SourceFactory(1, 10, "random_from_set", {item_set: ["IRON"]})
];

var machines = [
  new l4.Machine(
    [new l4.Deposit(3, {IRON: 10})],
    4,
    "IRON_BAR"
  )
];

var game = new l4.Lesson04Game(10, 9, sources, machines, deposits);

// Test multiple times to make sure game.reset() works.
for (var game_iter = 0; game_iter < 2; ++game_iter) {
  game.reset();
  // Collecting from a spot where there is no source shoud result in error.
  assert.equal(game.collect() instanceof l4.Lesson04Game.Error, true);

  // Depositing in a spot where there's no deposit should result in error.
  assert.equal(game.deposit() instanceof l4.Lesson04Game.Error, true);

  // Goal (default fill every deposit) should not have been reached so far.
  assert.equal(game.reached_goal(), false);

  // Arm started in the rightmost position. Should not be able to move right.
  assert.equal(game.moveRight() instanceof l4.Lesson04Game.Error, true);

  // Moving to the leftmost position should succeed.
  for (var i = 0; i < 9; ++i)
    assert.equal(game.moveLeft(), null);

  // But no further than that.
  assert.equal(game.moveLeft() instanceof l4.Lesson04Game.Error, true);

  // Should be able to move right.
  assert.equal(game.moveRight(), null);

  // Should be able to collect once (there is an IRON source here).
  assert.equal(game.collect(), null);

  // Arm is holding something, should not be able to collect more before
  // depositing
  assert.equal(game.collect() instanceof l4.Lesson04Game.Error, true);

  // Should be able to move left without any trouble (final position: 0)
  assert.equal(game.moveLeft(), null);
  assert.equal(game.arm_pos, 0);

  // Should not be able to deposit IRON into IRON_BAR deposit.
  assert.equal(game.deposit() instanceof l4.Deposit.Error, true);

  // Move to IRON deposit of the machine
  for (var i = 0; i < 3; ++i)
    assert.equal(game.moveRight(), null);

  // Begin collect-deposit procedure, until machine deposit is full
  assert.equal(game.deposit(), null);
  for (var i = 0; i < 9; ++i) {
    for (var j = 0; j < 2; ++j)
      assert.equal(game.moveLeft(), null);
    assert.equal(game.collect(), null);
    for (var j = 0; j < 2; ++j)
      assert.equal(game.moveRight(), null);
    assert.equal(game.deposit(), null);
  }
  // Cannot deposit nothing into deposit
  assert.equal(game.deposit() instanceof l4.Deposit.Error, true);

  // Move to IRON source.
  for (var i = 0; i < 2; ++i)
    assert.equal(game.moveLeft(), null);

  // Should not be able to collect from empty source
  assert.equal(game.collect() instanceof l4.Lesson04Game.Error, true);

  // Move to IRON_BAR source of the machine
  for (var i = 0; i < 3; ++i)
    assert.equal(game.moveRight(), null);

  // IRON_BAR should be ready.
  assert.equal(game.peek(), "IRON_BAR");
  assert.equal(game.peek(), "IRON_BAR");
  assert.equal(game.collect(), null);

  // Move to IRON_BAR deposit
  for (var i = 0; i < 4; ++i)
    assert.equal(game.moveLeft(), null);
  // Should be able to deposit.
  assert.equal(game.deposit(), null);

  // Goal (default fill every deposit) should now have been reached.
  assert.equal(game.reached_goal(), true);

}
