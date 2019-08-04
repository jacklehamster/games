//	Texture size
const TEXTURE_SIZE = 4096;
injector.register("texture-size", [ () => TEXTURE_SIZE ]);

//	WebGL
injector.register("gl", [ "canvas",
	canvas => canvas.getContext('webgl', {antialias: false })
]);

//	Document
injector.register("document", identity(document));

// Debug
injector.register("debug", () => {
	const canDebug = location.search.indexOf("debug") >= 0;

	function _syntaxHighlight(json) {
	    if (typeof json != 'string') {
	         json = JSON.stringify(json, undefined, 2);
	    }
	    json = json.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
	    return json.replace(/("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?)/g, function (match) {
	        var cls = 'number';
	        if (/^"/.test(match)) {
	            if (/:$/.test(match)) {
	                cls = 'key';
	            } else {
	                cls = 'string';
	            }
	        } else if (/true|false/.test(match)) {
	            cls = 'boolean';
	        } else if (/null/.test(match)) {
	            cls = 'null';
	        }
	        return '<span class="' + cls + '">' + match + '</span>';
	    });
	}

	return { canDebug, _syntaxHighlight };
});
