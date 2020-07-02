// each bit represents a wall
var BOTTOM = 0b10;
var RIGHT = 0b01;
var SIZE = 25;
var SEED = -1;

// FOR DRAWING  MAZE and  PLAYER
var canvas = document.getElementsByTagName('canvas')[0];

if(window.innerHeight < window.innerWidth)
{
    canvas.width = window.innerHeight * 0.8;
    canvas.height = window.innerHeight * 0.8;
}
else
{
    canvas.width = window.innerWidth * 0.8;
    canvas.height = window.innerWidth * 0.8;
}

var width = canvas.width;
var context = canvas.getContext('2d');
var gridSize = width / SIZE;

// for maze generation
var NEIGHBOURS = [
    [-1,0],     // TOP
    [0,1],      // RIGHT
    [1,0],      // BOTTOM
    [0,-1]      // LEFT
]
var maze;

class Maze
{
    constructor(SEED)
    {
        if(SEED === -1)
        {
            this.random = Math.random;
        }
        else
        {
            this.random = new Math.seedrandom(SEED);
        }
        this.generatemaze(SEED);
    }

    generatemaze(SEED) {
        // Reintialize new maze
        var visited = new Array(SIZE);
        maze = new Array(SIZE);
        for(var y = 0; y < SIZE ;y++)
        {
            maze[y] = new Array(SIZE);
            visited[y] = new Array(SIZE);
            for(var x = 0; x < SIZE ; x++)
            {
                // upon initialization each cell has all walls
                maze[y][x] = 0b11;
                visited[y][x] = false;
            }
        }  
        
        //maze generation using the Recursive Backtracker method
        var stack = [];

        //Choose the initial cell, mark it as visited and push it to the stack
        var curCell = [0,0];
        visited[curCell[0]][curCell[1]] = true;
        stack.push(curCell);

        //While the stack is not empty
        while(stack.length)
        {            
            //Pop a cell from the stack and make it a current cell
            curCell = stack.pop();
            //If the current cell has any neighbours which have not been visited
            var [unvisited, validNeighbours] = this.unVisited(curCell,visited);
            if(unvisited)
            {
                //Push the current cell to the stack
                stack.push(curCell);

                //break the wall;
                var chosen = this.breakWall(curCell,validNeighbours);

                //Mark the chosen cell as visited and push it to the stack
                visited[chosen[0]][chosen[1]] = true;
                stack.push(chosen);
            }
        }

        this.draw();
    }

    unVisited(current, visited)
    {        
        var unvisited = false;
        var validNeighbours = [];
        for (var i = 0; i < NEIGHBOURS.length; i++)
        {
            var temp = [current[0] + NEIGHBOURS[i][0] , current[1] + NEIGHBOURS[i][1]];
            if(this.notValid(temp)) continue;
            if(!visited[temp[0]][temp[1]])
            {
                unvisited = true;
                validNeighbours.push(i);
            }
            
        }
        return [unvisited, validNeighbours]
    }

    notValid(cords)
    {
        var yNotValid =  cords[0] < 0 ||  cords[0] > SIZE - 1;
        var xNotValid =  cords[1] < 0 ||  cords[1] > SIZE - 1;
        return yNotValid || xNotValid; 
    }

    breakWall(current,validNeighbours) 
    {
        //Choose one of the unvisited neighbours randomly          
        var chosen = validNeighbours[Math.floor(this.random()*validNeighbours.length)];

        //Remove the wall between the current cell and the chosen cell
        var neighbour = [current[0] + NEIGHBOURS[chosen][0], current[1] + NEIGHBOURS[chosen][1]];

        switch(chosen)
        {
            case 1:
                maze[current[0]][current[1]] = maze[current[0]][current[1]] ^ RIGHT;
                break;
            case 2:
                maze[current[0]][current[1]] = maze[current[0]][current[1]] ^ BOTTOM;
                break;
            case 3:
                maze[neighbour[0]][neighbour[1]] = maze[neighbour[0]][neighbour[1]] ^ RIGHT;
                break;
            case 0:
                maze[neighbour[0]][neighbour[1]] = maze[neighbour[0]][neighbour[1]] ^ BOTTOM;
                break;
        }

        return neighbour
    }

