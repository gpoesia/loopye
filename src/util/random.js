//Returns a random integer in [min, max]
function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1) + min);
}

//Randomly shuffles the sequence
function randomShuffle(sequence) {
  for (var i  = 0; i < sequence.length; ++i) {
    var j = randomInt(i, sequence.length - 1);
    var aux = sequence[j];
    sequence[j] = i;
    sequence[i] = aux;
  }
}
