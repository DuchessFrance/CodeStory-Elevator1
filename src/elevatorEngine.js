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
var MAX_FLOOR = 5;
var MIN_FLOOR = 0;

var elevator = {

    floor : 0,
    state : "CLOSE",
    phase : "UP",

    upCommands : [],
    downCommands : [],

    isOpen : function(){
        return this.state == "OPEN";
    },


    hasCommand : function(){
        return (this.upCommands.length > 0) || (this.downCommands.length > 0) ;
    },

    getArrayCmds : function(way){
        return way == "DOWN"? this.downCommands : this.upCommands;
    },

    getUpCommands : function(){
        return this.upCommands;
    },

    getDownCommands : function(){
        return this.downCommands;
    },

    changePhase : function(){
        if(this.phase == "UP"){
			this.phase = "DOWN";
		}else{
			this.phase = "UP";
		}
    },

    addCommand : function(command){
        if( !command.floor && (command.floor != 0) ){
            return;
        }

/*
        if( ["UP", "DOWN"].indexOf(command.direction) == -1){
            command.direction = (this.floor < command.floor ? "UP" : "DOWN") ;
        }
*/

        if(( command.floor > MAX_FLOOR) || (command.floor < MIN_FLOOR)){
            return "Hey what's the fuck is this floor you are asking !"
        }

        if(!this.hasCommand()){
            this.phase = (this.floor < command.floor) ? "UP" : "DOWN" ;
        }

        //var commands = this.getArrayCmds(command.direction) ;
        var commands = (this.floor < command.floor) ? this.upCommands : this.downCommands ;

        //commands.push(command);
        this.insertCommand(commands, command);

        return "";
    },

    insertCommand : function(commands, command){
       if(commands.length == 0) {
            commands.push(command);
        } else {
            var insertAt = this.locationOf(commands, command);
            commands.splice( insertAt, 0, command);
        }
    },

    locationOf : function (commands, command, start, end) {
        start = start || 0;
        end = end || commands.length;
        var pivot = parseInt(start + (end - start) / 2);

        if(end-start <= 1){
            return commands[pivot].floor > command.floor ? pivot : pivot + 1 ;
        }
        if(commands[pivot].floor == command.floor){
            do{
                pivot ++
            }while( commands[pivot] && (commands[pivot].floor == command.floor));

            return pivot;
        }
        if(commands[pivot].floor < command.floor) {
            return this.locationOf(commands, command, pivot, end);
        } else{
            return this.locationOf(commands, command, start, pivot);
        }
    },

   updateState : function(command){
		if(!this.hasCommand()){
			this.state = "CLOSE" ;
			return;
		}

        var move = (this.floor > command.floor) ? "DOWN" : ( (this.floor < command.floor) ? "UP" : "STOP" );

        var nextState ;
        switch(this.state){
            case "CLOSE" :
                nextState = (move == "STOP") ? "OPEN": move ;
                break;
            case "OPEN" :
                nextState = (move == "STOP") ? "OPEN": "CLOSE" ;
                //nextState = "CLOSE" ;
                break;
            case "UP" :
                nextState = (move == "STOP") ? "OPEN": move ;
                break;
            case "DOWN" :
                nextState = (move == "STOP") ? "OPEN": move ;
                break;
            default :
                nextState = this.state;//impossible
                break;
        }
        this.state = nextState;
    },	

    executeNext : function(){
        var command = this.nextCommand();
        this.updateState(command);

        switch(this.state){
            case "OPEN":
                this.removeFinishedCommand();
                break;
            case "UP" :
                this.floor++;
				this.phase = "UP";
                break ;
            case "DOWN":
                this.floor--;
				this.phase = "DOWN";
                break;
            case "CLOSE":
                break;
            default :
                break;
        }
        return this.state;
    },
	
	isFinished : function(command){
		return command.floor && (command.floor == this.floor) && this.isOpen();
	},


	nextCommand : function(){
	    if(!this.hasCommand()){
	        return null;
	    }
	    console.log(this.upCommands);
	    console.log(this.downCommands);
	    console.log(this.phase);
	    var next = this.nextFromArray();
	    if((next.direction != this.phase)
	        && (this.floor == next.floor)
	        && (this.state != "OPEN")
	        && (this.getArrayCmds(this.phase).length > 1)){//next n'est pas à traiter maintenant
	        this.changeArray(next);
	        next = this.nextCommand();
	    }
		if(this.isFinished(next)){//same command as actual state
		    this.removeFinishedCommand();
		    next = this.nextCommand();
		}
		return next;

	},

	nextFromArray : function(){
	    var next = null;
	    var commands = this.getArrayCmds(this.phase);
	    if(this.phase == "UP"){
	        next = commands[0];
	    }else{
	        next = commands[commands.length - 1];
	    }
	    return next;
	},

	removeFinishedCommand : function(){
		var commands = this.getArrayCmds(this.phase);
	    if(this.phase == "UP"){
		    commands.shift();
	    }else{
	        commands.pop();
	    }

		if(commands.length == 0){
			this.changePhase();
		}
	},

    changeArray : function(command){
    	 this.removeFinishedCommand();//TODO add function taking explicit array as argument
    	 var commands = this.getArrayCmds(command.direction);
    	 this.insertCommand(commands, command);
    },


    reset : function(){
        this.floor = 0;
        this.state = "CLOSE";
        this.phase = "UP";
        this.upCommands = [];
        this.downCommands = [];

    }
}

function nextStep(){
        console.log("Actual State : ", elevator.floor + "e " + elevator.state);

        var actualState = elevator.state;
        var nextState = elevator.executeNext();

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