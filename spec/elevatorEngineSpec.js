describe("Code Story Elevator", function() {

//init state	
	it("init state: doors are closed.", function() {
		expect(elevator.state).toEqual("CLOSE");
		expect(elevator.isOpen()).toEqual(false);
	});

	it("init state:The Elevator is stopped.", function() {
		expect(elevator.moving).toEqual("STOP");
	});

	it("init state of commands list: empty", function() {
		expect(elevator.commands.length).toEqual(0);
	});

	it("first call to the next step", function() {
		expect(nextStep()).toEqual("NOTHING");
	});

	
//first command	
	it("adding first command", function() {
		elevator.addCommand("new command");
		expect(elevator.commands.length).toEqual(1);
		expect(elevator.commands[0]).toEqual("new command");
	});
	
	it("treating first command", function() {
	    reset();
		elevator.addCommand({floor : 1, direction : "UP"});
		expect(nextStep()).toEqual("UP");//executing
		expect(elevator.moving).toEqual("UP");//new state
        expect(elevator.floor).toEqual(1);//id
		expect(nextStep()).toEqual("OPEN");//executing
		expect(nextStep()).toEqual("CLOSE");//finishing executing
		expect(elevator.hasCommand()).toEqual(false);
		expect(nextStep()).toEqual("NOTHING");//no command
	});

//two commands
	it("adding 2 commands, first for up side, 2nd for downside", function() {
	    reset();
	    elevator.floor = 2;
		elevator.addCommand({floor : 3, direction : "upside for actual state"});
		expect(elevator.commands.length).toEqual(1);
		elevator.addCommand({floor : 1, direction : "downside for actual state"});
		expect(elevator.commands.length).toEqual(2);

		expect(elevator.commands[0].floor).toEqual(1);
		expect(elevator.commands[1].floor).toEqual(3);
		nextStep();
		expect(elevator.state).toEqual("UP");
		expect(elevator.moving).toEqual("UP");
		expect(elevator.curIndex).toEqual(1);
		expect(elevator.floor).toEqual(3);

	});
	it("2 commands - treating first for up side", function() {
	    reset();
	    elevator.floor = 2;
		elevator.addCommand({floor : 3, direction : "upside for actual state"});
		expect(elevator.curIndex).toEqual(0);//before 2nd command
		elevator.addCommand({floor : 1, direction : "downside for actual state"});
        expect(elevator.curIndex).toEqual(1);//after adding 2nd command downside

		expect(nextStep()).toEqual("UP");//executing upside command
 	    expect(nextStep()).toEqual("OPEN");//executing upside command
	    expect(nextStep()).toEqual("CLOSE");//finishing executing upside command

		expect(elevator.commands.length).toEqual(1);
		expect(elevator.curIndex).toEqual(0);
	    expect(nextStep()).toEqual("DOWN");//begining executing downside command
		expect(elevator.moving).toEqual("DOWN");

	});


	it("treating first command", function() {
	    reset();
		elevator.addCommand({floor : 1, direction : "UP"});
		expect(nextStep()).toEqual("UP");//executing
		expect(elevator.moving).toEqual("UP");//new state
        expect(elevator.floor).toEqual(1);//id
		expect(nextStep()).toEqual("OPEN");//executing
		expect(nextStep()).toEqual("CLOSE");//finishing executing
		expect(elevator.hasCommand()).toEqual(false);
		expect(nextStep()).toEqual("NOTHING");//no command
	});


	it("next step of CLOSE is UP if command for up floor", function() {
		reset();
    	elevator.addCommand({floor : 5, direction : "DOWN"});
    	expect(nextStep()).toEqual("UP");
	});
	it("next step of CLOSE is DOWN if command for down floor", function() {
	    reset();
		elevator.floor = 4;
    	elevator.addCommand({floor : 2, direction : "DOWN"});
    	expect(nextStep()).toEqual("DOWN");
	});

	it("next step of CLOSE is OPEN if command at same floor", function() {
		reset();
    	elevator.addCommand({floor : 0, direction : "UP"});
    	expect(nextStep()).toEqual("OPEN");
	});

	it("next step of OPEN is CLOSE if command for other floor", function() {
		elevator.state = "OPEN";
		elevator.floor = 1;
    	elevator.addCommand({floor : 5, direction : "DOWN"});
    	expect(nextStep()).toEqual("CLOSE");
	});
	it("next step of OPEN is NOTHING if command for same floor", function() {
		elevator.floor = 1;
		elevator.state = "OPEN";
		elevator.addCommand({floor : 1, direction : "DOWN"});

    	expect(nextStep()).toEqual("NOTHING");
    	expect(nextStep()).toEqual("CLOSE");
	});

	it("next step of OPEN is CLOSE if no more command", function() {
		elevator.state = "OPEN";
		elevator.floor = 1;
    	expect(nextStep()).toEqual("CLOSE");
	});

	it("next step of UP is OPEN if arrived at floor", function() {
    	elevator.addCommand({floor : 2, direction : "DOWN"});
		elevator.state = "UP";
		elevator.floor = 1;
        var output = nextStep();
    	expect(output).toEqual("UP");
    	elevator.floor = 2;
    	expect(nextStep()).toEqual("OPEN");
    	expect(nextStep()).toEqual("CLOSE");
	});
	it("next step of DOWN is OPEN after arrived at floor", function() {
	    reset();
		elevator.state = "DOWN";
		elevator.moving = "DOWN";
		elevator.floor = 1;
    	elevator.addCommand({floor : 0, direction : "DOWN"});
    	expect(nextStep()).toEqual("DOWN");
    	elevator.floor = 0;
    	expect(nextStep()).toEqual("OPEN");
    	expect(nextStep()).toEqual("CLOSE");
	});


	it("reset after adding a command", function() {
		
		elevator.addCommand("new command");
		
		expect(reset()).toEqual("");
		expect(elevator.state).toEqual("CLOSE");
		expect(elevator.noCommand()).toEqual(true);
		expect(elevator.commands.length).toEqual(0);
	});

	it("calling the elevator up to first floor", function() {
		reset();
		expect(call(1, "UP")).toEqual("");

		expect(elevator.commands[0].floor).toEqual(1);
		expect(elevator.commands[0].direction).toEqual("UP");

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
		expect(elevator.moving).toEqual("UP");
		expect(elevator.noCommand()).toEqual(true);
//TODO to be continued : testing nextfloor

	});


	it("3 calls to the elevator up and down", function() {
		reset();
		elevator.floor = 0;//will treated 2 then 3 then 5 floor calls
		expect(call(5, "UP")).toEqual("");
		expect(call(3, "DOWN")).toEqual("");
		expect(call(2, "UP")).toEqual("");
		
		expect(elevator.commands.length).toEqual(3);
		expect(elevator.commands[0].floor).toEqual(2);
		expect(elevator.commands[2].floor).toEqual(5);
		expect(elevator.nextCommand().floor).toEqual(2);
	});
	
	it("going to the first floor", function() {
		reset();
		expect(go(1)).toEqual("");
		expect(elevator.commands[0].floor).toEqual(1);
		expect(elevator.commands[0].direction).toEqual("UP");
	});
	
	it("going to the 0 floor", function() {
		reset();
		expect(go(0)).toEqual("");
		expect(elevator.commands.length).toEqual(0);
	});
	
	//review this test
	it("calling from 3rd floor and going to the first floor", function() {
		reset();
		expect(elevator.floor).toEqual(0);
		expect(call(3, "DOWN")).toEqual("");
		expect(nextStep()).toEqual("UP");
		expect(go(1)).toEqual("");
		expect(elevator.commands.length).toEqual(1);
		expect(elevator.commands[0].floor).toEqual(3);
		expect(elevator.commands[0].direction).toEqual("DOWN");
	});

	//review this test
	it("special test case", function() {
		reset();
		elevator.floor = 1;
		elevator.state = "OPEN";

        elevator.addCommand({ floor: '4', direction: 'UP' });
        elevator.addCommand({ floor: '4', direction: 'DOWN' });
		elevator.addCommand({ floor: '4', direction: 'DOWN' });
		elevator.addCommand({ floor: '5', direction: 'UP' });

		expect(elevator.commands.length).toEqual(4);
		expect(nextStep()).toEqual("CLOSE");
		expect(nextStep()).toEqual("UP");
        expect(nextStep()).toEqual("UP");
		expect(nextStep()).toEqual("UP");

        expect(elevator.floor).toEqual(4);
		expect(elevator.commands.length).toEqual(4);
		expect(nextStep()).toEqual("OPEN");
		expect(elevator.commands.length).toEqual(3);
        expect(nextStep()).toEqual("NOTHING");
        expect(elevator.commands.length).toEqual(2);
		expect(nextStep()).toEqual("NOTHING");
		expect(nextStep()).toEqual("CLOSE");

		expect(nextStep()).toEqual("UP");
		expect(elevator.commands.length).toEqual(1);
		expect(nextStep()).toEqual("OPEN");
		expect(nextStep()).toEqual("CLOSE");
		expect(elevator.commands.length).toEqual(0);
	});
});