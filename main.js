/*
First time? Check out the tutorial game:
https://sprig.hackclub.com/gallery/getting_started

@title: place
@author: Brandon
@tags: []
@addedOn: 2024-08-10
*/

// Static stuff
const floor = 16;
const player = "p";
const spike = "s";
const block = "b";
const glass = "g";
const glassBroken = "r";
const crate = "c";
const door = "d";

// Physics
var airborne = true;
var jumpRefresh = 0;
const jumpHeight = 3;

// Upside-down B)
const gravitySwitch = "w";
var reverseGravity = false;
const UDplayer = "u";

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
  [],
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
  [block, bitmap`
0000000000000000
0000000010000000
0000000001001000
0000000000100100
0000000000010010
0000000000001000
0000000000000100
0000000000000000
0000000000000000
0000000000000000
0000000000000000
0000000000000000
0000000000000000
0000000000000000
0000000000000000
0000000000000000`],
  [glass, bitmap`
7777777777777777
7222222222222227
7222222222722227
7222222222272227
7222222222227227
7222222222222727
7222222222222227
7222222222222227
7222222222222227
7222222222222227
7222222222222227
7222222222222227
7222222222222227
7222222222222227
7222222222222227
7777777777777777`],
  [glassBroken, bitmap`
7777777...77777.
7......77..77.7.
7........7..7.77
7........7..77.7
7........77..7.7
77....777.7..7.7
77....7..77..7.7
777..7......7..7
..777..77...7..7
......7.7..7...7
...777..7.77..7.
.777....7.7...77
77......7.77...7
.77.....7..777.7
..7......7....77
..777777777.....`],
  [crate, bitmap`
1111111111111111
1CC1C1CCC1C1CCC1
1CCC11CCC1C1CCC1
11CCC1CCC1C1CCC1
1C1CCC1CC1C1CCC1
1CC1CCC1C1C1CCC1
1CCC1CCC11C1CCC1
1CCC11CCC1C1CCC1
1CCC1C1CCC11CCC1
1CCC1C11CCC1CCC1
1CCC1C1C1CCC1CC1
1CCC1C1CC1CCC1C1
1CCC1C1CCC1CCC11
1CCC1C1CCC11CCC1
1CCC1C1CCC1C1CC1
1111111111111111`],
  [gravitySwitch, ],
  [door, bitmap`
................
................
..........CCC...
.....CCCCCCCC...
..CCCCCCCCCCC...
..CCCCCCCCCCC...
..CCCCCCCCCCCC..
..CCCCCCCCCCCC..
...CCCCCCCCCCC..
...CCCCCCC66CC..
...CCCCCCC66CC..
...CCCCCCCCCCC..
...CCCCCCCCCCC..
...CCCCCCCCCCCC.
....CCCCCCCCCCC.
....CCCCCCCCCCC.
....CCCCCCCCCCC.`]
)

// Solids
setSolids([player, block, glass])

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
.........ss......`,
  playerPos: { x: 5, y: floor},
}]

let currentLevel = 0;

const drawLevel = (levelIndex) => {
  const level = levels[levelIndex];
  setMap(level.map);

  // Add player and spike sprites
  addSprite(level.playerPos.x, level.playerPos.y, player);
};
drawLevel(currentLevel);

// Pushables (not needed rn)
setPushables({
  [player]: []
})

// Keybinds
onInput("w", () => {
  if (!airborne) {
    getFirst(player).y -= jumpHeight
    airborne = true;
    if (jumpRefresh == 0) {
      jumpRefresh = jumpHeight;
    }
  }
});

onInput("a", () => {
  getFirst(player).x -= 1;
});

onInput("d", () => {
  getFirst(player).x += 1;
});

// AFTERINPUT RAHHHH
afterInput(() => {
  // Gravity (will happen every time when a new button is pressed because that's the only way time can go forward)
  if (airborne && jumpRefresh != 0) {
    getFirst(player).y += 1;
    jumpRefresh -= 1;
  }
  if (jumpRefresh == 0) {
    airborne = false;
  }
  
  // Coords
  let playerPosition = getFirst(player); // Get the spike sprite
  let spikePosition = getAll(spike); // Get the spike sprite
  if (playerPosition) {
    const playerCoords = `${playerPosition.x}, ${playerPosition.y}`; // Get the x and y coordinates of the player
    clearText(); // Clear previous text on the screen
    addText(playerCoords, { x: 8, y: 1, color: color`5`, scale: 0.8 }); // Display the player coordinates
  }

  // Spike death check
  let spikes = getAll(spike);

  for (let i = 0; i < spikes.length; i++) {
    if (playerPosition.x == spikes[i].x && playerPosition.y == spikes[i].y) {
      addText("you died :(", { x: 3, y: 3, scale: 0.5, color: color`0`});
    }
  }
})