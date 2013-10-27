describe("Code Story Elevator", function() {

//init state
	it("Init State:The Elevator is stopped, at 0 level floor, has no command.", function() {
		expect(elevator.state).toEqual("CLOSE");
		expect(elevator.isOpen()).toEqual(false);//id as precedent
		expect(elevator.floor).toEqual(0);
		expect(elevator.phase).toEqual("UP");
		expect(elevator.hasCommand()).toEqual(false);
	});

	it("Next Step : first call", function() {
		expect(nextStep()).toEqual("NOTHING");
	});

	it("Next Command of elevator : return null if no command left", function() {
		expect(elevator.nextCommand()).toBeNull();
	});

//first command
	it("ADD Command of elevator : bad command not added ", function() {
		elevator.addCommand("bad command");
		expect(elevator.hasCommand()).toEqual(false);

		elevator.addCommand({floor : MIN_FLOOR - 1, direction : "bad floor"});
		elevator.addCommand({floor : MAX_FLOOR + 1, direction : "bad floor"});
		expect(elevator.hasCommand()).toEqual(false);
	});

	it("ADD Command of elevator : adding a command", function() {
		elevator.addCommand({floor : 3, direction : "bad direction but not bad command"});
		expect(elevator.hasCommand()).toBe(true);
	});

	it("ADD Command of elevator : first command Setting the PHASE", function() {
	    initElevator({floor : 2, state : "CLOSE", phase : "DOWN"});
		elevator.addCommand({floor : 5, direction : "first command setting the phase"});
		expect(elevator.phase).toEqual("UP");

	    initElevator({floor : 2, state : "CLOSE", phase : "UP"});
		elevator.addCommand({floor : 1, direction : "first command setting the phase"});
        elevator.addCommand({floor : 4, direction : "not setting the phase"});
        expect(elevator.phase).toEqual("DOWN");
	});
	it("First command :  adding Upstairs call", function() {
	    initElevator({floor : 2, state : "CLOSE", phase : "DOWN"});

		elevator.addCommand({floor : 5, direction : "DOWN"});

		expect(elevator.hasCommand()).toEqual(true);
		expect(elevator.getUpCommands().length).toEqual(1);
		expect(elevator.getDownCommands().length).toEqual(0);
		expect(elevator.phase).toEqual("UP");//upstairs floor

		var command = elevator.nextCommand();
		expect(command).not.toBeNull();
		expect(command.direction).toEqual("DOWN");
	});

	it("ADD Command of elevator : commands are SORTED by floor", function() {
	    initElevator({floor : 2, state : "CLOSE", phase : "DOWN"});
		elevator.addCommand({floor : 5, direction : "high floor should be at the end"});
		elevator.addCommand({floor : 3, direction : "lowest floor should be at the start"});
        elevator.addCommand({floor : 4, direction : "middle floor should be at the middle"});

		elevator.addCommand({floor : 1, direction : "downstairs : order is inverted"});
		elevator.addCommand({floor : 0, direction : "downstairs : should be the last"});

        var upCommands = elevator.getUpCommands();
        expect(upCommands.length).toEqual(3);
        expect(upCommands[0].floor).toEqual(3);
        expect(upCommands[1].floor).toEqual(4);
        expect(upCommands[2].floor).toEqual(5);

        var downCommands = elevator.getDownCommands();
        expect(downCommands.length).toEqual(2);
        expect(downCommands[downCommands.length - 1].floor).toEqual(1);//the end of the array will be treated before the start
        expect(downCommands[downCommands.length - 2 ].floor).toEqual(0);

        expect(elevator.phase).toEqual("UP");
	});

	it("First Command : Treating upstairs Call", function() {
	    initElevator({floor : 2, state : "CLOSE", phase : "DOWN"});

		elevator.addCommand({floor : 3, direction : "UP"});

		expect(nextStep()).toEqual("UP");//executing
		expect( compareElevators(elevator, { floor : 3, state : "UP", phase : "UP"})).toBe(true);
		expect(nextStep()).toEqual("OPEN");//finishing executing
		expect(elevator.hasCommand()).toBe(false);//the command has been treated
		expect(nextStep()).toEqual("CLOSE");//no command
		expect(nextStep()).toEqual("NOTHING");//no command
	});

	it("First command :  Adding and Treating Downstairs Call", function() {
	    initElevator({floor : 2, state : "CLOSE", phase : "UP"});

		elevator.addCommand({floor : 1, direction : "UP"});

		expect(elevator.hasCommand()).toEqual(true);
		expect(elevator.phase).toEqual("DOWN");//downstairs floor
		expect(elevator.getUpCommands().length).toEqual(0);
		expect(elevator.getDownCommands().length).toEqual(1);

		var command = elevator.nextCommand();
		expect(command).not.toBeNull();
		expect(command.direction).toEqual("UP");

		expect(nextStep()).toEqual("DOWN");//executing
		expect( compareElevators(elevator, { floor : 1, state : "DOWN", phase : "DOWN"})).toBe(true);
		expect(nextStep()).toEqual("OPEN");//finishing executing
		expect(elevator.hasCommand()).toBe(false);//the command has been treated
		expect(nextStep()).toEqual("CLOSE");//no command
		expect(nextStep()).toEqual("NOTHING");//no command
	});


	it("next step of CLOSE is UP if Upstairs command", function() {
		reset();
    	elevator.addCommand({floor : 5, direction : "DOWN"});
    	expect(nextStep()).toEqual("UP");
		expect( compareElevators(elevator, { floor : 1, state : "UP", phase : "UP"})).toBe(true);
	});
	it("next step of CLOSE is DOWN if Downstairs command", function() {
	    initElevator({floor : 4, state : "CLOSE", phase : "UP"});
	    elevator.addCommand({floor : 2, direction : "UP"});
    	expect(nextStep()).toEqual("DOWN");
		expect( compareElevators(elevator, { floor : 3, state : "DOWN", phase : "DOWN"})).toBe(true);
	});

	it("next step of CLOSE is OPEN if command at same floor", function() {
		reset();
    	elevator.addCommand({floor : 0, direction : "UP"});
    	expect(nextStep()).toEqual("OPEN");
	});

	it("next step of OPEN is CLOSE if command for other floor", function() {
	    initElevator({floor : 1, state : "OPEN", phase : "UP"});
	    elevator.addCommand({floor : 5, direction : "DOWN"});
    	expect(nextStep()).toEqual("CLOSE");
		expect( compareElevators(elevator, { floor : 1, state : "CLOSE", phase : "UP"})).toBe(true);
	});
	it("next step of OPEN is CLOSE if command for same floor", function() {
	    initElevator({floor : 1, state : "OPEN", phase : "UP"});
		elevator.addCommand({floor : 1, direction : "DOWN"});

    	//expect(nextStep()).toEqual("NOTHING");
    	expect(nextStep()).toEqual("CLOSE");
	});

	it("next step of OPEN is CLOSE if no more command", function() {
	    initElevator({floor : 1, state : "OPEN", phase : "UP"});
	    expect(nextStep()).toEqual("CLOSE");
	});

	it("next step of UP is OPEN if arrived at floor", function() {
	    initElevator({floor : 1, state : "UP"});
    	elevator.addCommand({floor : 2, direction : "UP"});
    	expect(nextStep()).toEqual("UP");
		expect( compareElevators(elevator, { floor : 2, state : "UP", phase : "UP"})).toBe(true);
    	expect(nextStep()).toEqual("OPEN");
    	expect(nextStep()).toEqual("CLOSE");
	});

	it("next step of DOWN is OPEN after arrived at floor", function() {
	    initElevator({floor : 1, state : "DOWN"});
    	elevator.addCommand({floor : 0, direction : "UP"});

    	expect(nextStep()).toEqual("DOWN");
		expect( compareElevators(elevator, { floor : 0, state : "DOWN", phase : "DOWN"})).toBe(true);
    	expect(nextStep()).toEqual("OPEN");
		expect( compareElevators(elevator, { floor : 0, state : "OPEN", phase : "UP"})).toBe(true);
    	expect(nextStep()).toEqual("CLOSE");
	});


//two commands
	it("2 Commands : 2 Calls downstairs for same direction", function() {
	    initElevator({floor : 3, state : "CLOSE", phase : "UP"});
		elevator.addCommand({floor : 2, direction : "DOWN"});
		elevator.addCommand({floor : 1, direction : "UP"});

		expect(elevator.hasCommand()).toEqual(true);

        var downCommands = elevator.getDownCommands();
		expect(downCommands.length).toEqual(2);

        var next = elevator.nextCommand();
        expect(next.floor).toEqual(2);

        expect(nextStep()).toEqual("DOWN");//executing first command
		expect( compareElevators(elevator, { floor : 2, state : "DOWN", phase : "DOWN"})).toBe(true);
        expect(nextStep()).toEqual("OPEN");//finishing first command
		expect(downCommands.length).toEqual(1);

        expect(nextStep()).toEqual("CLOSE");//executing 2nd command
        expect(nextStep()).toEqual("DOWN");//executing 2nd command
        expect(nextStep()).toEqual("OPEN");//executing 2nd command
		expect( compareElevators(elevator, { floor : 1, state : "OPEN", phase : "UP"})).toBe(true);
		expect(elevator.hasCommand()).toBe(false);//no more command

		expect(nextStep()).toEqual("CLOSE");//no command
		expect(nextStep()).toEqual("NOTHING");//no command

	});


	it("2 Commands : first upstairs, 2nd downstairs", function() {
	    initElevator({floor : 2, state : "CLOSE", phase : "UP"});
		elevator.addCommand({floor : 3, direction : "DOWN"});
		elevator.addCommand({floor : 1, direction : "UP"});

		expect(elevator.hasCommand()).toEqual(true);

		var upCommands = elevator.getUpCommands();
		expect(upCommands.length).toEqual(1);
		expect(upCommands[0].floor).toEqual(3);

        var downCommands = elevator.getDownCommands();
		expect(downCommands.length).toEqual(1);
        expect(downCommands[0].floor).toEqual(1);

        expect(nextStep()).toEqual("UP");//executing first command up
		expect( compareElevators(elevator, { floor : 3, state : "UP", phase : "UP"})).toBe(true);
        expect(nextStep()).toEqual("OPEN");//finishing first command up
		expect(upCommands.length).toEqual(0);

        expect(nextStep()).toEqual("CLOSE");//executing 2nd command up
        expect( compareElevators(elevator, { floor : 3, state : "CLOSE", phase : "DOWN"})).toBe(true);
        expect(nextStep()).toEqual("DOWN");//executing 2nd command up
        expect(nextStep()).toEqual("DOWN");//executing 2nd command up
        expect(nextStep()).toEqual("OPEN");//executing 2nd command up
		expect( compareElevators(elevator, { floor : 1, state : "OPEN", phase : "UP"})).toBe(true);
		expect(elevator.hasCommand()).toBe(false);//no more command

		expect(nextStep()).toEqual("CLOSE");//no command
		expect(nextStep()).toEqual("NOTHING");//no command

	});

	it("2 Commands : 1rst is for other direction - Should not Stop", function() {
	    initElevator({floor : 2, state : "CLOSE", phase : "UP"});

	    elevator.addCommand({floor : 3, direction : "DOWN"});
    	elevator.addCommand({floor : 4, direction : "DOWN"});

		var upCommands = elevator.getUpCommands();
		var downCommands = elevator.getDownCommands();
		expect(upCommands.length).toEqual(2);
		expect(upCommands[0].floor).toEqual(3);
        expect(upCommands[1].floor).toEqual(4);
        expect(downCommands.length).toEqual(0);

        var next = elevator.nextCommand();
        expect(next.floor).toEqual(3);
    	expect(nextStep()).toEqual("UP");//beginning executing 1rst cmd
		expect( compareElevators(elevator, { floor : 3, state : "UP", phase : "UP"})).toBe(true);//should not stop

        next = elevator.nextCommand();
        expect(next.floor).toEqual(4);

		expect(nextStep()).toEqual("UP");//beginning executing 2nd cmd
		expect(upCommands.length).toEqual(1);
		expect(upCommands[0].floor).toEqual(4);
        expect(downCommands.length).toEqual(1);//cmd for 3 floor has been moved to downCommands
        expect(downCommands[0].floor).toEqual(3);

		expect( compareElevators(elevator, { floor : 4, state : "UP", phase : "UP"})).toBe(true);//should stop
    	expect(nextStep()).toEqual("OPEN");//finishing executing 2nd comd
    	expect(upCommands.length).toEqual(0);

    	next = elevator.nextCommand();
        expect(next.floor).toEqual(3);
    	expect(nextStep()).toEqual("CLOSE");//executing 1rst cmd
		expect( compareElevators(elevator, { floor : 4, state : "CLOSE", phase : "DOWN"})).toBe(true);
        expect(nextStep()).toEqual("DOWN");
        expect( compareElevators(elevator, { floor : 3, state : "DOWN", phase : "DOWN"})).toBe(true);
        expect(nextStep()).toEqual("OPEN");
        expect( elevator.hasCommand()).toBe(false);//no more command
	});

	it("3 Commands at same floor : 2nd Call for other direction", function() {
	    initElevator({floor : 2, state : "CLOSE", phase : "UP"});
	    elevator.addCommand({floor : 3, direction : "UP"});
		elevator.addCommand({floor : 3, direction : "DOWN"});
		elevator.addCommand({floor : 3, direction : "UP"});

		expect(elevator.hasCommand()).toEqual(true);

		var upCommands = elevator.getUpCommands();
		expect(upCommands.length).toEqual(3);

        var downCommands = elevator.getDownCommands();
		expect(downCommands.length).toEqual(0);

        expect(nextStep()).toEqual("UP");//executing first command
		expect( compareElevators(elevator, { floor : 3, state : "UP", phase : "UP"})).toBe(true);
        expect(nextStep()).toEqual("OPEN");//finishing first command
		expect(upCommands.length).toEqual(2);
 //       expect(nextStep()).toEqual("NOTHING");//2nd command
 //       expect(nextStep()).toEqual("NOTHING");//3rd command
//		expect(upCommands.length).toEqual(0);
        expect(nextStep()).toEqual("CLOSE");//other commands considered treated


        expect(elevator.hasCommand()).toBe(false);
        expect( compareElevators(elevator, { floor : 3, state : "CLOSE", phase : "DOWN"})).toBe(true);
        expect(nextStep()).toEqual("NOTHING");//no command
	});


	it("Reset after adding a command", function() {
		elevator.addCommand({floor : 0, direction : "new command"});
		
		expect(reset()).toEqual("");
        expect( compareElevators(elevator, { floor : 0, state : "CLOSE", phase : "UP"})).toBe(true);
		expect(elevator.hasCommand()).toBe(false);
	});

	it("calling the elevator up to first floor", function() {
		reset();
		expect(call(1, "UP")).toEqual("");
		//check add
        var next = elevator.nextCommand();
		expect(next.floor).toEqual(1);
		expect(next.direction).toEqual("UP");

        //executing
		expect(nextStep()).toEqual("UP");
		expect(elevator.state).toEqual("UP");
		expect(elevator.floor).toEqual(1);
	});

	it("command call up to first floor is treated", function() {
		reset();
		expect(call(1, "UP")).toEqual("");

        nextStep();
		expect(elevator.state).toEqual("UP");
		expect(elevator.floor).toEqual(1);

		nextStep();
		expect(elevator.state).toEqual("OPEN");
		expect(elevator.floor).toEqual(1);
		expect(elevator.phase).toEqual("DOWN");
		expect(elevator.hasCommand()).toBe(false);
	});


	it("3 calls to the elevator up and down", function() {
		reset();
		elevator.floor = 1;//will treated 2 then 5 then 3 floor calls
		expect(call(4, "DOWN")).toEqual("");
		expect(call(3, "DOWN")).toEqual("");
		expect(call(2, "UP")).toEqual("");

		var upCommands = elevator.getUpCommands();
		expect(upCommands.length).toEqual(3);
		expect(upCommands[0].floor).toEqual(2);
		expect(upCommands[1].floor).toEqual(3);
		expect(upCommands[2].floor).toEqual(4);
		expect(elevator.nextCommand().floor).toEqual(2);
		expect(nextStep()).toEqual("UP");//executing 1st
		expect(nextStep()).toEqual("OPEN");//finishing executing 1st
	    expect(upCommands.length).toEqual(2);
		expect(nextStep()).toEqual("CLOSE");
		expect(nextStep()).toEqual("UP");//executing 2nd (3rd floor)
		expect(nextStep()).toEqual("UP");//executing 3rd (4eme floor) --> then 2nd command is removed form up Commands
		expect(upCommands.length).toEqual(1);//only 3rd command left
		expect(elevator.getDownCommands().length).toEqual(1);//3rd floor command
		expect(nextStep()).toEqual("OPEN");//finishing 3rd command (4e floor)
		expect(nextStep()).toEqual("CLOSE");//executing 2nd  (3rd floor)
		expect(nextStep()).toEqual("DOWN");//executing 2nd  (3rd floor)
		expect(nextStep()).toEqual("OPEN");//finishing 2nd command (3e floor)
		expect(elevator.hasCommand()).toBe(false);
		expect(nextStep()).toEqual("CLOSE");

	});
	
	it("going to the first floor", function() {
		reset();
		expect(go(1)).toEqual("");
		var upCommands = elevator.getUpCommands();
		expect(upCommands[0].floor).toEqual(1);
		expect(upCommands[0].direction).toEqual("UP");
	});
	
	it("going to the 0 floor", function() {
		reset();
		expect(go(0)).toEqual("");
		expect(elevator.hasCommand()).toBe(false);
	});
	
	it("calling from 2nd floor and going to the first floor", function() {
		reset();
		expect(call(2, "DOWN")).toEqual("");
		expect(nextStep()).toEqual("UP");
		expect(nextStep()).toEqual("UP");
		expect(nextStep()).toEqual("OPEN");
		expect(go(1)).toEqual("");

	    var upCommands = elevator.getUpCommands();
	    var downCommands = elevator.getDownCommands();
		expect(upCommands.length).toEqual(0);
		expect(downCommands.length).toEqual(1);
		expect(elevator.phase).toEqual("DOWN");
		expect(nextStep()).toEqual("CLOSE");
		expect(nextStep()).toEqual("DOWN");
		expect(nextStep()).toEqual("OPEN");
		expect(elevator.hasCommand()).toBe(false);
		expect(nextStep()).toEqual("CLOSE");
	});

	//review this test
	it("special test case", function() {
		reset();
		elevator.floor = 3;

        elevator.addCommand({ floor: '4', direction: 'UP' });
        elevator.addCommand({ floor: '4', direction: 'DOWN' });
		elevator.addCommand({ floor: '4', direction: 'DOWN' });
		elevator.addCommand({ floor: '5', direction: 'UP' });

	    var upCommands = elevator.getUpCommands();
	    var downCommands = elevator.getDownCommands();

		expect(upCommands.length).toEqual(4);
		expect(nextStep()).toEqual("UP");
        expect(elevator.floor).toEqual(4);

		expect(nextStep()).toEqual("OPEN");
		expect(upCommands.length).toEqual(3);
		expect(nextStep()).toEqual("CLOSE");

		expect(nextStep()).toEqual("UP");
		expect(nextStep()).toEqual("OPEN");
		expect(upCommands.length).toEqual(0);
//		expect(downCommands.length).toEqual(0);//TODO 2 commands have been deplaced
		expect(nextStep()).toEqual("CLOSE");
	});

});

function initElevator(init){
    reset(); //no command, floor 0, state CLOSE, phase UP
    elevator.floor = init.floor ;
    elevator.state = init.state ;
    elevator.phase = init.phase ;
}

function compareElevators(elevator, other){
    return (elevator.floor == other.floor)
        && (elevator.state == other.state)
        && (elevator.phase == other.phase);
}
