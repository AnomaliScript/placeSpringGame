/*
First time? Check out the tutorial game:
https://sprig.hackclub.com/gallery/getting_started

@title: place
@author: Brandon (AnomalScript)
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

// Physics Variables
let velocity = 0;
var airborne = false;
var left = false;
var right = false;
const JUMPHEIGHT = 1.0;
const GRAVITY = 0.25;

/*
jump platform bug (jpb) bugfix, I need to make this a function in order to not have the player be able
to jump "onto blocks" and to also make sure the player was not able to bypass 
the original bugfix (which was originally only in setInterval(), now it's in both in that and the input functions)
*/
function jpb() {
  // Prevent the player from "jumping onto" blocks
  // No need to "scan" tiles compared to falling because velocity's max isn't lower than -1
  const oneAbove = getTile(getFirst(player).x, getFirst(player).y - 1);
  for (const sprite of oneAbove) {
    if (sprite.type === block || sprite.type === glass) {
      velocity = 1;
      break;
    }
  }
}

// Gravity
setInterval(() => {
  if (game.isRunning()) {
    
    // troubleshooting addText stuff
    clearText();
    addText(`${getFirst(player).x}, ${getFirst(player).y}`, { x: 3, y: 1, color: color`5`}); // Display the player coordinates
    addText(`${velocity}`, { x: 3, y: 3, color: color`D` });
    
    // Falling
    velocity += GRAVITY;

    const playerPosition = getFirst(player); // Get the player sprite (for reference)
    const targetY = getFirst(player).y + Math.floor(velocity);
    const targetTile = getTile(playerPosition.x, playerPosition.targetY); // Get the tile "below" the player
    
    // Start of the "falling clipping player" bug fix //
    const skippedTilesBelow = [];
    for (let i = 1; i <= Math.abs(Math.floor(velocity)); i++) {
      const scanY = playerPosition.y + Math.sign(velocity) * i; // Adjust based on velocity direction
      skippedTilesBelow.push(getTile(playerPosition.x, scanY));
    }
    
    // Identify the platform position for the player to land on
    let platformY = null;
    for (const tile of skippedTilesBelow) {
        for (const sprite of tile) {
            if (sprite.type === block || sprite.type === glass) {
                platformY = sprite.y;
                break;
            }
        }
        if (platformY !== null) {
            break; // Exit the loop if platform position is found
        }
    }
    
    if (platformY !== null) { 
      getFirst(player).y = platformY - 1; // Adjust as needed for player size
      velocity = 0;
    } else {
      /* 
      Mininum function to make sure the velocity doesn't freeze the player middair because the (playerY + velocity)
      is greater than the floor i.e. 16
      */
      getFirst(player).y = Math.min(targetY, floor);
    }
    
    // End of the "falling clipping player" bug fix //

    jpb();
    // ACCIDENTALLY DISCOVERED HOW TO DO STICKY SURFACES (like Spider-Man)
    /*
    const oneAbove = getTile(getFirst(player).x, getFirst(player).y - 1);
    for (const sprite of oneAbove) {
      if (sprite.type === sticky) {
        velocity = 0;
        break;
      }
    }
    */
    
    let isSolidUnderPlayer = false;
    const oneBelow = getTile(getFirst(player).x, getFirst(player).y + 1);
    for (const sprite of oneBelow) {
      if (sprite.type === block || sprite.type === glass) {
        isSolidUnderPlayer = true;
        break;
      }
    }
    //addText(`${isSolidUnderPlayer}`, { x: 8, y: 6, color: color`L` });
    if (isSolidUnderPlayer || (getFirst(player).y == floor)) {
      velocity = 0; // Set velocity to zero to prevent clipping
      airborne = false; // Player can jump on platforms
    } else {
      airborne = true;
    }
    addText(`airborne: ${airborne}`, { x: 3, y: 5, color: color`5` });
  }
}, /* frame updates after */ 60 /* milliseconds */);

// Upside-down B)
const gravitySwitch = "w";
var reverseGravity = false;
const UDplayer = "u";

/*✧･ﾟ: *✧･ﾟ:* Textures! ✧･ﾟ: *✧･ﾟ:*/
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
  [UDplayer, bitmap`
................
................
................
.....555555.....
....55555555....
...5555LLL555...
...555L555L55...
...5555555555...
...5555555555...
...5555L5L555...
...5555555555...
....55555555....
.....555555.....
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
  [gravitySwitch, bitmap`
................
....4...........
.....444........
......444.......
...444.4..444...
..4...4.....44..
..4..4.......4..
..4..........4..
..4.......4..4..
..44.....44..4..
...44....4.44...
....444..44.....
......4...4444..
................
................
................`],
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

// Pushables (not needed rn)
setPushables({
  [player]: [crate]
})

// Maps/levels
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
..bb.............
.................
bb...bb..........
.................
........gg.......
.................
bb.........gg....
.................
bb............bb.
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

// Game Loop
let game = {
  running: true,
  isRunning() { return this.running },
  end() {
    this.running = false;
    addText("The end!");
  }
}

// Keybinds
onInput("w", () => {
  if (!airborne) {
    velocity = -JUMPHEIGHT;
    airborne = true;
  }
  jpb();
});

onInput("a", () => {
  getFirst(player).x -= 1;
  jpb();
});

onInput("d", () => {
  getFirst(player).x += 1;
  jpb();
});

// AFTERINPUT
afterInput(() => {
  
  // Coords
  let playerPosition = getFirst(player); // Get the spike sprite
  let spikePosition = getAll(spike); // Get the spike sprite
  if (playerPosition) {
    const playerCoords = `${playerPosition.x}, ${playerPosition.y}`; // Get the x and y coordinates of the player
    clearText(); // Clear previous text on the screen
    // All text goes here
    /* addText(playerCoords, { x: 8, y: 1, color: color`5`, scale: 0.8 }); // Display the player coordinates
    addText(`${getTile(getFirst(player).x, getFirst(player).y + 1)}`, { x: 8, y: 3, color: color`5` });
    addText(`${velocity}`, { x: 8, y: 3, color: color`5` }); */
  }

  // Spike death check
  let spikes = getAll(spike);
  for (let i = 0; i < spikes.length; i++) {
    if (playerPosition.x == spikes[i].x && playerPosition.y == spikes[i].y) {
      // TODO: Add death cases
      addText("you died :(", { x: 3, y: 6, scale: 0.5, color: color`0`});
    }
  }
})