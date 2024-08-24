/*
@title: place
@author: Brandon (AnomaliScript)
@tags: []
@addedOn: 2024-08-10
*/


// Tile Sprites
const player = "p";
const spike = "s";
const red = "e";
const block = "b";
const glass = "g";
const glassBroken = "r";
const crate = "c";
const door = "d";

// Physics Variables
let floor = 10;
let velocity = 0;
let airborne = false;
let left = false;
let right = false;
const JUMPHEIGHT = 1.0;
const GRAVITY = 0.25;
let frameRate = 60;

// Upside-Down Physics
const gravitySwitch = "w";
let reverseGravity = false;

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
....CCCCCCCCCCC.`],
)

// Solids
setSolids([player, block, glass])

// Pushables (not needed rn)
setPushables({
  [player]: [crate]
})

/*
jump platform bug (jpb) bugfix, I need to make this a function in order to not have the player be able
to jump "onto blocks" and to also make sure the player was not able to bypass 
the original bugfix (which was originally only in setInterval(), now it's in both in that and the input functions)
*/
let flag = false;
function jpb() {
  // Prevent the player from "jumping onto" blocks
  // No need to "scan" tiles compared to falling because velocity's max isn't lower than -1
  if (!reverseGravity) {
    const oneAbove = getTile(getFirst(player).x, getFirst(player).y - 1);
    for (const sprite of oneAbove) {
      if (sprite.type === block || sprite.type === glass) {
        if (velocity == 0) {
          // Just passing in
          velocity = 0.25;
          break;
        } else {
          // Hit the block with force
          velocity = 1;
          flag = true;
        }
      }
    }
  } else {
    const oneBelow = getTile(getFirst(player).x, getFirst(player).y + 1);
    for (const sprite of oneBelow) {
      if (sprite.type === block || sprite.type === glass) {
        if (velocity == 0) {
          velocity = -0.25;
          break;
        } else {
          velocity = -1;
          flag = true;
          break;
        }
      }
    }
  }
}

// Game Loop
let game = {
  running: true,
  isRunning() { return this.running },
  end() {
    this.running = false;
    addText("The end!");
  }
}

// Gravity
setInterval(() => {
  if (game.isRunning()) {
    floor = height() - 1;
    // troubleshooting addText stuff
    clearText();
    addText(`${getFirst(player).x}, ${getFirst(player).y}`, { x: 3, y: 1, color: color`5`}); // Display the player coordinates
    addText(`${velocity}`, { x: 3, y: 3, color: color`D` });
    
    // Falling
    if (!reverseGravity) {
      velocity += GRAVITY;
    } else {
      velocity -= GRAVITY;
    }

    const playerPosition = getFirst(player); // Get the player sprite (for reference)
    let targetY = getFirst(player).y + Math.floor(velocity);
    if (reverseGravity) {
      targetY = getFirst(player).y + Math.ceil(velocity);
    }
    const targetTile = getTile(playerPosition.x, playerPosition.targetY); // Get the tile "below" the player
    
    // Start of the "falling clipping player" bug fix //
    const skippedTiles = [];
    if (!reverseGravity) {
      for (let i = 1; i <= Math.abs(Math.floor(velocity)); i++) {
        const scanY = playerPosition.y + Math.sign(velocity) * i; // Adjust based on velocity direction
        skippedTiles.push(getTile(playerPosition.x, scanY));
      }
    } else {
      for (let i = 1; i <= Math.abs(Math.floor(velocity)); i++) {
        const scanY = playerPosition.y - Math.sign(velocity) * i; // Adjust based on velocity direction
        skippedTiles.push(getTile(playerPosition.x, scanY));
      }
    }
    // Identify the platform position for the player to land on
    let platformY = null;
    for (const tile of skippedTiles) {
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
    if (!reverseGravity) {
      if (platformY !== null) {
        getFirst(player).y = platformY - 1; // Adjust as needed for player size
        velocity = 0;
      } else {
        getFirst(player).y = Math.min(targetY, floor);
      }
    } else {
      /* if (platformY !== null) { 
        getFirst(player).y = platformY + 1; // Adjust as needed for player size
        velocity = 0;
      } else { */
        getFirst(player).y = Math.max(targetY, 0);
      // }
    }
    // End of the "falling clipping player" bug fix //
    addText(`${targetY}`, { x: 3, y: 9, color: color`H` });
    
    
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
    let isSolidNearPlayer = false;
    if (!reverseGravity) {
      const oneBelow = getTile(getFirst(player).x, getFirst(player).y + 1);
      for (const sprite of oneBelow) {
        if (sprite.type === block || sprite.type === glass) {
          isSolidNearPlayer = true;
          break;
        }
      }
    } else {
      const oneAbove = getTile(getFirst(player).x, getFirst(player).y - 1);
      for (const sprite of oneAbove) {
        if (sprite.type === block || sprite.type === glass) {
          isSolidNearPlayer = true;
          break;
        }
      }
    }
    addText(`${isSolidNearPlayer}`, { x: 3, y: 7, color: color`L` });

    flag = false;
    jpb();
    addText(`${flag}`, { x: 3, y: 11, color: color`3` });
    
    // airborne logic
    if (isSolidNearPlayer || (!reverseGravity && getFirst(player).y == floor) || (reverseGravity && getFirst(player).y == 0)) {
      velocity = 0;
      airborne = false; // Player can jump on platforms
    } else {
      airborne = true;
    }
    addText(`airborne: ${airborne}`, { x: 3, y: 5, color: color`5` });

    // HOVER CASES
    // DEATH case :skull:
    let spikes = getAll(spike);
    for (let i = 0; i < spikes.length; i++) {
      if (playerPosition.x == spikes[i].x && playerPosition.y == spikes[i].y) {
        getFirst(player).x = levels[currentLevel].spawnPos.x;
        getFirst(player).y = levels[currentLevel].spawnPos.y;
      }
    }
  }
}, frameRate);

// Maps/levels
const levels = [
  {
    name: "start",
    left: "ruins",
    right: "place1",
    top: "reach1",
    bottom: null,
    map: map`
