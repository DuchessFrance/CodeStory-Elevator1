var http = require("http");
var url = require("url");
var elevator = require("./elevatorEngine");

function start() {
    function onRequest(request, response) {
        var pathname = url.parse(request.url).pathname;
        //console.log("Request for " + pathname + " received.");


        var regExp = /\/(.*)/g;
        var command = regExp.exec(pathname)[1];

        response.writeHead(200, {"Content-Type": "application/json"});


        if(command == "call"){
            var query = url.parse(request.url,true).query;
            response.write(elevator.call(query.atFloor, query.to));
        }else if(command == "go"){
            var query = require('url').parse(request.url,true).query;
            response.write(elevator.go(query.floorToGo));

        }else{
            response.write(elevator[command]());

        }
        
        response.end();
    }

    http.createServer(onRequest).listen(process.env.PORT || 5000);
    console.log("Server has started at localhost:5000.");
}


exports.start = start;