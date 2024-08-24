/*
@title: place
@author: Brandon (AnomaliScript)
@tags: []
@addedOn: 2024-08-10
*/

// NOTE: Lowering the frame rate too much can cause unexpected bugs/issues in the game

// Tile Sprites
const player = "p";
const spike = "s";
const spikeFlipped = "i";
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
let justEntered = false;
let offset;
let frameRate = 60;

// Upside-Down Physics
let reverseGravity = false;
let readyToRise = false;

// Abilities!
let doubleJump = false;
let gravityAbility = false;
let breakingAbility = false;

// Aeaeaeaeaesthetics
let framesUntilGlassDisappears = 0;

// Developer Stuff
let debugMode = false;

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
  [spikeFlipped, bitmap`
LLLLLLLLLLLLLLLL
.LLLLLLLLLLLLLL.
.LLLLLLLLLLLLLL.
..LLLLLLLLLLLL..
..LLLLLLLLLLLL..
...LLLLLLLLLL...
...LLLLLLL1LL...
....LLLLL1LL....
....LLLLL1LL....
.....LLL1LL.....
.....LLLLLL.....
......LLLL......
......LLLL......
.......LL.......
................
................`],
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
....7......7....
.....7....7....7
.....7...7....7.
.7...7...7....7.
.7...7..7....7..
..77.7..7..77...
..........7.....
....77.......77.
..77..7....77..7
................
...777..7..7....
..7....7....7...
.7.....7.7..77..
7....7.7..7..7..
....7......7..7.
....7..........7`],
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

// Reducing a line of code to a shorter line of code :)
function resetFloor() {
  floor = height() - 1;
}

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
        velocity = 0.25;
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
        velocity = -0.25;
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
    if (targetY < 0 && levels[currentLevel].top !== null) {
      // Active movement (jump)
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
    // Passive movement (gravity movement and acceleration)
    if (levels[currentLevel].bottomPlat.includes(playerPosition.x) || 
        targetY < floor || 
        Math.floor(velocity) < 0 || 
        levels[currentLevel].bottom === null) {
      readyToFall = false;
      return;
    }
    readyToFall = true;
    if (readyToFall) {
      console.log("falling!");

      // Carrying the velocity over
      if (targetY > floor) {
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
      //if (offset >= floor) {
        //platformY = null;
      //}
      targetY = 0 + offset;
      return;
    }
  } else { /************  (reverse/upside-down gravity starts here)  ***********************/
    if (targetY > floor && levels[currentLevel].bottom !== null) {
      // Active movement (jump)
      drawLevel("bottom");
      justEntered = true;
      targetY = 0;
      return;
    } else if (targetY == height()) {
      // Hitting the "ceiling"
      velocity = -1;
    }
    // Guard clause again
    if (justEntered) {
      justEntered = false;
      return;
    }
    // Passive movement (gravity movement and acceleration)
    if (levels[currentLevel].topPlat.includes(playerPosition.x) || 
        targetY > 0 || 
        Math.ceil(velocity) > 0 || 
        levels[currentLevel].top === null) {
      readyToRise = false;
      return;
    }
    readyToRise = true;
    if (readyToRise) {
      console.log("rising!");

      // Carrying the velocity over
      if (targetY < 0) {
        offset = ((Math.ceil(velocity) + playerPosition.y) + 1);
      } else {
        offset = 0;
      }
      drawLevel("top");
      /* while (offset < 0) {
        // Calculate offset
        offset = ((Math.ceil(velocity) + playerPosition.y) + 1);
        targetY = floor - offset;
        // Calculate platformY (if it exists)
        calculatePlatform(getSkippedTiles());
        if (platformY !== null) {
          drawLevel("top");
          return;
        }
      } */
      /* if (offset <= 0) {
        platformY = null;
      } */
      targetY = floor - offset;
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
    resetFloor();
    // troubleshooting addText stuff
    clearText();

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
    
    // Vertical Scrolling! (CONTROL THE targetY AT ALL COSTS)
    verticalScrolling();
    // jpb is only for active/"jumping" movement
    jpb();


    // WHERE PLAYER MOVEMENT WITH targetY HAPPENS (vertically, ofc)
    calculatePlatform(getSkippedTiles());
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

    flag = false;
    jpb();

    // airborne logic (this is where A LOT of bugs have happened):
    // !reverseGravity = gravity case
    // !readyTo___ = checks for a level underneath and if the player is on the floor (or approaching it)
    const regularStop = !reverseGravity && !readyToFall && !justEntered && getFirst(player).y == floor;
    const reverseStop = reverseGravity && !readyToRise && !justEntered && getFirst(player).y == 0;
    if ((determineIfIsSolidNearPlayer() && !reverseGravity) || regularStop) {
      velocity = 0;
      airborne = false; // Player can jump on platforms
    } else if ((determineIfIsSolidNearPlayer() && reverseGravity) || reverseStop) {
      velocity = 0;
      airborne = false;
    } else {
      airborne = true;
    }

    if (debugMode) {
      addText(`${readyToFall}`, { x: 6, y: 13, color: color`5` });
      addText(`${readyToRise}`, { x: 12, y: 13, color: color`4` });
    }
    // Resetting ready cases
    if (readyToFall) {
      readyToFall = false;
    }
    if (readyToRise) {
      readyToRise = false;
    }

    // Sweeping up the glass
    for (const sprite of getAll(glassBroken)) {
      if (sprite.type === glassBroken) {
        if (framesUntilGlassDisappears === 0) {
          sprite.remove();
        } else {
          framesUntilGlassDisappears -= 1;
        }
      }
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
    let spikesFlipped = getAll(spikeFlipped);
    for (let i = 0; i < spikesFlipped.length; i++) {
      if (playerPosition.x == spikesFlipped[i].x && playerPosition.y == spikesFlipped[i].y) {
        getFirst(player).x = levels[currentLevel].spawnPos.x;
        getFirst(player).y = levels[currentLevel].spawnPos.y;
      }
    }
    if (debugMode) {
      addText(`${getFirst(player).x}, ${getFirst(player).y}`, { x: 3, y: 1, color: color`9` }); // Display the player coordinates
      addText(`${Math.floor(velocity)}, ${Math.ceil(velocity)}`, { x: 13, y: 1, color: color`D` });
      addText(`${floor}`, { x: 15, y: 7, color: color`5` });
      addText(`${height()}`, { x: 14, y: 9, color: color`4` });
      addText(`offset: ${offset}`, { x: 3, y: 9, color: color`7` });
      addText(`flag: ${flag}`, { x: 3, y: 7, color: color`3` });
      addText(`airborne: ${airborne}`, { x: 3, y: 3, color: color`1` });
      addText(`${targetY}`, { x: 9, y: 5, color: color`H` });
      addText(`${determineIfIsSolidNearPlayer()}`, { x: 3, y: 5, color: color`C` });
      addText(`${platformY}`, { x: 12, y: 5, color: color`6` });
      addText(`${justEntered}`, { x: 3, y: 11, color: color`8` });
    }
  }
}, frameRate);

// Maps/levels
const levels = [{
    name: "origin",
    left: "plains",
    right: "stairs",
    top: null,
    bottom: null,
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
    topPlat: [],
    /*
    bottomPlat is all of the x-coords that the player cannot enter the "bottom" level in
    It references the "bottom" level but the values are hard-coded and stored 
    in the current level because sprig can't access data from other levels
    */
    bottomPlat: []
  },
  {
    name: "plains",
    left: "trainStation",
    right: "origin",
    top: null,
    bottom: null, //"caveEntrance",
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
    name: "stairs",
    left: "origin",
    right: ["childrensGallery", "leapOfFaith"],
    rightSplit: 6,
    top: null,
    bottom: null,
    map: map`
