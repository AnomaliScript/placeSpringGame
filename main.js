/*
First time? Check out the tutorial game:
https://sprig.hackclub.com/gallery/getting_started

@title: place
@author: Brandon
@tags: []
@addedOn: 2024-00-00
*/

const player = "p";
const block = "b";

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
  [block, bitmap`
1111111100000000
1111111100000000
1111111100000000
1111111100000000
1111111100000000
1111111100000000
1111111100000000
1111111100000000
0000000011111111
0000000011111111
0000000011111111
0000000011111111
0000000011111111
0000000011111111
0000000011111111
0000000011111111`]
)

setSolids([])

let level = 0
const levels = [{
  map: map`
.......
.......
.......
.......
.......
.......
.......`,
  playerPos: { x: 5, y: 5 },
  blockPos: { x: 3, y: 2 },
}]

let currentLevel = 0;

const drawLevel = (levelIndex) => {
  const level = levels[levelIndex];
  setMap(level.map);
  const playerPos = level.playerPos;
  const blockPos = level.blockPos;

  // Add player and block sprites
  addSprite(playerPos.x, playerPos.y, player);
  addSprite(blockPos.x, blockPos.y, block);
};
drawLevel(currentLevel);

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

afterInput(() => {
  if (player.x == block.x && player.y == block.y) {
    addText("you died :(", { x: 3, y: 3, color: color`0` });
  }
})