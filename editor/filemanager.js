// Dummy filemanager for testing purposes

function Filemanager() {
	this.fileContents = {}
}

Filemanager.prototype = {
	fileDialog: function(save) {
		if(save) {
			var name = prompt("Code name:");

			if(name === '') {
				name = null;
			}

			if(name !== null) {
				var list = document.getElementById('filelist');
				var found = false;

				for(var i = 0; i < list.options.length; i++) {
					if(list.options[i].value === name) {
						found = true;
						break;
					}
				}

				if(!found) {
					var newItem = document.createElement("option");
			        newItem.value = name;
			        newItem.text = name;
			        list.add(newItem);
			    }
			}

			return name;
		} else {
			return document.getElementById('filelist').value;
		}
	},
	saveFile: function(name, code) {
		this.fileContents[name] = code;
	},
	loadFile: function(name) {
		return this.fileContents[name];
	}
}