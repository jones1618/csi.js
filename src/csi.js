var csi = {
	aIncludeElements: [],
	nLoadedElements: 0,

	// load contents of all data-include elements
	loadAllIncludes: function(fnAllLoaded, fnProgress) {

		fnAllLoaded = (typeof(fnAllLoaded) != "undefined") ? fnAllLoaded : false;
		fnProgress = (typeof(fnProgress) != "undefined") ? fnProgress : false;

		if ( fnProgress ) fnProgress( "csi: entering loadAllIncludes()..." );

		var elements = document.getElementsByTagName('*');

		// find all elements with data-include attribute
		for (var iElement = 0; iElement < elements.length; ++iElement) {
			if (elements[iElement].hasAttribute && elements[iElement].hasAttribute('data-include')) {
				this.aIncludeElements.push(elements[iElement]);
			}
		}

		if ( fnProgress ) fnProgress("csi: Loading " + this.aIncludeElements.length + " data-include elements");

		// for all data-include elements, load their contents from data-include source file
		for (var element in this.aIncludeElements) {
			var dataIncludeURL = this.aIncludeElements[element].getAttribute('data-include');
			var dataReplaceWithin = this.getAttribute(this.aIncludeElements[element], 'data-include-within', 'false');
			var replaceType = (dataReplaceWithin == "true") ? "loading within" : "replacing";
			if ( fnProgress ) fnProgress("csi: Loading include \"" + dataIncludeURL + "\", " + replaceType + "...");
			this.loadFragment(
				this.aIncludeElements[element],
				dataIncludeURL,
				dataReplaceWithin,
				function() {
					++csi.nLoadedElements;
					if ( fnProgress ) fnProgress("csi: Loaded fragment #" + csi.nLoadedElements + " of " + csi.aIncludeElements.length);
					// if this is the last include loaded, notify the caller with fnAllLoaded()
					if ( csi.nLoadedElements == csi.aIncludeElements.length ) {
						if ( fnAllLoaded ) fnAllLoaded();
					}
				}
			);
		}
		if ( fnProgress ) fnProgress( "csi: exiting loadAllIncludes()..." );
	},
	loadFragment: function(el, url, replaceWithin, fnLoaded) {
			var localTest = /^(?:file):/,
			xmlhttp = new XMLHttpRequest(),
			status = 0;

		xmlhttp.onreadystatechange = function() {
			/* if we are on a local protocol, and we have response text, we'll assume
			 * things were sucessful */
			if (xmlhttp.readyState == 4) {
				status = xmlhttp.status;
			}
			if (localTest.test(location.href) && xmlhttp.responseText) {
				status = 200;
			}
			if (xmlhttp.readyState == 4 && status == 200) {
				if ( replaceWithin == "true" ) {
					el.innerHTML = xmlhttp.responseText;
				}
				else {
					el.outerHTML = xmlhttp.responseText;
				}
				fnLoaded();
			}
		}

		try {
			xmlhttp.open("GET", url, true);
			xmlhttp.send();
		} catch(err) {
			/* todo catch error */
		}
	},
	// get element's attribute or default value if attribute isn't set
	getAttribute: function( el, attributeName, defaultValue ) {
		var value = defaultValue;
		if ( el.hasAttribute(attributeName) ) {
			value = el.getAttribute(attributeName);
			if ( typeof(value) == "undefined" || typeof(value) == null || value == "" ) {
					value = defaultValue;
			}
		};
		return value;
	}
};