    draw(){
        // clear canvas before drawing
        context.clearRect(0, 0, canvas.width, canvas.height);
        // draw new maze
        context.beginPath();
        context.moveTo(0, gridSize);
        for (var y = 0; y < SIZE; y++)
        {
            for (var x = 0; x < SIZE; x++)
            {
                var value = maze[y][x];
                //draw bottom line
                if(value & BOTTOM)
                {
                    context.moveTo(x * gridSize, (y+1) * gridSize);
                    context.lineTo((x+1) * gridSize, (y+1) * gridSize);
                }

                
                if(value & RIGHT)
                {
                    context.moveTo((x+1) * gridSize, (y) * gridSize);
                    context.lineTo((x+1) * gridSize, (y+1) * gridSize);
                }
            }
        }
        context.stroke();
    }
}


class Player
{
    constructor()
    {
        this.width = (gridSize/2)-3;

        // draw player at starting postion
        this.currX = 0;
        this.currY = 0;
        this.draw(0,0);

    }
    
    draw(x,y, drawPath)
    {        
        if(drawPath)
        {
            context.beginPath();
            context.rect((this.currX * gridSize), (this.currY * gridSize), gridSize,  gridSize);
            context.fillStyle =  "#FF0000";
            context.fill();
        }

        context.beginPath();
        context.arc(this.getPosition(x+1), this.getPosition(y+1) , this.width, 0, 2 * Math.PI, false);
        context.closePath();
        context.fillStyle =  "#009900";
        context.fill();
        
        this.checkWIN();
    }  
    
    clear(x,y)
    {
        context.beginPath();
        context.arc(this.getPosition(x+1), this.getPosition(y+1) , this.width + 2, 0, 2 * Math.PI, false);
        context.closePath();
        context.fillStyle = "#FFFFFF";
        context.fill();
    }

    getPosition(i)
    {
        return (i * gridSize) - (gridSize/2)
    }

    move(dir, drawPath=false)
    {
        var  [newX,newY] = this.getNewCords(dir);

        if(this.validMove(newX, newY, dir))
        {
            this.clear(this.currX,this.currY);
            this.draw(newX,newY, drawPath);
            this.currX = newX;
            this.currY = newY;
            this.checkWIN();
        }
    }

    validMove(x,y,dir)
    {
        if (x < 0 || y < 0 || x > SIZE - 1  || y > SIZE - 1  ) return false;
        
        switch(dir)
        {
            case "UP":             
                return !(maze[y][x] & BOTTOM);
            case "LEFT":
                return !(maze[y][x] & RIGHT);
            case "DOWN":
                return !(maze[this.currY][this.currX] & BOTTOM);
            case "RIGHT":
                return !(maze[this.currY][this.currX] & RIGHT);
        }
    }

    getNewCords(dir) 
    {
        switch (dir) 
        {
            case "UP":
                return [this.currX, this.currY - 1];
            case "RIGHT":
                return [this.currX + 1, this.currY];
            case "DOWN":
                return [this.currX, this.currY + 1];
            case "LEFT":
                return [this.currX - 1, this.currY];
            default: return;
        }
    }

    checkWIN()
    {
        if(this.currX === this.currY && this.currX === SIZE-1)
        {
            setTimeout(function(){
                window.alert("YOU WIN!");
            }, 10);
        }
    }
}



