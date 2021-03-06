var http = require("http");
var fs = require("fs");

var methods = Object.create(null);

methods.GET = function(path, respond) {
	console.log("GET " + path);
	fs.stat(path, function(error, stats) {
		if(error && error.code == "ENOENT") {
			respond(404, "File not found\n");
		}
		else if (error) {
			respond(500, error.toString() + "\n");
		}
		else if(stats.isDirectory()) {
			fs.readdir(path, function(error, files) {
				if(error) {
					respond(500, error.toString() + "\n");
				}
				else {
					respond(200, files.join("\n") + "\n", null, {dir: "true"});
				}
			});
		}
		else {
			respond(200, fs.createReadStream(path), require("mime").lookup(path));
		}
	});
};

methods.DELETE = function(path, respond) {
	fs.stat(path, function(error, stats) {
		if(error && error.code == "ENOENT") {
			respond(204);
		}
		else if(error) {
			respond(500, error.toString());
		}
		else if(stats.isDirectory()) {
			fs.rmdir(path, respondErrorOrNothing(respond));
		}
		else {
			fs.unlink(path,respondErrorOrNothing(respond));
		}
	})
}

methods.PUT = function(path, respond, request) {
	var outStream = fs.createWriteStream(path);
	outStream.on("error", function(error) {
		respond(500, error.toString());
	});
	outStream.on("finish", function() {
		respond(204);
	});
	request.pipe(outStream);
};

methods.MKCOL = function(path, respond, request) {
	fs.mkdir(path, respondErrorOrNothing(respond));
}

http.createServer(function(request, response) {
	function respond(code, body, type, headers) {
		if(!type) {
			type = "text/plain";
		}
		if(headers == undefined) {
			var headers = {};
		}
		headers["Content-Type"] = type;
		response.writeHead(code, headers);
		if(body && body.pipe) {
			body.pipe(response);
		}
		else {
			response.end(body);
		}
	}
	if(request.method in methods) {
		methods[request.method](urlToPath(request.url), respond, request);
	}
	else {
		respond(405, "Method " + request.method + " not allowed.");
	}
}).listen(8000);

function urlToPath(url) {
	var path = require("url").parse(url).pathname;

	if(path == "/" || path == "/&") {
		path = "/index.html";
	}
	return "." + decodeURIComponent(path);
}

function respondErrorOrNothing(respond) {
	return function(error) {
		if(error) {
			respond(500, error.toString() + "\n");
		}
		else {
			respond(204);
		}
	};
}
