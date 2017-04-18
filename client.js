function elt(name, attributes) {
	var node = document.createElement(name);
	if(attributes) {
		for (var attr in attributes) {
			if(attributes.hasOwnProperty(attr)) {
				node.setAttribute(attr, attributes[attr]);
			}
		}
	}
	for(var i = 2; i < arguments.length; i++) {
		var child = arguments[i];
		if(typeof child == "string") {
			var child = document.createTextNode(child);
		}
		node.appendChild(child);
	}
	return node;
}

function clear(node) {
	while(node.hasChildNodes) {
		node.removeChild(node.lastChild)
	}
}

var fs = {};

fs.curdir = "/public";

fs.getList = function(callback) {
	var req = new XMLHttpRequest();

	req.onreadystatechange = function() {
		fs.list = this.responseText.split("\n");
	}
	req.addEventListener("load", callback);
	req.open("GET", fs.curdir);
	req.send();
}

var view = {};

view.fileList = document.getElementById("file-list");

view.listFiles = function() {
	clear(view.fileList);
	for(i in fs.list) {
		view.fileList.appendChild(elt("p", {class: "file-list-item", onclick: "goto(" + fs.list[i] + ")"}));
	}
}

view.goto(path) {
	if(path[0] == "/") {
		path = "/public/" + path;
	}
	else {
		path = fs.curdir + "/" + path;
	}

	var req = new XMLHttpRequest();
	req.addEventListener("load", function(response) {
		var dir = this.getResponseHeader("dir");
		//this looks wrong but it isn't
		if(dir == "true") {

		}
	});
	req.open("GET", path]);
	req.send();
}

fs.getList(view.listFiles);