....b.....bbb...
..b.......g.g...
b.........gdg...
....b.....bbb...
..b...........b.
b...........b...
....b.....b.....
..b.....b.....b.
......b.....b...
....b.....b.....
..b.....b.....b.
......b.....b...
....b.....b.....`,
    spawnPos: { x: 2, y: floor },
    topPlat: [],
    bottomPlat: []
  },
  {
    name: "childrensGallery",
    left: "stairs",
    right: "exhibit",
    top: null,
    bottom: null,
    map: map`
iiiiiiiiiii
..ggggg....
.g.....g...
g..b.b..g..
g.......g..
g.b.d.b.g..
g..bbb..g..
.g.....g...
..ggggg....
...........
...........
......bb...
...bb....bb`,
    spawnPos: { x: 2, y: floor },
    topPlat: [],
    bottomPlat: []
  },
  {
    name: "leapOfFaith",
    left: "stairs",
    right: "darkroom",
    top: null,
    bottom: "creation",
    map: map`
................
................
................
................
................
................
................
................
................
................
................
................
................
................
................
................`,
    spawnPos: { x: 2, y: floor },
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
  let saveX = getFirst(player).x;
  let saveY = getFirst(player).y;
  console.log(`Saved coords: ${saveX}, ${saveY}  Direction: ${direction}`);
  if (direction === "left") {
    if (!Array.isArray(levels[currentLevel].left)) {
      currentLevel = convertToIndex(levels[currentLevel].left);
      setMap(levels[currentLevel].map);
      // unnecessary but just in case
      resetFloor();
      addSprite(width() - 1, saveY, player);
      return;
    }
    const orginalSaveY = saveY; // If the player is out of bounds
    const orginalLevel = currentLevel; // Also if the player is out of bounds
    const split = levels[currentLevel].leftSplit;
    if (saveY >= split) {
      const originalHeight = (split + 1);
      currentLevel = convertToIndex(levels[currentLevel].left[0]);
      setMap(levels[currentLevel].map);
      saveY += (height - originalHeight);
    } else {
      saveY -= split + 1;
    }
    resetFloor();
    if (saveY < 0 || saveY > floor) {
      currentLevel = convertToIndex(levels[originalLevel].left[0]);
      setMap(levels[currentLevel].map);
      resetFloor();
      addSprite(width() - 1, saveY, player);
    }
    addSprite(width() - 1, saveY, player);
  } else if (direction === "right") {
    if (!Array.isArray(levels[currentLevel].right)) {
      currentLevel = convertToIndex(levels[currentLevel].right);
      setMap(levels[currentLevel].map);
      // unnecessary but just in case
      resetFloor();
      addSprite(width() - 1, saveY, player);
      return;
    }
    const split = levels[currentLevel].rightSplit;
    if (saveY >= split) {
      let originalHeight = (split + 1);
      currentLevel = convertToIndex(levels[currentLevel].right[0]);
      setMap(levels[currentLevel].map);
      saveY += (height - originalHeight);
    } else {
      currentLevel = convertToIndex(levels[currentLevel].right[1]);
      setMap(levels[currentLevel].map);
      saveY -= split + 1;
    }
    resetFloor();
    addSprite(width() - 1, saveY, player);
  } else if (direction === "top") {
    currentLevel = convertToIndex(levels[currentLevel].top);
    setMap(levels[currentLevel].map);
    resetFloor();
    addSprite(saveX, floor, player);
  } else if (direction === "bottom") {
    currentLevel = convertToIndex(levels[currentLevel].bottom);
    setMap(levels[currentLevel].map);
    resetFloor();
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
  velocity = -velocity * 0.5;
  gravitySwitching();
  //jpb();
});

onInput("j", () => {
  breakGlass();
});

onInput("k", () => {
  
});

onInput("l", () => {
  if (debugMode) {
    debugMode = false;
  } else {
    debugMode = true;
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

// breaking glass
function breakGlass() {
  const playerPosition = getFirst(player);
  const directions = Array.from({length: 3}, (_, i) => i - 1)  // [-1, 0, 1]
    .flatMap(x => Array.from({length: 3}, (_, y) => [x, y - 1]))
    .filter(([x, y]) => !(x === 0 && y === 0));
  for (let i = 0; i < directions.length; i++) {
    const scanningX = playerPosition.x + directions[i][0];
    const scanningY = playerPosition.y + directions[i][1];
    for (const sprite of getTile(scanningX, scanningY)) {
      if (sprite.type === glass) {
        sprite.remove();
        addSprite(scanningX, scanningY, glassBroken);
        framesUntilGlassDisappears = 3;
      }
    }
  }
}

// AFTERINPUT (literally useless)
afterInput(() => {

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