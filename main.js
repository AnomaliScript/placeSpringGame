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
let platformY;
let targetY;
let readyToFall = false;
let readyToRise = false;
let justEntered = false;
let frameRate = 60;

// Upside-Down Physics
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
  [red, bitmap`
3333333333333333
3333333333333333
3333333333333333
3333333333333333
3333333333333333
3333333333333333
3333333333333333
3333333333333333
3333333333333333
3333333333333333
3333333333333333
3333333333333333
3333333333333333
3333333333333333
3333333333333333
3333333333333333`],
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
    // Normal case
    if (velocity >= 0) {
      return;
    }
    const oneAbove = getTile(getFirst(player).x, getFirst(player).y - 1);
    for (const sprite of oneAbove) {
      if (sprite.type === block || sprite.type === glass) {
        velocity = 1;
        flag = true;
        break;
      }
    }
  } else {
    // Reversed (upside-down) case
    if (velocity <= 0) {
      return;
    }
    const oneBelow = getTile(getFirst(player).x, getFirst(player).y + 1);
    for (const sprite of oneBelow) {
      if (sprite.type === block || sprite.type === glass) {
        velocity = -1;
        flag = true;
        break;
      }
    }
  }
}

// Vertical Scrolling Function
/* 
Note that "falling" and "rising" are "passive" forms of movement, 
meaning movement that happens when the player is doing nothing 
and is just letting the gravity take them places
*/
function verticalScrolling() {
  const playerPosition = getFirst(player);
  if (!reverseGravity) {
    // Normal case
    if (targetY == -1 && levels[currentLevel].top !== null) {
      // Higher scrolling
      drawLevel("top");
      justEntered = true;
      // Floor update (immediate use)
      targetY = floor;
      return;
    } else if (targetY == -1) {
      // Hitting the ceiling
      velocity = 1;
    }
    // Guard clause to exit the function for if a player has just entered another level
    if (justEntered) {
      justEntered = false;
      return;
    }
    // Lower scrolling
    if (targetY >= floor && velocity > 0 && levels[currentLevel].bottom !== null) {
      readyToFall = true;
    }
    if (levels[currentLevel].bottomPlat.includes(playerPosition.x)) {
      readyToFall = false;
      return;
    }
    if (readyToFall) {
      console.log("falling!");

      // Carrying the velocity over
      let offset;
      if (targetY >= height()) {
        offset = Math.floor(velocity) - (height() - (playerPosition.y + 1)) - 1;
      } else {
        offset = 0;
      }
      drawLevel("bottom");
      while (offset >= height()) {
        // Calculate offset
        targetY = offset;
        offset = Math.floor(velocity) - (height() - (playerPosition.y + 1)) - 1;
        // Calculate platformY (if it exists)
        calculatePlatform(getSkippedTiles());
        if (platformY !== null) {
          drawLevel("bottom");
          return;
        }
      }
      if (offset >= floor) {
        platformY = null;
      }
      targetY = 0 + offset;
      return;
    }
  } else {
    // Upside-down (reversed gravity) case
    if (targetY == height() && levels[currentLevel].bottom !== null) {
      // Lower scrolling (it's actually higher scrolling)
      drawLevel("bottom");
      justEntered = true;
      return 0;
    } else if (targetY == height()) {
      // Hitting the "ceiling"
      velocity = -1;
    }
    // Guard clause again
    if (justEntered) {
      justEntered = false;
      return;
    }
    // Higher scrolling (it's actually lower scrolling)
    if (playerPosition.y == 0 && velocity <= 0 && levels[currentLevel].top !== null) {
      readyToRise = true;
    }
    if (levels[currentLevel].topPlat.includes(playerPosition.x)) {
      readyToRise = false;
    }
    if (readyToRise) {
      console.log("rising!");
      readyToRise = false;
      drawLevel("top");
      targetY = floor;
      return;
    }
  }
  return;
}

// Tile scanning function
function getSkippedTiles() {
  const skipped = [];
  const playerPosition = getFirst(player);
  if (!reverseGravity) {
    for (let i = 1; i <= Math.abs(Math.floor(velocity)); i++) {
      const scanY = playerPosition.y + Math.sign(velocity) * i; // Adjust based on velocity direction
      skipped.push(getTile(playerPosition.x, scanY));
    }
  } else {
    for (let i = 1; i <= Math.abs(Math.ceil(velocity)); i++) {
      const scanY = playerPosition.y + Math.sign(velocity) * i; // Adjust based on velocity direction
      skipped.push(getTile(playerPosition.x, scanY));
    }
  }
  return skipped;
}

