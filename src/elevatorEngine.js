if (typeof (console) == 'undefined' || console == null) {
    console = {
        log : function() {
        },
        warn : function() {
        },
        error : function() {
        }
    }
}
var MAX_FLOOR = 6;
var MIN_FLOOR = 0;

var elevator = {
    
    floor : 0,
    state : "CLOSE",
    commands : [],
    curIndex : 0,
    moving : "STOP",

    isOpen : function(){
        return this.state == "OPEN";
    },

    noCommand : function(){
        return this.commands.length == 0;
    },
    hasCommand : function(){
        return this.commands.length > 0;
    },


    addCommand : function(command){
        if(( command.floor > MAX_FLOOR) || (command.floor < MIN_FLOOR)){
            return "Hey what's the fuck is this floor you are asking !"
        }

       var insertAt = 0;
       if(this.noCommand()) {
            this.commands.push(command);
        } else {
            insertAt = this.locationOf(command);
            this.commands.splice( insertAt, 0, command);
            if((insertAt <= this.curIndex) && (command.floor < this.floor)){
                this.curIndex ++;
            }

        }
        console.log("ADD COMMAND", command);
        console.log("inserted at " + insertAt + " in ", this.commands);

        return "";
    },


    locationOf : function (command, start, end) {
        start = start || 0;
        end = end || this.commands.length;
        var pivot = parseInt(start + (end - start) / 2);

        if(end-start <= 1){
            return this.commands[pivot].floor > command.floor ? pivot : pivot + 1 ;
        }
        if(this.commands[pivot].floor == command.floor){
            do{
                pivot ++ 
            }while( this.commands[pivot] && (this.commands[pivot].floor == command.floor));
            
            return pivot;  
        }


        if(this.commands[pivot].floor < command.floor) {
            return this.locationOf(command, pivot, end);
        } else{
            return this.locationOf(command, start, pivot);
        }
    }, 

   nextState : function(){
        var nextState ;

		var command = this.nextCommand();
        var toGo = command ? command.floor : null ;
        var move = (this.floor > toGo) ? "DOWN" : ( (this.floor < toGo) ? "UP" : "STOP" );

        switch(this.state){
            case "CLOSE" :
                nextState = ((null == toGo) ? "CLOSE" : (move == "STOP" ? "OPEN": move ) ) ;
                break;
            case "OPEN" :
                nextState = ((toGo > -1) && (toGo == this.floor) ? "OPEN": "CLOSE") ;
                break;
            case "UP" :
                nextState = ((move == "STOP") && toGo > -1) ? "OPEN": move ;
                break;
            case "DOWN" :
                nextState = ((move == "STOP") && toGo > -1 ) ? "OPEN": move ;
                break;
            default :
                nextState = "CLOSE";
                break;
        }
        return nextState;
    },	

    changeState : function(){
        var state = this.nextState();
        switch(state){
            case "OPEN":
                this.state = "OPEN";
                this.removeFinishedCommand();
                break;
            case "UP" :
                this.floor++;
                this.state = "UP";
				this.moving = "UP";
                break ;
            case "DOWN":
                this.floor--;
                this.state = "DOWN";
				this.moving = "DOWN";
                break;
            case "CLOSE":
                this.state = "CLOSE";
                break;
            default :
                break;
        }
        return this.state;
    },
	
	isFinished : function(command){
		return (command.floor == this.floor) && this.isOpen();
	},
	
	newIndex : function(){
		if(this.curIndex > this.commands.length - 1){
			this.curIndex = this.commands.length - 1;
			this.moving = "DOWN";
		}else if(this.curIndex == 0){
		    this.moving = "UP";
		}else if(this.moving == "DOWN"){
			this.curIndex --;
			console.log("updating curIndex ", this.curIndex);
		}	
	},
	
	nextCommand : function(){
	    if(!this.hasCommand()){
	        return null;
	    }
		var next = this.commands[this.curIndex];
		if(this.isFinished(next)){
		    this.removeFinishedCommand();
		    next = this.nextCommand();
		}
		return next;		
	},

	removeFinishedCommand : function(){
        this.commands.splice(this.curIndex, 1); //la commande a été traitée
        if(this.hasCommand()){
            this.newIndex();
        }
	},

/*
    nextFloor : function(){
    console.log("NEXT FLOOR commands before ", this.commands);
        if(this.noCommand()){
            return null;
        }

       console.log("curIndex " + this.curIndex);
        var next = this.commands[this.curIndex];

        if( (next.floor == this.floor) && this.isOpen()) {
            console.log("command finished");
            this.commands.splice(this.curIndex, 1); //la commande a été traitée

            if(this.commands.length == 0){
                this.moving = "STOP";
                console.log("no more command");
                return ; //no more commands;
            }

            if(this.curIndex > this.commands.length - 1){
                this.curIndex = this.commands.length - 1;
                this.moving = "DOWN";
                console.log("changing direction to DOWN " + this.curIndex);
            }else if(this.curIndex == 0 && this.moving == "DOWN"){
                this.moving = "UP";
            } else if(this.moving == "DOWN"){
                this.curIndex --;
                console.log("updating curIndex ", this.curIndex);
            }



            next = this.commands[this.curIndex];
        }

        if(this.moving == "STOP"){
            if(next.floor >= this. floor){
                this.moving = "UP";
            }else{
                this.moving = "DOWN";
            }
        }
        console.log("NEXT FLOOR commands After ", this.commands);
        return next.floor;
    },
*/


    reset : function(){
        this.floor = 0;
        this.state = "CLOSE";
        this.commands = [];
        this.curIndex = 0 ;
        this.moving = "STOP";
    }
}

function nextStep(){
        console.log("Actual State : ", elevator.floor + "e " + elevator.state);

        var actualState = elevator.state;
        var nextState = elevator.changeState();

        console.log("New State : ", elevator.floor + "e " + elevator.state );
        return ((nextState == actualState) && ( (nextState == "CLOSE") || (nextState == "OPEN")))
                ? "NOTHING" : nextState ;
}

function reset(){
    console.log("RESET");
    elevator.reset();
    return "";
}

function call(toFloorCall, to){
    var command = {
        floor : toFloorCall,
        direction : to
    } 

    console.log("CALL : ", command);    
    return elevator.addCommand(command);
}

function go(toGo){
    if(toGo == elevator.floor){
        return "";
    }

    var direction = (elevator.floor > toGo) ? "DOWN" : "UP";
    var command = {
        floor : toGo,
        direction : direction
    }
    return elevator.addCommand(command);
}

function userHasEntered(){
    console.log("userHasEntered");
    return "";
}

function userHasExited(){
    console.log("userHasExited");
    return "";
}
exports.nextCommand = nextStep;
exports.reset = reset;
exports.call = call;
exports.go = go;
exports.userHasEntered = userHasEntered;
exports.userHasExited = userHasExited;