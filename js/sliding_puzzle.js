const canvas = document.getElementById("drawingCanvas");
const ctx = canvas.getContext("2d");
const size = 100;
const gridSize = 2; // To test the puzzle completion, change here to 2 and in initTiles() change the if statement to if (x === 1 && y === 1).
let tiles = [];
let empty = { x: 2, y: 2 };
let gameWon = false;
const unlockingSpell = 'alohomora';

//source for house colors: https://colors.dopely.top/inside-colors/colors-in-the-world-of-harry-potter-movies/
// House colors
const houseColors = {
    gryffindor: '#740001', 
    slytherin: '#1A472A',
    ravenclaw: '#0E1A40',
    hufflepuff: '#FFD800'
};

// House symbol colors
const houseSymbolColors = {
    gryffindor: '#D3A625',
    slytherin: '#9e9e9e', // color changed from source, was too dark
    ravenclaw: '#946B2D',
    hufflepuff: '#000000'
};

// Initialize tiles
function initTiles() {
    tiles = [];
    for (let y = 0; y < gridSize; y++) {
        for (let x = 0; x < gridSize; x++) {
            if (x === 1 && y === 1) { // To test the puzzle completion → initTiles() change the if statement to if (x === 1 && y === 1).
                tiles.push(null);
            } else {
                tiles.push({ 
                    number: y * gridSize + x + 1, 
                    x, 
                    y,
                    house: getHouseForTile(y * gridSize + x + 1)
                });
            }
        }
    }
    shuffleTiles();
}

// Assign houses to tiles
function getHouseForTile(number) {
    const houses = ['gryffindor', 'slytherin', 'ravenclaw', 'hufflepuff'];
    return houses[Math.floor((number - 1) / 2)]; // should pair 2 tiles per house. "Number" is defined in initTiles()
}

// Shuffle using Fisher-Yates Algorithm. Shameless copy-paste from stackoverflow.
function shuffleTiles() {
    for (let i = tiles.length - 2; i > 0; i--) {
        let j = Math.floor(Math.random() * i);
        if (tiles[i] && tiles[j]) {
            [tiles[i], tiles[j]] = [tiles[j], tiles[i]];
        }
    }
    updateEmptyPosition();
}

// Update empty tile position
// this part is complicated, I found the idea on stackoverflow
function updateEmptyPosition() { // updates the position of the empty tile in the array based on if the tile is null or not and returns the position of the empty tile
    tiles.forEach((tile, index) => {
        if (!tile) {
            empty.x = index % gridSize; // index % gridSize gives the column number
            empty.y = Math.floor(index / gridSize); // This formula gives the row number
        }
    });
}

// Draw the puzzle
function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    if (gameWon) {
        ctx.fillStyle = "#d3a625";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        // Add sparkle effect.
        for (let i = 0; i < 10; i++) {
            ctx.fillStyle = `rgba(255, 255, 255, ${Math.random() * 0.5})`;
            ctx.beginPath();
            ctx.arc(
                Math.random() * canvas.width,
                Math.random() * canvas.height,
                Math.random() * 5,
                0,
                Math.PI * 2
            );
            ctx.fill();
        }
        
        // Draw the Alohomora spell
        ctx.fillStyle = '#000000';
        ctx.shadowColor = '#FFF5E6'; // Warm white glow
        ctx.shadowBlur = 30;
        ctx.shadowOffsetX = 0;
        ctx.shadowOffsetY = 0;
        ctx.font = "bold 36px 'Mystery Quest', cursive";
        ctx.textAlign = "center";
        ctx.fillText("Alohomora", canvas.width/2, canvas.height/2);
        
        // Reset shadow
        ctx.shadowColor = 'transparent';
        ctx.shadowBlur = 0;

        // Add click handler for the spell
        canvas.addEventListener('click', function(event) {
            const rect = canvas.getBoundingClientRect();
            const x = event.clientX - rect.left;
            const y = event.clientY - rect.top;
            window.location.href = 'quiz.html';
        });
        // Add hover effect to change cursor and shine
        canvas.addEventListener('mouseenter', function() {
            canvas.style.cursor = 'zoom-in';
            canvas.style.boxShadow = '0 0 40px rgb(139, 12, 12)';
        });

        // Reset cursor when mouse leaves
        canvas.addEventListener('mouseleave', function() {
            canvas.style.cursor = 'default';
            canvas.style.boxShadow = 'none';
        });
        
        return;
    }
    
    tiles.forEach((tile, index) => {
        if (tile) {
            let x = index % gridSize;
            let y = Math.floor(index / gridSize);
            
            // Draw house-colored background
            ctx.fillStyle = houseColors[tile.house];
            ctx.fillRect(x * size, y * size, size, size);
            
            // Add magical border effect
            ctx.strokeStyle = '#d3a625';
            ctx.lineWidth = 2;
            ctx.strokeRect(x * size, y * size, size, size);
            
            // Draw house symbol with outline
            ctx.strokeStyle = '#000000';
            ctx.lineWidth = 0.3;
            ctx.strokeText(tile.house[0].toUpperCase(), x * size + size / 2, y * size + size / 2 + 7);
            ctx.fillStyle = houseSymbolColors[tile.house];
            ctx.font = "20px 'Mystery Quest', system-ui";
            ctx.textAlign = "center";
            ctx.fillText(tile.house[0].toUpperCase(), x * size + size / 2, y * size + size / 2 + 7);
            
            // Draw tile number with outline
            ctx.strokeStyle = '#000000';
            ctx.lineWidth = 0.3;
            ctx.strokeText(tile.number, x * size + size / 2, y * size + size - 5);
            ctx.fillStyle = houseSymbolColors[tile.house];
            ctx.font = "24px 'Mystery Quest', system-ui";
            ctx.fillText(tile.number, x * size + size / 2, y * size + size - 5);
        }
    });
}

// Move tile if adjacent to empty space
function moveTile(x, y) {
    if (gameWon) return;
    
    const dx = Math.abs(x - empty.x);
    const dy = Math.abs(y - empty.y);
    if ((dx === 1 && dy === 0) || (dx === 0 && dy === 1)) {
        let tileIndex = y * gridSize + x;
        let emptyIndex = empty.y * gridSize + empty.x;
        [tiles[tileIndex], tiles[emptyIndex]] = [tiles[emptyIndex], tiles[tileIndex]];
        empty.x = x;
        empty.y = y;
        draw();
        checkWin();
    }
}

// Check if the puzzle is solved
function checkWin() {
    for (let i = 0; i < tiles.length - 1; i++) {
        if (!tiles[i] || tiles[i].number !== i + 1) return;
    }
    gameWon = true;
    draw();
}




// Handle canvas clicks
canvas.addEventListener("click", (e) => { // e is the event object  
    let rect = canvas.getBoundingClientRect(); // gets the position of the canvas relative to the window
    let x = Math.floor((e.clientX - rect.left) / size); // e.clientX is the horizontal position of the mouse click relative to the left edge of the canvas
    let y = Math.floor((e.clientY - rect.top) / size); // e.clientY is the vertical position of the mouse click relative to the top edge of the canvas
    moveTile(x, y);
});


// Initialize game
canvas.width = gridSize * size; // sets the width of the canvas from the size of the grid
canvas.height = gridSize * size; // sets the height of the canvas from the size of the grid
initTiles(); 
draw(); 
