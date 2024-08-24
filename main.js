/*
First time? Check out the tutorial game:
https://sprig.hackclub.com/gallery/getting_started

@title: place
@author: Brandon
@tags: []
@addedOn: 2024-08-10
*/

const floor = 16;
const player = "p";
const spike = "b";
var velocity = -1;
var gravity = true;

async function gravityFalling() {
  await wait(500);
}

setLegend(
  [player, bitmap`
................
................
................
................
......00000.....
.....0000000....
....000000000...
....002020000...
....000000000...
....020002000...
....002220000...
.....0000000....
......00000.....
................
................
................`],
  [spike, bitmap`
................
................
........L.......
.......LLL......
......LLLL......
......LL1LL.....
.....LLLL1L.....
.....LLLL1LL....
....LLLLLL1L....
....LLLLLLLLL...
...LLLLLLLLLL...
..LLLLLLLLLLLL..
..LLLLLLLLLLLL..
.LLLLLLLLLLLLLL.
.LLLLLLLLLLLLLL.
LLLLLLLLLLLLLLLL`],
)

// Solids
setSolids([])

let level = 0
const levels = [{
  map: map`
.................
.................
.................
.................
.................
.................
.................
.................
.................
.................
.................
.................
.................
.................
.................
.................
.................`,
  playerPos: { x: 5, y: 5},
  spikePos: { x: 9, y: floor},
}]

let currentLevel = 0;

const drawLevel = (levelIndex) => {
  const level = levels[levelIndex];
  setMap(level.map);

  // Got rid of aliasing the positions into separate variables for naming simplicity

  // Add player and spike sprites
  addSprite(level.playerPos.x, level.playerPos.y, player);
  addSprite(level.spikePos.x, level.spikePos.y, spike);
};
drawLevel(currentLevel);

// Pushables (not needed rn)
setPushables({
  [player]: []
})

// Keybinds
onInput("w", () => {
  getFirst(player).y -= 1;
});

onInput("a", () => {
  getFirst(player).x -= 1;
});

onInput("s", () => {
  getFirst(player).y += 1;
});

onInput("d", () => {
  getFirst(player).x += 1;
});

// Get the player sprite
const playerPosition = getFirst(player);

// WHILE TRUE (for gravity)
while(gravity == true) {
  function wait(milliseconds) {
    return new Promise(resolve => {
      setTimeout(resolve, milliseconds);
    });
  }
  gravityFalling();
  playerPosition.x -= velocity;
}

afterInput(() => {
  // Coords
  const playerPosition = getFirst(player);
  const spikePosition = getFirst(spike); // Get the spike sprite
  if (playerPosition) {
    const playerCoords = `${playerPosition.x}, ${playerPosition.y}`; // Get the x and y coordinates of the player
    clearText(); // Clear previous text on the screen
    addText(playerCoords, { x: 8, y: 1, color: color`5`, scale: 0.8 }); // Display the player coordinates
  }

  // "Text when on top of something" concept
  if (playerPosition.x == spikePosition.x && playerPosition.y == spikePosition.y) {
    addText("you died :(", { x: 3, y: 3, scale: 0.5, color: color`0`});
  }

  // Gravity
  
})