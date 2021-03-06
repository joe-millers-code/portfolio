const canvas = document.getElementById('tetris');
const context = canvas.getContext('2d');
    context.scale(20, 20);
const arena = createArena(12, 20);

// https://github.com/meth-meth-method/tetris did an awesome tutorial here https://www.youtube.com/watch?v=H2aW5V46khA 
// this is not my original code.

window.addEventListener("keydown", function(e) {
    if(["Space","ArrowUp","ArrowDown","ArrowLeft","ArrowRight"].indexOf(e.code) > -1) {
        e.preventDefault();
    }
}, false);

// -------------------------------------Game Board
function draw() {
    context.fillStyle = '#1a1a1a';
    context.fillRect(0, 0, canvas.width, canvas.height);

    drawMatrix(arena, {x:0, y:0});
    drawMatrix(player.matrix, player.pos);
}

function createArena(w, h) {
    const matrix = [];
    while (h--) {
        matrix.push(new Array(w).fill(0));
    }
    return matrix;
}

function drawMatrix(matrix, offset) {
    matrix.forEach((row, y) => {
        row.forEach((value, x) => {
            if(value !== 0) {
                context.fillStyle = colors[value];
                context.fillRect(x + offset.x, y + offset.y, 1, 1)

            }
        });
    });
}

// -----------------------------------------Game Pieces
const colors = [
    null, 
    'red',
    'blue',
    'violet',
    'green',
    'orange',
    'purple',
    'pink'
]

function createPiece(type){
    if (type === 'T') {
        return [
            [0, 0, 0],
            [1, 1, 1],
            [0, 1, 0],
        ];
    } else if (type === "O") {
        return [
            [2, 2],
            [2, 2]
        ]
    } else if (type === "L") {
        return [
            [0, 3, 0],
            [0, 3, 0],
            [0, 3, 3]
        ]
    } else if (type === "J") {
        return [
            [0, 4, 0],
            [0, 4, 0],
            [4, 4, 0]
        ]
    } else if (type === "I") {
        return [
            [0, 5, 0, 0],
            [0, 5, 0, 0],
            [0, 5, 0, 0],
            [0, 5, 0, 0]
        ]
    } else if (type === "S") {
        return [
            [0, 6, 6],
            [6, 6, 0],
            [0, 0, 0]
        ]
    } else if (type === "Z") {
        return [
            [7, 7, 0],
            [0, 7, 7],
            [0, 0, 0]
        ]
    }
}

//--------------------------------------------Game Controls

document.addEventListener('keydown', e => {
    if (e.key === "ArrowLeft") {
        playerMove(-1);
    } else if (e.key === "ArrowRight") {
        playerMove(1);
    } else if (e.key === "ArrowDown") {
        playerDrop();
    } else if (e.key === 'q') {
        rotateControl(-1)
    } else if (e.key === 'w') {
        rotateControl(1)
    }
})

function rotate(matrix, dir) {
    for (let y = 0; y < matrix.length; ++y) {
        for (let x = 0; x < y; ++x) {
            [
                matrix[x][y],
                matrix[y][x]
            ] = [
                matrix[y][x],
                matrix[x][y]
            ];
        }
    }

    if(dir > 0) {
        matrix.forEach(row => row.reverse());
    } else {
        matrix.reverse();
    }
}

function rotateControl(dir) {
    const pos = player.pos.x
    let offset = 1;
    rotate(player.matrix, dir)
    while (collisonDetector(arena, player)) {
        player.pos.x += offset;
        offset = -(offset + (offset > 0 ? 1 : -1));
        if ( offset > player.matrix[0].length) {
            rotate(player.matrix, -dir);
            player.pos.x = pos
            return;
        }
    }
}

//-------------------------------------------------Player Mechanics

const player = {
    pos:{x:0, y:0},
    matrix: null,
    score: 0,
}

function playerDrop() {
    player.pos.y++;
    if (collisonDetector(arena, player)) {
        player.pos.y--;
        merge(arena, player);
        playerReset();
        rowClear();
        updateScore();
    }
    dropCounter = 0;
}

function playerMove(dir){
    player.pos.x += dir;
    if(collisonDetector(arena, player)) {
        player.pos.x -= dir;
    }
}

function playerReset() {
    const pieces = "ILJOTSZ"
    player.matrix = createPiece(pieces[pieces.length * Math.random() | 0]);
    player.pos.y = 0;
    player.pos.x = (arena[0].length / 2 | 0) - (player.matrix[0].length / 2 | 0);

    if(collisonDetector(arena, player)) {
        arena.forEach(row => row.fill(0));
        player.score = 0;
        updateScore();
    }
}

// ----------------------------------------------------Game Mechanics

function merge(arena, player) {
    player.matrix.forEach((row, y) => {
        row.forEach((value, x) => {
            if (value !== 0) {
                arena[y + player.pos.y][x + player.pos.x] = value;
            }
        });
    });
}

function collisonDetector(arena, player) {
    // const [m, o] = [player.matrix, player.pos];
    const m = player.matrix;
    const o = player.pos
    for (let y = 0; y < m.length; ++y) {
        for (let x = 0; x < m[y].length; ++x) {
            if (m[y][x] !== 0 && 
                (arena[y + o.y] && 
                arena[y + o.y][x + o.x]) !== 0) {
                return true;
            }
        }
    }
    return false;
}

function rowClear() {
    let rowCount = 1;
    outer: for (let y = arena.length - 1; y > 0; --y){
        for (let x = 0; x < arena[y].length; ++x) {
            if (arena[y][x] === 0) {
                continue outer;
            }
        }
        const emptyRow = arena.splice(y, 1)[0].fill(0);
        arena.unshift(emptyRow);
        ++y;

        player.score += rowCount * 10;
        rowCount *= 2;
    }
}

function updateScore(){
    document.getElementById('score').innerText = player.score;
}

let dropCounter = 0;
let dropInterval = 1000;
let lastTime = 0;

function update(time = 0) {
    const deltaTime = time - lastTime;
    dropCounter += deltaTime;
    
    if (dropCounter > dropInterval) {
        playerDrop();
    }
    
    lastTime = time;

    draw();
    requestAnimationFrame(update);
}

playerReset();
updateScore();
update();