(function () 
{
    
    var maze = new Maze();
    var player = new Player();
    var playerlist = [];

    var fire =  function(){
        var firebaseConfig = {
        apiKey: "AIzaSyAcV_n9FkzSt2-OhkbKEketX8K4UY55nQo",
        authDomain: "maze-d9f93.firebaseapp.com",
        databaseURL: "https://maze-d9f93.firebaseio.com",
        projectId: "maze-d9f93",
        storageBucket: "maze-d9f93.appspot.com",
        messagingSenderId: "731110122878",
        appId: "1:731110122878:web:c4b003d26e73982ef97f2f"
        };
        // Initialize Firebase
        firebase.initializeApp(firebaseConfig);
        
        
        // set the board state if it is not set
        var db = firebase.firestore();
        var board = db.collection('maze').doc('board')
        db.runTransaction(function(transaction) {
            return transaction.get(board).then(function(doc) {
                if (!doc.exists) {
                    throw "Document does not exist!";
                }
                
                SEED = doc.data().seed;
                SIZE = doc.data().size;
                gridSize = width / SIZE;
                // seed initialization
                if(!SEED)
                {
                    SEED =  btoa(Math.floor(Math.random() * Math.pow(10,9))); 
                    transaction.update(board,{seed: SEED});
                }
            });
        }).then(function() 
        {

            console.log("Transaction successfully committed!");
        }).catch(function(error) 
        {
            console.log("Transaction failed: ", error);
        });
        
        window.resetBoard = function ()
        {
            db.runTransaction(function(transaction) {
                // This code may get re-run multiple times if there are conflicts.
                return transaction.get(board).then(function(doc) {
                    transaction.update(board,{seed: btoa(Math.floor(Math.random() * Math.pow(10,9)))});
                });
            }).then(function() {
                console.log("Transaction successfully committed!");
            }).catch(function(error) {
                console.log("Transaction failed: ", error);
            });
        }

        // check if the board has changed
        db.collection('maze').doc('board').onSnapshot(function(doc) {
            SEED = doc.data().seed;
            SIZE = doc.data().size;
            gridSize = width / SIZE;
            newGame(SEED)
        });


        // users
        // add user on load
        db.collection("users").add({
            posX: 0,
            posY: 0,
            color: getRandomColor()
        })
        .then(function(presenceRef) 
        {
            window.id = presenceRef.id;
            
        })
        .catch(function(error)
        {
            console.error("Error adding document: ", error);
        });

        //remove user on leave
        window.onbeforeunload = confirmExit;
        function confirmExit() {
            removeUser();
            return "You have attempted to leave this page. Are you sure?";
        }
        
        async function removeUser() {
            await db.collection("users").doc(window.id).delete();
        }

        //update player positions
        db.collection('users')
        .onSnapshot(
            function(col) 
            {
                getUsers().then(function(data)
                {
                    // clear old positions
                    playerlist.forEach(function(player)
                    {
                        player.clear(player.currX, player.currY);
                    })

                    // save and draw the new player positions
                    data.forEach(function(user,indx)
                    {
                        var tempPlayer = new Player(user.color);
                        tempPlayer.currX = user.posX;
                        tempPlayer.currY = user.posY;
                        tempPlayer.draw(user.posX, user.posY);

                        if(indx > playerlist.length - 1){
                            playerlist.push(tempPlayer)
                        }
                        else
                        {
                            playerlist[indx] = tempPlayer;
                        }
                    });
                });
            }
        )

        
    }
    fire();

    function newGame(SEED)
    {
        maze= new Maze(SEED);
        player = new Player();
    }

    async function getUsers()
    {
        const snapshot = await firebase.firestore().collection('users').get()
        return snapshot.docs.map(doc => doc.data());
    }

    function getRandomColor() {
        var letters = '0123456789ABCDEF';
        var color = '#';
        for (var i = 0; i < 6; i++) {
          color += letters[Math.floor(Math.random() * 16)];
        }
        return color;
    }
    
    window.addEventListener('keydown', 
    function(e){
        var dir;
        switch (e.keyCode) {
            case 38:    // arrow up key
            case 87:    // W key
                dir = "UP";
                break;
            case 39:    // arrow right key
            case 68:    // D key
                dir = "RIGHT";
                break;
            case 40:    // arrow down key
            case 83:    // S key
                dir = "DOWN";
                break;
            case 37:    // arrow left key
            case 65:    // A key
                dir = "LEFT";
                break;
            default: return;
        }

        player.move(dir)
    },true);
})();


// DEBUG
// console.log(temp[0])
// console.log(temp[1])
// console.log(moves)
// console.log(currentNode)
// var res =  window.prompt() 
// if (res === "exit") return;
// DEBUG