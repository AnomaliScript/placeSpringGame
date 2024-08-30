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
const block = "b";
const glass = "g";
const glassBroken = "r";
const crate = "c";
const door = "d";

// Inital level name
let currentLevel = 0;

// Debugging Sprites
const scarlet = "e";
const violet = "v";
const green = "n";
const target = "t";
const leftArrow = "q";
const rightArrow = "x";
const spm /* "spawn point marker" */ = "m";

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
let stopIt = false; // stopIt IS ONLY USEFUL IF THERE ARE NO MOVING OBJECTS UNDERNEATH (the current level)
let offset;
let atWhichGlassBreaks = 2;
let glassIntact = true;
let frameRate = 500;

// Upside-Down Physics
let reverseGravity = false;
let readyToRise = false;

// Interaction Variables
let wPressed = false;
let sPressed = true;

// Abilities!
let doubleJump = false;
let gravityAbility = false;
let breakingAbility = false;

// Aeaeaeaeaesthetics
let framesUntilGlassDisappears = 0;

// Developer Stuff
let debugMode = 0;

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
  [scarlet, bitmap`
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
  [violet, bitmap`
HHHHHHHHHHHHHHHH
HHHHHHHHHHHHHHHH
HHHHHHHHHHHHHHHH
HHHHHHHHHHHHHHHH
HHHHHHHHHHHHHHHH
HHHHHHHHHHHHHHHH
HHHHHHHHHHHHHHHH
HHHHHHHHHHHHHHHH
HHHHHHHHHHHHHHHH
HHHHHHHHHHHHHHHH
HHHHHHHHHHHHHHHH
HHHHHHHHHHHHHHHH
HHHHHHHHHHHHHHHH
HHHHHHHHHHHHHHHH
HHHHHHHHHHHHHHHH
HHHHHHHHHHHHHHHH`],
  [green, bitmap`
DDDDDDDDDDDDDDDD
DDDDDDDDDDDDDDDD
DDDDDDDDDDDDDDDD
DDDDDDDDDDDDDDDD
DDDDDDDDDDDDDDDD
DDDDDDDDDDDDDDDD
DDDDDDDDDDDDDDDD
DDDDDDDDDDDDDDDD
DDDDDDDDDDDDDDDD
DDDDDDDDDDDDDDDD
DDDDDDDDDDDDDDDD
DDDDDDDDDDDDDDDD
DDDDDDDDDDDDDDDD
DDDDDDDDDDDDDDDD
DDDDDDDDDDDDDDDD
DDDDDDDDDDDDDDDD`],
  [target, bitmap`
C..............C
.C............C.
..C..........C..
...C........C...
....C......C....
.....C....C.....
......C..C......
.......CC.......
.......CC.......
......C..C......
.....C....C.....
....C......C....
...C........C...
..C..........C..
.C............C.
C..............C`],
  [leftArrow, bitmap`
................
................
..........3.....
.....3...3......
....3...3...3...
...3...3...3....
..3...3...3.....
.3...3...3......
..3...3...3.....
...3...3...3....
....3...3...3...
.....3...3......
..........3.....
................
................
................`],
  [rightArrow, bitmap`
................
...3............
....3...3.......
.....3...3......
..3...3...3.....
...3...3...3....
....3...3...3...
.....3...3...3..
....3...3...3...
...3...3...3....
..3...3...3.....
.....3...3......
....3...3.......
...3............
................
................`],
  [spm, bitmap`
7..............7
.7............7.
..7..........7..
...7........7...
....7......7....
.....7....7.....
......7..7......
.......77.......
.......77.......
......7..7......
.....7....7.....
....7......7....
...7........7...
..7..........7..
.7............7.
7..............7`],
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
  const originalLevel = currentLevel;
  const originalX = playerPosition.x;
  const originalY = playerPosition.y;
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
      return;
    }
    // Guard clause to exit the function for if a player has just entered another level
    if (justEntered) {
      justEntered = false;
      return;
    }
    // Passive movement (gravity movement and acceleration)
    // Pre-fall check (falling conditions)
    if (stopIt || 
        targetY < floor || 
        Math.floor(velocity) < 0 || 
        levels[currentLevel].bottom === null) {
      readyToFall = false;
      return;
    }

    // Pre-fall check II (interfering platform in current map)
    calculatePlatform(getSkippedTiles());
    if (platformY !== null) {
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

      // During-fall check (interfering platform on the other side)
      const skipping = [];
      for (let i = 0; i <= offset; i++) {
        skipping.push(getTile(originalX, i));
      }
      for (const tile of skipping) {
        for (const sprite of tile) {
          if (sprite.type === block || sprite.type === glass) {
            console.log("you're getting sent back!");
            drawLevel("top");
            readyToFall = false;
            stopIt = true;
            return;
          }
        }
      }

      // Now back to the offset velocity thing
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
  } else { /****************  (reverse/upside-down gravity starts here)  *******************/
    if (targetY > floor && levels[currentLevel].bottom !== null) {
      // Active movement (jump)
      drawLevel("bottom");
      for (const sprite of getTile(originalX, 0)) {
        if (sprite.type === block || sprite.type === glass) {
          console.log("you're getting sent back!");
          drawLevel("top");
          velocity = -1;
          return;
        }
      }
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
    if (stopIt || 
        targetY > 0 || 
        Math.ceil(velocity) > 0 || 
        levels[currentLevel].top === null) {
      readyToRise = false;
      return;
    }

    // Pre-fall check II (interfering platform in current map)
    calculatePlatform(getSkippedTiles());
    if (platformY !== null) {
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

      // During-fall check (interfering platform)
      const skipping = [];
      for (let i = 0; i >= offset; i--) {
        skipping.push(getTile(originalX, floor - i));
      }
      for (const tile of skipping) {
        for (const sprite of tile) {
          if (sprite.type === block || sprite.type === glass) {
            console.log("you're getting sent back!");
            drawLevel("bottom");
            readyToFall = false;
            stopIt = true;
            return;
          }
        }
      }
      
      while (offset < 0) {
        // Calculate offset
        offset = ((Math.ceil(velocity) + playerPosition.y) + 1);
        targetY = floor - offset;
        // Calculate platformY (if it exists)
        calculatePlatform(getSkippedTiles());
        if (platformY !== null) {
          drawLevel("top");
          return;
        }
      }
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
  if ((!reverseGravity && velocity < 0) || (reverseGravity && velocity > 0)) {
    // console.log("skipping finding skipped tiles!");
    return "jumping";
  }
  const skipped = [];
  const playerPosition = getFirst(player);
  if (!reverseGravity) {
    for (let i = 1; i <= Math.abs(Math.floor(velocity)); i++) { // uses floor
      const scanY = playerPosition.y + Math.sign(velocity) * i;
      skipped.push(getTile(playerPosition.x, scanY));
    }
  } else {
    for (let i = 1; i <= Math.abs(Math.ceil(velocity)); i++) { // uses ceiling
      const scanY = playerPosition.y - Math.sign(velocity) * i;
      skipped.push(getTile(playerPosition.x, scanY));
    }
  }

  // Debug tool where the skipped tiles are highlighted (in scarlet)
  // Past scanned
  if (!reverseGravity) {
    for (let i = 1; i <= skipped.length; i += 1) {
      try {
        addSprite(playerPosition.x, playerPosition.y + i, scarlet);
      } catch (error) {}
    }
  } else {
    for (let i = 1; i <= skipped.length; i += 1) {
      try {
        addSprite(playerPosition.x, playerPosition.y - i, scarlet);
      } catch (error) {}
    }
  }
  
  // Near Future/Present scanned (useful when determining if glass breaks or not, and for other debugging processes)
  if (!reverseGravity) {
    for (let i = 1; i <= Math.abs(Math.floor(velocity + GRAVITY)); i++) { // uses floor
      try {
        addSprite(playerPosition.x, playerPosition.y + i + skipped.length, green);
      } catch (error) {}
    }
  } else {
    for (let i = 1; i <= Math.abs(Math.ceil(velocity - GRAVITY)); i++) { // uses ceiling
      try {
        addSprite(playerPosition.x, playerPosition.y - i - skipped.length, green);
      } catch (error) {}
    }
  }
  return skipped;
}

// Calculate if there is a platform to land on
function calculatePlatform(allTiles) {
  if (allTiles.length === 0 || allTiles === "jumping") {
    platformY = null;
    return;
  }
  const playerPosition = getFirst(player);
  for (const tile of allTiles) {
    for (const sprite of tile) {
      // Intervening block cases
      if (sprite.type === spike || sprite.type === spikeFlipped) {
        death = true;
        return;
      } else if (sprite.type === glass) {
        platformY = sprite.y;
        glassSpotted(sprite.x, sprite.y);
        console.log(`${sprite.x} ${sprite.y}`);
        console.log("glass spotted!");
        return;
      } else if (sprite.type === block) {
        platformY = sprite.y;
        console.log("block spotted!");
        return;
      }
    }
  }
  // tailTile initialization
  let tailTileX = playerPosition.x;
  let tailTileY;
  if (!reverseGravity) {
    //             inital pos      fast-forwarding to next move (green)   accounting for intial move (scarlet)    gets past the player
    tailTileY = playerPosition.y + Math.abs(Math.floor(velocity + GRAVITY)) + Math.abs(Math.floor(velocity)) + 1;
  } else {
    tailTileY = playerPosition.y + Math.abs(Math.ceil(velocity - GRAVITY)) - Math.abs(Math.ceil(velocity)) - 1;
  }
  // Future (it's really just an extension fo the Near Future/Present, just looking one block ahead tfor the breaking glass case)
  try {
    addSprite(tailTileX, tailTileY, violet);
  } catch(error) {};
  
  // 1 extra tile
  for (const sprite in getTile(tailTileX, tailTileY)) {
    if (sprite.type === glass) {
      velocity = 0;
      if (!reverseGravity) {
        glassSpotted(tailTileX, tailTileY);
      } else {
        glassSpotted(tailTileX, tailTileY);
      }
    }
  }
  platformY = null;
  return;
}

// what to do if glass is found
function glassSpotted(x, y) {
  const playerPosition = getFirst(player);
  if ((!reverseGravity && Math.abs(Math.floor(velocity)) < atWhichGlassBreaks) ||
        (reverseGravity && Math.ceil(velocity) > -atWhichGlassBreaks)) {
    console.log("velocity too weak");
    if (!reverseGravity) {
      console.log(`${Math.abs(Math.floor(velocity))} is too much negativeness to ${atWhichGlassBreaks}`);
    } else {
      console.log(`${Math.ceil(velocity)} is too much positiveness compared to ${atWhichGlassBreaks}`);
    }
    return;
  }
  console.log("strong enough velocity");
  for (const sprite of getTile(x, y)) {
    if (sprite.type === glass) {
      console.log("glass is breaking");
      sprite.remove();
      addSprite(x, y, glassBroken);
      framesUntilGlassDisappears = 3;
    }
  }
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

let death = false;

// Death checking function
function deathCheck() {
  const playerPosition = getFirst(player);
  let spikes = getAll(spike);
  for (let i = 0; i < spikes.length; i++) {
    if (playerPosition.x === spikes[i].x && playerPosition.y === spikes[i].y) {
      console.log(`Death: (${playerPosition.x}, ${playerPosition.y}) matches (${spikes[i].x}, ${spikes[i].y})`);
      death = true;
      return;
    }
  }
  let spikesFlipped = getAll(spikeFlipped);
  for (let i = 0; i < spikesFlipped.length; i++) {
    if (playerPosition.x === spikesFlipped[i].x && playerPosition.y === spikesFlipped[i].y) {
      console.log(`Death: (${playerPosition.x}, ${playerPosition.y}) matches (${spikes[i].x}, ${spikes[i].y})`);
      death = true;
      return;
    }
  }
  death = false;
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
    // Clearing debugging tiles
    for (const tile of tilesWith(scarlet)) {for (const sprite of tile) {if (sprite.type === scarlet) {sprite.remove();}}}
    for (const tile of tilesWith(violet)) {for (const sprite of tile) {if (sprite.type === violet) {sprite.remove();}}}
    for (const tile of tilesWith(green)) {for (const sprite of tile) {if (sprite.type === green) {sprite.remove();}}}
    for (const tile of tilesWith(target)) {for (const sprite of tile) {if (sprite.type === target) {sprite.remove();}}}
    
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
    
    // Vertical Scrolling! (targetY modification)
    verticalScrolling();
    // jpb is only for active/"jumping" movement (stands for "jumping player bug")
    jpb();
    
    // WHERE PLAYER MOVEMENT WITH targetY HAPPENS (vertically, ofc)
    calculatePlatform(getSkippedTiles());
    if (platformY != null) {
      console.log(`platY = ${platformY}`);
    }
    
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

    // Death check
    deathCheck();

    // The "bump your head becuase you jumped so hard" flag
    flag = false;
    jpb();

    // airborne logic (this is where A LOT of bugs have happened with scrolling):
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

    if (debugMode == 1) {
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

    // Death override (if needed)
    if (death === true) {
      getFirst(player).remove();
      addSprite(levels[currentLevel].spawnPos.x, levels[currentLevel].spawnPos.y, player);
      reverseGravity = false;
    }
    
    // "Dissipating" up the glass
    for (const sprite of getAll(glassBroken)) {
      if (sprite.type === glassBroken) {
        if (framesUntilGlassDisappears === 0) {
          sprite.remove();
        } else {
          framesUntilGlassDisappears -= 1;
        }
      }
    }

    // Sweeping up the glass
    for (const sprite in getTile(playerPosition.x, playerPosition.y + 1)) {
      if (sprite.type === glass) {
        sprite.remove();
        addSprite(playerPosition.x, playerPosition.y + 1, glassBroken);
        framesUntilGlassDisappears = 3;
      } 
    }

    // Resetting breaking glass case
    glassIntact = true;

    // DEBUG TEXT AND OTHER DEBUGGING THINGS
    switch (debugMode) {
      case 1:
        addText("mode: physics", { x: 3, y: 15, color: color`D` });
        addText(`${getFirst(player).x}, ${getFirst(player).y}`, { x: 3, y: 1, color: color`9` }); // Display the player coordinates
        addText(`${Math.floor(velocity)}, ${Math.ceil(velocity)}, ${velocity}`, { x: 9, y: 1, color: color`D` });
        addText(`${floor}`, { x: 15, y: 7, color: color`5` });
        addText(`${height()}`, { x: 14, y: 11, color: color`4` });
        addText(`offset: ${offset}`, { x: 3, y: 9, color: color`7` });
        addText(`flag: ${flag}`, { x: 3, y: 7, color: color`3` });
        addText(`airborne: ${airborne}`, { x: 3, y: 3, color: color`1` });
        addText(`${targetY}`, { x: 9, y: 5, color: color`H` });
        addText(`${determineIfIsSolidNearPlayer()}`, { x: 3, y: 5, color: color`C` });
        addText(`${death}`, { x: 13, y: 9, color: color`F` });
        addText(`${platformY}`, { x: 12, y: 5, color: color`6` });
        addText(`${justEntered}`, { x: 3, y: 11, color: color`8` });
        addText(`${glassIntact}`, { x: 8, y: 11, color: color`L` });
        addSprite(levels[currentLevel].spawnPos.x, levels[currentLevel].spawnPos.y, spm);
        break;
      case 2:
        addText("mode: scrolling", { x: 3, y: 15, color: color`D` });
        addText(`${levels[currentLevel].spawnPos.x}, ${levels[currentLevel].spawnPos.y}`, { x: 3, y: 3, color: color`5` });
        addText(`save crds: ${getFirst(player).x}, ${getFirst(player).y}`, { x: 1, y: 5, color: color`L` });
        if (Array.isArray(levels[currentLevel].left)) {
          addText(`${levels[currentLevel].left[0]}`, { x: 3, y: 7, color: color`C` });
          addText(`${levels[currentLevel].left[1]}`, { x: 3, y: 9, color: color`C` });
        } else {
          addText(`${levels[currentLevel].left}`, { x: 3, y: 7, color: color`C` });
        }
        if (Array.isArray(levels[currentLevel].right)) {
          addText(`${levels[currentLevel].right[0]}`, { x: 3, y: 11, color: color`F` });
          addText(`${levels[currentLevel].right[1]}`, { x: 3, y: 13, color: color`F` });
        } else {
          addText(`${levels[currentLevel].right}`, { x: 3, y: 11, color: color`F` });
        }
        if ('leftSplit' in levels[currentLevel]) {
          addSprite(0, levels[currentLevel].leftSplit, leftArrow);
        }
        if ('rightSplit' in levels[currentLevel]) {
          addSprite(width() - 1, levels[currentLevel].rightSplit, rightArrow);
        }
        addText(`${levels[currentLevel].name}`, { x: 3, y: 1, color: color`4` });
        for (const tile of tilesWith(spm)) {for (const sprite of tile) {if (sprite.type === spm) {sprite.remove();}}}
        break;
      default:
        for (const tile of tilesWith(leftArrow)) {for (const sprite of tile) {if (sprite.type === leftArrow) {sprite.remove();}}}
        for (const tile of tilesWith(rightArrow)) {for (const sprite of tile) {if (sprite.type === rightArrow) {sprite.remove();}}}
    }
  }
}, frameRate);

// Maps/levels
const levels = [{
    name: "origin",
    left: "plains",
    right: ["stairs", null],
    rightSplit: 10,
    top: null,
    bottom: null,
    map: map`
.................
.......bb........
.................
.................
..b..............
..bb.............
..bbb............
.....g...........
bb....g..........
.......g.........
........g........
.........g.......
bb........g......
...........g.....
bb..........g.bb.
.........ss..g...`,
    spawnPos: {x: 5, y: floor}
  },
  {
    name: "plains",
    left: "trainStation",
    right: "origin",
    top: null,
    bottom: "caveEntrance",
    map: map`
................
................
................
................
................
................
................
......bb........
......gg........
......bb........
................
bb..........bb..
.......bb.......
.....b.....b....
.bb..........bb.
...b............`,
    spawnPos: {x: 2, y: floor}
  },
  {
    name: "caveEntrance",
    left: null,
    right: null,//"caveChamber"
    top: "plains",
    bottom: null,//"dungeon"
    map: map`
bbb..bbbbbbbbbbb
.....bd.........
.....bbbbbbbbb..
.............i..
.............d..
.............b..
bbbbbbbbb....i..
...i.g..g.......
.s...g..g..s.b..
bbbbbbbbb.bb.i..
..ii............
.......s........
..bbbbbbbbbbbbbb
..iiiii.iiiiiiii
................
..ssssssssssssss`,
    spawnPos: {x: 2, y: 5}
  },
  {
    name: "stairs",
    left: [null, "origin"],
    leftSplit: 1,
    right: ["childrensGallery", "leapOfFaith"],
    rightSplit: 6,
    top: null,
    bottom: null,
    map: map`
......b...bbb...
...b......g.g...
b.........gdg...
.......b..bbb...
....b.........b.
.b.........b....
........b.......
.....b.........b
..b.........b...
.........b......
......b.........
...b.........b..
..........b.....`,
    spawnPos: {x: 2, y: floor}
  },
  {
    name: "childrensGallery",
    left: [null, "stairs"],
    leftSplit: 5,
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
    spawnPos: {x: 2, y: floor}
  },
  {
    name: "leapOfFaith",
    left: ["stairs", null],
    leftSplit: 6,
    right: "darkroom",
    top: null,
    bottom: "creation",
    map: map`
...........................
...........................
...........................
...........................
...........................
............sss............
............bbb............
...........................
bbbbbb...............bbbbbb
...........................
...........................
...........................
...........................
...........................
...........................
...........................`,
    spawnPos: {x: 2, y: floor}
  }
]

// I'm using a levelName to levelIndex converter because I want to use level names :)
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
  if (direction === "left") { ////////////////////Left case///////////////////////
    if (!Array.isArray(levels[currentLevel].left)) { // Linear/straightforward case
      currentLevel = convertToIndex(levels[currentLevel].left);
      setMap(levels[currentLevel].map);
      // unnecessary but just in case
      resetFloor();
      addSprite(width() - 1, saveY, player);
      return;
    }
    const originalSaveY = saveY; // For the player to go back
    const originalLevel = currentLevel; // Also for the player to go back
    const split = levels[currentLevel].leftSplit;
    if (saveY <= split) {
      // Checking for "splits" without a second level; that's how I make adjecent levels with height offsets
      if (levels[currentLevel].left[0] === null) {
        return;
      }
      const originalHeight = (split + 1);
      currentLevel = convertToIndex(levels[currentLevel].left[0]);
      setMap(levels[currentLevel].map);
      saveY += (height() - originalHeight);
    } else {
      if (levels[currentLevel].left[1] === null) {
        return;
      }
      currentLevel = convertToIndex(levels[currentLevel].left[1]);
      setMap(levels[currentLevel].map);
      saveY -= split + 1;
    }
    resetFloor();
    // Safety Case
    if (saveY < 0 || saveY > floor) {
      currentLevel = convertToIndex(levels[originalLevel]);
      setMap(levels[currentLevel].map);
      resetFloor();
      addSprite(0, originalSaveY, player);
    }
    // CHECKING FOR BLOCKING PLATFORMS
    for (const sprite of getTile(0, saveY)) {
      if (sprite.type === block || sprite.type === glass) {
        console.log("you're getting sent back!");
        currentLevel = originalLevel;
        setMap(levels[currentLevel].map);
        resetFloor();
        addSprite(0, originalSaveY, player);
        return;
      }
    }
    addSprite(width() - 1, saveY, player);
  } else if (direction === "right") { /////////////////////////Right case//////////////////////////
    if (!Array.isArray(levels[currentLevel].right)) { // Linear/straightforward case
      currentLevel = convertToIndex(levels[currentLevel].right);
      setMap(levels[currentLevel].map);
      // unnecessary but just in case
      resetFloor();
      addSprite(0, saveY, player);
      return;
    }
    const originalSaveY = saveY;
    const originalLevel = currentLevel;
    const split = levels[currentLevel].rightSplit;
    if (saveY <= split) {
      // Checking for "splits" without a second level; that's how I make adjecent levels with height offsets
      if (levels[currentLevel].right[0] === null) {
        return;
      }
      const originalHeight = (split + 1);
      currentLevel = convertToIndex(levels[currentLevel].right[0]);
      setMap(levels[currentLevel].map);
      saveY += (height() - originalHeight);
    } else {
      if (levels[currentLevel].right[1] === null) {
        return;
      }
      currentLevel = convertToIndex(levels[currentLevel].right[1]);
      setMap(levels[currentLevel].map);
      saveY -= (split + 1);
    }
    resetFloor();
    // Safety Case
    if (saveY < 0 || saveY > floor) {
      currentLevel = convertToIndex(levels[originalLevel]);
      setMap(levels[currentLevel].map);
      resetFloor();
      addSprite(0, originalSaveY, player);
    }
    // CHECKING FOR BLOCKING PLATFORMS
    for (const sprite of getTile(0, saveY)) {
      if (sprite.type === block || sprite.type === glass) {
        console.log("you're getting sent back!");
        currentLevel = originalLevel;
        setMap(levels[currentLevel].map);
        resetFloor();
        addSprite(width() - 1, originalSaveY, player);
        return;
      }
    }
    addSprite(0, saveY, player);
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
  wPressed = true;
});

onInput("a", () => {
  calculatePlatform(getSkippedTiles());
  if (getFirst(player).x == 0) {
    if (levels[currentLevel].left !== null) {
      drawLevel("left");
    }
  } else {
    getFirst(player).x -= 1;
  }
  if (stopIt) {
    stopIt = false;
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
  sPressed = true;
});

onInput("d", () => {
  calculatePlatform(getSkippedTiles());
  if (getFirst(player).x == width() - 1) {
    if (levels[currentLevel].right !== null) {
      drawLevel("right");
    }
  } else {
    getFirst(player).x += 1;
  }
  if (stopIt) {
    stopIt = false;
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
  if (debugMode == 2) {
    debugMode = 0;
  } else {
    debugMode += 1;
  }
  //jpb();
});

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
  let reds = getAll(scarlet);
  for (let i = 0; i < reds.length; i++) {
    if (playerPosition.x == reds[i].x && playerPosition.y == reds[i].y) {
      getFirst(player).x = levels[currentLevel].spawnPos.x;
      getFirst(player).y = levels[currentLevel].spawnPos.y;
    }
  }
  */
})