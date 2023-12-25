const prompt = require('prompt-sync')({sigint: true});

class Field{
    static hat = '^';
    static hole = 'O';
    static fieldCharacter = '░';
    static pathCharacter = '*';

    constructor(field){
        this.field = field;
        this.currentPlayerPosition = [0, 0];
        this.onHole = false;
        this.onHat = false;
    }
    print(){
        let res = '';
        for(let i = 0; i<this.field.length; i++){
            for(let j = 0; j<this.field[i].length; j++){
                res = res + this.field[i][j];
            }
            res = res + '\n';
        }
        console.log(res);
    }

    static generateField(size){
        let field = this._generateField(size);

        while(!this.checkSolvable(field)){
            field = this._generateField(size);
        }
        return field;
    }

    static _generateField(size){
        const maxHoleCoveragePercentage = 0.3;
        const maxHoleCoverage = Math.floor(size * size * maxHoleCoveragePercentage);
        const field = [];
        let holeCoverage = 0;
        for(let i = 0; i<size; i++){
            field.push([]);
            for(let j = 0; j<size; j++){
                let rand = Math.floor(Math.random() * 4);
                if(rand === 0 && holeCoverage < maxHoleCoverage){
                    holeCoverage++;
                    field[i].push(Field.hole);
                }else{
                    field[i].push(Field.fieldCharacter);
                }
            }
        }
        field[0][0] = Field.pathCharacter;
        // Place the hat at a random position
        let hatFieldPosition = [0,0];
        while(hatFieldPosition[0] === 0 && hatFieldPosition[1] === 0){
            hatFieldPosition = [Math.floor(Math.random() * size), Math.floor(Math.random() * size)];
        }
        field[hatFieldPosition[0]][hatFieldPosition[1]] = Field.hat;
        return field; 
    }

    static checkSolvable(field){
        let wasHere = [];
        for(let i = 0; i<field.length; i++){
            wasHere.push([]);
            for(let j = 0; j<field[i].length; j++){
                wasHere[i].push(false);
            }
        }

        return this.recursiveSearch(field, 0, 0, wasHere);
    }

    static recursiveSearch(field, x, y, wasHere){
        if(x < 0 || x >= field.length || y < 0 || y >= field[0].length){
            return false;
        }
        if(wasHere[x][y]){
            return false;
        }
        if(field[x][y] === Field.hole){
            return false;
        }
        if(field[x][y] === Field.hat){
            return true;
        }
        wasHere[x][y] = true;
        if(this.recursiveSearch(field, x - 1, y, wasHere) ||
            this.recursiveSearch(field, x + 1, y, wasHere) ||
            this.recursiveSearch(field, x, y - 1, wasHere) ||
            this.recursiveSearch(field, x, y + 1, wasHere)){
            return true;
        }
        return false;
    }

    move(direction){

        if(!this.checkDirection(direction)){
            return false;
        }

        const newMove = this._calculateMove(direction);

        if(!this.checkMove(newMove)){
            return false;
        }

        if(this.checkHat(newMove)){
            this.onHat = true;
            return true;
        }else if(this.checkHole(newMove)){
            this.onHole = true;
            return true;
        }

        this.field[newMove[0]][newMove[1]] = Field.pathCharacter;
        this.currentPlayerPosition = [newMove[0], newMove[1]];
    }

    _calculateMove(direction){
        const newMove = [];
        switch(direction){
            case 'u':
                newMove[0] = this.currentPlayerPosition[0] - 1;
                newMove[1] = this.currentPlayerPosition[1];
                break;
            case 'd':
                newMove[0] = this.currentPlayerPosition[0] + 1;
                newMove[1] = this.currentPlayerPosition[1];
                break;
            case 'l':
                newMove[0] = this.currentPlayerPosition[0];
                newMove[1] = this.currentPlayerPosition[1] - 1;
                break;
            case 'r':
                newMove[0] = this.currentPlayerPosition[0];
                newMove[1] = this.currentPlayerPosition[1] + 1;
        }
        return newMove;
    }

    checkDirection(direction){
        const possibleDirections = ['u', 'd', 'l', 'r'];
        if(!possibleDirections.includes(direction)){
            console.log('Not a valid direction!');
            return false;
        }
        return true;
    }

    checkMove(newMove){
        if(newMove[0] < 0 || newMove[0] >= this.field.length || newMove[1] < 0 || newMove[1] >= this.field[0].length){
            console.log('Not a valid move!');
            return false;
        }
        return true;
    }

    checkHat(newMove){
        const [x, y] = newMove;
        if(this.field[x][y] === Field.hat){
            return true;
        }
        return false;
    }

    checkHole(newMove){
        const [x, y] = newMove;
        if(this.field[x][y] === Field.hole){
            return true;
        }
        return false;
    }

}


class Game{
    constructor(fieldSize){
        this.field = new Field(Field.generateField(fieldSize));
        this.won = false;
        this.lose = false;
    }

    _ask(){
        console.log('Where do you want to move? There are only 4 directions: up(u), down(d), left(l), right(r)');
        let direction = prompt();
        this.field.move(direction);
    }

    gameLoop(){
        while(!this.won && !this.lose){
            this.field.print();
            this._ask();
            this._checkWinOrLose(this.field.currentPlayerPosition);
            if(this.lose){
                console.log('YOU LOSE');
            }else if(this.won){
                console.log('YOU WIN');
            }
        }
    }

    _checkWinOrLose(){
        if(this.field.onHat){
            this.won = true;
        }else if(this.field.onHole){
            this.lose = true;
        }
    }
}

const myGame = new Game(10);
myGame.gameLoop();