// Calculate if there is a platform to land on
function calculatePlatform(allTiles) {
  for (const tile of allTiles) {
    for (const sprite of tile) {
      if (sprite.type === block || sprite.type === glass) {
        // console.log(`${sprite.x}, ${sprite.y}`);
        platformY = sprite.y;
        // addSprite(getFirst(player).x, sprite.y, red);
        return;
      }
    }
  }
  platformY = null;
  return;
}

// Determine if there is a block on top of the the player
function determineIfIsSolidNearPlayer() {
  let localIsSolidNearPlayer = false;
  if (!reverseGravity) {
    const oneBelow = getTile(getFirst(player).x, getFirst(player).y + 1);
    for (const sprite of oneBelow) {
      if (sprite.type === block || sprite.type === glass) {
        localIsSolidNearPlayer = true;
        break;
      }
    }
  } else {
    const oneAbove = getTile(getFirst(player).x, getFirst(player).y - 1);
    for (const sprite of oneAbove) {
      if (sprite.type === block || sprite.type === glass) {
        localIsSolidNearPlayer = true;
        break;
      }
    }
  }
  return localIsSolidNearPlayer;
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
    // Floor height (length) update
    floor = height() - 1;
    // troubleshooting addText stuff
    clearText();
    addText(`${getFirst(player).x}, ${getFirst(player).y}`, { x: 3, y: 1, color: color`0` }); // Display the player coordinates
    addText(`${velocity}`, { x: 13, y: 1, color: color`D` });

    // Falling
    if (!reverseGravity) {
      velocity += GRAVITY;
    } else {
      velocity -= GRAVITY;
    }

    // Setting player "targets" to move to next frame (doesn't actually move yet)
    const playerPosition = getFirst(player); // Get the player sprite (for reference)
    targetY = playerPosition.y + Math.floor(velocity);
    if (reverseGravity) {
      targetY = playerPosition.y + Math.ceil(velocity);
    }

    // Identify the platform position for the player to land on
    /* for (const tile of tilesWith(red)) {
      for (const sprite of tile) {
        if (sprite.type === red) {i
          sprite.remove();
        }
      }
    } */
    calculatePlatform(getSkippedTiles());
    
    // Vertical Scrolling! (CONTROL THE targetY AT ALL COSTS)
    verticalScrolling();
    // jpb is only for active/"jumping" movement
    jpb();


    addText(`${platformY}`, { x: 12, y: 5, color: color`F` });

    // WHERE PLAYER MOVEMENT WITH targetY HAPPENS (vertically, ofc)
    if (!reverseGravity) {
      if (platformY !== null) {
        getFirst(player).y = platformY - 1; // Adjust as needed for player size
        velocity = 0;
      } else {
        getFirst(player).y = Math.min(targetY, floor);
      }
    } else {
      if (platformY !== null) {
        getFirst(player).y = platformY + 1; // Adjust as needed for player size
        velocity = 0;
      } else {
        getFirst(player).y = Math.max(targetY, 0);
      }
    }

    addText(`${targetY}`, { x: 9, y: 5, color: color`H` });


    // Spider-Man (sticky) Surfaces
    /*
    const oneAbove = getTile(getFirst(player).x, getFirst(player).y - 1);
    for (const sprite of oneAbove) {
      if (sprite.type === sticky) {
        velocity = 0;
        break;
      }
    }
    */

    // The diisnp function accounts for both gravity cases
    addText(`${determineIfIsSolidNearPlayer()}`, { x: 3, y: 5, color: color`L` });

    flag = false;
    jpb();
    addText(`flag: ${flag}`, { x: 3, y: 7, color: color`3` });

    // airborne logic:
    // !reverseGravity = gravity case
    // !readyTo___ = 
    const regularStop = !reverseGravity && !readyToFall && velocity >= 0 && getFirst(player).y == floor;
    const reverseStop = reverseGravity && !readyToRise && velocity <= 0 && getFirst(player).y == 0;
    if ((determineIfIsSolidNearPlayer() && !reverseGravity) || regularStop) {
      velocity = 0;
      airborne = false; // Player can jump on platforms
    } else if ((determineIfIsSolidNearPlayer() && reverseGravity) || reverseStop) {
      velocity = 0;
      airborne = false;
    } else {
      airborne = true;
    }
    addText(`airborne: ${airborne}`, { x: 3, y: 3, color: color`1` });

    if (readyToFall) {
      readyToFall = false;
    }
    if (readyToRise) {
      readyToRise = false;
    }
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
const levels = [{
    name: "start",
    left: "ruins",
    right: "place1",
    top: "reach1",
    bottom: "belowStart",
    map: map`
.................
.......bb........
.................
.........bb......
.................
.......bb........
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
    spawnPos: { x: 5, y: floor },
    /*
    topPlat is all of the x-coords that the player cannot enter the "top" level in
    It references the blocks from "top" level but the values are hard-coded and stored 
    in the current level because sprig can't access data from other levels
    */
    topPlat: [4, 5, 6],
    /*
    bottomPlat is all of the x-coords that the player cannot enter the "bottom" level in
    It references the "bottom" level but the values are hard-coded and stored 
    in the current level because sprig can't access data from other levels
    */
    bottomPlat: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]
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
    spawnPos: { x: 2, y: floor },
    topPlat: [],
    bottomPlat: []
  },
  {
    name: "ruins",
    left: null,
    right: "start",
    top: null,
    bottom: "belowRuins",
    map: map`
......b..........
.......b.........
....b...b........
...b...........g.
..b.......b...g..
.....d.....b.g...
b....bd.....b....
.b....b.....g....
..b....b....b.d..
...b.......b..b..
....b.....b......
.................
.....bb.bb.......
.bbbb..b.........
.................
.................`,
    spawnPos: { x: 12, y: floor },
    topPlat: [],
    bottomPlat: [0, 1, 4, 5, 10, 11, 14, 15, 16]
  },
  {
    name: "reach1",
    left: null,
    right: null,
    top: null,
    bottom: "start",
    map: map`
.................
.................
.......c.........
......bbbb.......
.....b....sss....
....b.....bbb....
..........g.b.s..
s...bbb...g.b.bb.
bbb.......bbb....
..g..............
d.g....bbb.......
bbbb.............
.................
....bbb..........`,
    spawnPos: { x: 5, y: 12 },
    topPlat: [],
    bottomPlat: []
  },
  {
    name: "belowRuins",
    left: null,
    right: null,
    top: "ruins",
    bottom: null,
    map: map`
bb..bb....bb..bbb
.................
...b........b....
..............bb.
......bbb........
..gggb..........b
..b.........bbb..
...........bb....
.........bbb.....
........bb.......
.................
.................`,
    spawnPos: { x: 10, y: 7 },
    topPlat: [],
    bottomPlat: []
  },
  {
    name: "belowStart",
    left: null,
    right: null,
    top: "start",
    bottom: null,
    map: map`
bbbbbbbbbbbbb....
.................
..s.s.s......b...
.bbbbbbb.........
.................
..sssssss.....bbb
..bbbbbbb.....g..
..g.....g.bbb.g..
..g.cc..g.....g..
..gbbbbbg.....g..`,
    spawnPos: { x: 1, y: 2 },
    topPlat: [],
    bottomPlat: []
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
    addSprite(8, 0, player);
  }
  const saveX = getFirst(player).x;
  const saveY = getFirst(player).y;
  console.log(`Saved coords: ${saveX}, ${saveY}  Direction: ${direction}`);
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
  } else if (direction === "top") {
    currentLevel = convertToIndex(levels[currentLevel].top);
    const level = levels[currentLevel];
    setMap(level.map);
    // Resetting the floor
    floor = height() - 1;
    addSprite(saveX, floor, player);
  } else if (direction === "bottom") {
    currentLevel = convertToIndex(levels[currentLevel].bottom);
    const level = levels[currentLevel];
    setMap(level.map);
    // Resetting the floor
    floor = height() - 1;
    addSprite(saveX, 0, player);
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
  if (getFirst(player).x == width() - 1) {
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

onInput("k", () => {
  if (frameRate == 60) {
    frameRate = 500;
  } else {
    frameRate = 60;
  }
  //jpb();
});

// i cases (like e in roblox, "i" in this game is the "use" key)
// gravity switch
function gravitySwitching() {
  if (true) /*ability condition to be here soon*/ {
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