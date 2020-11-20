var colors=[
'#999999','#9999cc','#9999ff',
'#99cc99','#99cccc','#99ccff',
'#99ff99','#99ffcc','#99ffff',
'#cc9999','#cc99cc','#cc99ff',
'#cccc99','#cccccc','#ccccff',
'#ccff99','#ccffcc','#ccffff',
'#ff9999','#ff99cc','#ff99ff',
'#ffcc99','#ffcccc','#ffccff',
'#ffff99','#ffffcc'
]
var tagColorMap = {}

var getRandomColor = function (str) {
  if (str in tagColorMap)
    return tagColorMap [str];

  var c = colors[Math.floor(Math.random() * colors.length)];
  tagColorMap [str] = c;
  var index = colors.indexOf(c);
  if (index > -1) {
    colors.splice(index, 1);
  }
  return c;
}

var _tags = {};
var _projects = {}
var loadProjects = function () {
  $(".proj").each (function (i, e) {

  	var url = $(e).children(".card__content").children(".card__title").children("a").attr("href").toLowerCase();
  	var title = $(e).children(".card__content").children(".card__title").children("a").children("h4").html();
  	var content = $(e).children(".card__content").children(".card__text").text();
  	
  	var arrTags = [];
  	$(e).children(".card__content").children(".tags").children(".tag").each (function (i, e){
  		var tag = $(e).text ().trim ().toLowerCase ();
  		if (tag.length == 0) return;
  		arrTags.push (tag);
  		if(! (tag in _tags)) _tags [tag] = 0;
  		_tags [tag]++;
  	});

  	var img = $(e).children(".card__image").children("img").attr("src");

  	_projects [url] = {
  		title: title,
  		content: content,
  		url: url,
  		imgsrc: img,
  		tags: arrTags,
  		entry: e
  	};
  });
}

var applyTagColor = function () {
  $(".rand-color-by-val").each (function (i, e) {
    var text = $(e).text().trim ().toLowerCase();
    var color = getRandomColor(text);
    $(e).css("background-color", color);
  });
}

var _andor = ["&", "|"], _andorIndex = 0;
var getAndOr = function () {
	return _andor [_andorIndex];
}

_tagSelected = [];
var tagHtml = function (tag, color) {
	color = color ? " rand-color-by-val" : "";
	return `<span><span class="btn card__btn tag tag-right-arm${color}" onclick="toggleTag('${tag}')">${tag}</span><span class="numberCircle">${_tags[tag]}</span></span>`;
}
var updateTags = function () {
	var selected = $("#tags-bar").children("#current").children("#selected");
	selected.empty ();
	if (_tagSelected.length > 0) {
		for (var tag of _tagSelected) {
			selected.append (tagHtml (tag, true));
		}
	}
	else {
		selected.append (`<span id="notags" class="notags">&nbsp;&nbsp;&nbsp;tags...</span>`);
	}
	

	var selectable = $("#tags-bar").children("#selectable").children("#choices");
	selectable.empty ();
	for (var tag in _tags) {
		selectable.append (tagHtml (tag, !(_tagSelected.indexOf (tag) < 0)));
	}
	applyTagColor();
}
var updateList = function () {
	var checkFunc = function (tags) {return true;};
	if (_tagSelected.length != 0) {
		if (getAndOr () == "|"){ // OR |
			checkFunc = function (tags) {
				if (tags == null || tags.length == 0) return false;
				var intersect = _tagSelected.filter(x => tags.includes(x));
				return intersect && intersect.length > 0;
			};
		}
		else { // AND &
			checkFunc = function (tags) {
				if (tags == null || tags.length == 0) return false;
				for (var x of _tagSelected) {
					if (!tags.includes(x)) return false;
				}
				return true;
			};
		}
	}

	for (var title in _projects) {
		var proj = _projects [title];
		if (checkFunc (proj.tags)){
			$(proj.entry).show ();
			updateGithubInfo (proj)
		}			
		else 
			$(proj.entry).hide ();
	}
}
var updateGithubInfo = function (proj) {
	var elem = $(proj.entry).find ("#github_stars");
	if (proj.stars && proj.stars > 0) {
		$(elem).children(".count").text (proj.stars);
		elem.show ();
	}
	else {
		elem.hide ();
	}
}

var loadGithubInfo = function (page) {
	if (page == null) page = 1;
	var per_page = 100;
    
	var xmlhttp = new XMLHttpRequest();
	var url = ["https://api.github.com", "users", "sslab-gatech", "repos"]
	function countStars(response) {
		//don't care, just make it an array
		if (!(response instanceof Array)) {
			response = [response];
		}

		//start the count
		var stars = 0;
		for (var i in response) {
			var url = response[i].html_url.toLowerCase();
			if (url in _projects) {
				_projects[url].stars = response[i].stargazers_count;
				updateGithubInfo (_projects[url]);
			}
			else {
				console.log (url);
			}
		}
		
		if (response.length != 0 && response.length == per_page) {
			// load more
			loadGithubInfo(page+1);
		}
	}

	xmlhttp.onreadystatechange = function() {
		if (xmlhttp.readyState == 4 && xmlhttp.status == 200) {
			countStars(JSON.parse(xmlhttp.responseText));
		}
	}

	xmlhttp.open("GET", url.join("/") + `?page=${page}&per_page=${per_page}`, true);
	//set the github media header
	xmlhttp.setRequestHeader("Accept", "application/vnd.github.v3+json");
	xmlhttp.send();
}

// events
var toggleTag = function (tag) {
	this.event.preventDefault();
	var index = _tagSelected.indexOf (tag);
	if (index < 0)
		_tagSelected.push (tag);
	else 
		_tagSelected.splice (index, 1);

	updateTags ();
	updateList ();
}
var toggleAndOr = function (e) {
	this.event.preventDefault();
	_andorIndex++;
	if (_andorIndex >= _andor.length) _andorIndex = _andorIndex % _andor.length;
	$(e).html (getAndOr ());
	updateList ();
}
var clearTags = function () {
	this.event.preventDefault();
	_tagSelected = [];
	updateTags();
	updateList();
}
var openTagPopup = function () {
	this.event.preventDefault();
	var popup = $("#tags-bar").children("#selectable");
	$(popup).toggle();
}
var closeTagPopup = function () {
	this.event.preventDefault();
	var popup = $("#tags-bar").children("#selectable");
	$(popup).hide();
}


loadProjects ();
loadGithubInfo ();

updateTags ();
updateList ();