.................
.................
.................
.................
.................
.................
..bbb............
.................
bb...bb..........
.................
........gg.......
.................
bb.........gg....
.................
bb............bb.
.........ss......`,
    spawnPos: { x: 5, y: floor}
  },
  {
    name: "place1",
    left: "start",
    right: "theGap",
    top: "reach1a",
    bottom: null,
    map: map`
................
................
................
................
................
................
................
.......bb.......
.......gg.......
.......bb.......
................
................
................
................
................
........ssssssss`,
    spawnPos: {x: 2, y: floor}
  },
  {
    name: "ruins",
    left: null,
    right: "start",
    top: "crushedHopes",
    bottom: null,
    map: map`
......b..........
.......b.........
....b...b........
w..b...........g.
..b.......b...g..
.....d.....b.g...
b....bd.....b....
.b....b.....g....
..b....b....b.d..
...b.......b..b..
....b.....b......
.................
.....b...........
.................
......b..........
.................`,
    spawnPos: {x: 12, y: floor}
  }
]

// I'm using a levelName to levelIndex converter because I want to use level names :)
// Inital level name
let currentLevel = 0;
// This is the actual converter
function convertToIndex(name) {
  return levels.findIndex(level => level.name === name);
}

function drawLevel(direction) {
  if (direction === "none") {
    // starting level rendering
    setMap(levels[0].map);
    // First player spawn, will never happen again
    addSprite(5, floor, player);
  }
  const saveY = getFirst(player).y;
  if (direction === "left") {
    currentLevel = convertToIndex(levels[currentLevel].left);
    const level = levels[currentLevel];
    setMap(level.map);
    addSprite(width() - 1, saveY, player);
  } else if (direction === "right") {
    currentLevel = convertToIndex(levels[currentLevel].right);
    const level = levels[currentLevel];
    setMap(level.map);
    addSprite(0, saveY, player);
  }
};
drawLevel("none");

// Keybinds
onInput("w", () => {
  if (!reverseGravity) {
    if (!airborne) {
      velocity = -JUMPHEIGHT;
      airborne = true;
    }
    jpb();
  }
});

onInput("a", () => {
  if (getFirst(player).x == 0) {
    if (levels[currentLevel].left !== null) {
      drawLevel("left");
    }
  } else {
    getFirst(player).x -= 1;
  }
  jpb();
});

onInput("s", () => {
  if (reverseGravity) {
    if (!airborne) {
      velocity = JUMPHEIGHT;
      airborne = true;
    }
  }
  jpb();
});

onInput("d", () => {
  if (getFirst(player).x == 16) {
    if (levels[currentLevel].right !== null) {
      drawLevel("right");
    }
  } else {
    getFirst(player).x += 1;
  }
  jpb();
});

onInput("i", () => {
  gravitySwitching();
  //jpb();
});

// i cases (like e in roblox, "i" in this game is the "use" key)
// gravity switch
function gravitySwitching() {
  let reverses = getAll(gravitySwitch);
  let triggeredGravity = false;
  for (let i = 0; i < reverses.length; i++) {
    if (getFirst(player).x == reverses[i].x && getFirst(player).y == reverses[i].y) {
      triggeredGravity = true;
    }
  }
  if (triggeredGravity) {
    if (reverseGravity) {
      reverseGravity = false;
    } else {
      reverseGravity = true;
    }
  }
}

// doors


// AFTERINPUT
afterInput(() => {
  
  // Coords
  let playerPosition = getFirst(player); // Get the spike sprite
  let spikePosition = getAll(spike); // Get the spike sprite
  if (playerPosition) {
    const playerCoords = `${playerPosition.x}, ${playerPosition.y}`; // Get the x and y coordinates of the player
  }

  // Surveillence death check (movement = death, but not if you're falling; act "dead")
  /*
  let reds = getAll(red);
  for (let i = 0; i < reds.length; i++) {
    if (playerPosition.x == reds[i].x && playerPosition.y == reds[i].y) {
      getFirst(player).x = levels[currentLevel].spawnPos.x;
      getFirst(player).y = levels[currentLevel].spawnPos.y;
    }
  }
  */
})