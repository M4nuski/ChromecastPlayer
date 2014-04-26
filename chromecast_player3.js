(function(document) {
"use strict";

//Variables:
var PlayList = {
	pos : -1,
	names : [],
	urls : [],
	htmls : [],
	selected : -1
};	

var hideTimer;
var LinkTag;
var Player;
var FileDialog;

var SongTitle;
var SongTitle_empty = "[No Track]";	

var PlayListBlock;
var PlayListText_empty = "<span id=\"EmptyPlaylistTag\">[Playlist Empty]</span>";

//Events:
	var eventBuffer;
    document.addEventListener("DOMContentLoaded", function () {
        eventBuffer = document.getElementById("songTitle");
        eventBuffer.addEventListener("mouseover", showBlocks);

        eventBuffer = document.getElementById("mediaPlayer");
        eventBuffer.addEventListener("ended", nextTrack);
        eventBuffer.addEventListener("waiting", waitAudio);
		eventBuffer.addEventListener("playing", playingAudio);
		
        eventBuffer = document.getElementById("PrevButton");
        eventBuffer.addEventListener("click", prevTrack);		
	    eventBuffer = document.getElementById("NextButton");
        eventBuffer.addEventListener("click", nextTrack);	
		
	    eventBuffer = document.getElementById("AddButton");
        eventBuffer.addEventListener("click", showDialog);	
	    eventBuffer = document.getElementById("RemoveButton");
        eventBuffer.addEventListener("click", removeTrack);	
		
	    eventBuffer = document.getElementById("ShuffleButton");
        eventBuffer.addEventListener("click", shuffleList);			
	    eventBuffer = document.getElementById("ClearButton");
        eventBuffer.addEventListener("click", clearList);				

	    eventBuffer = document.getElementById("UpButton");
        eventBuffer.addEventListener("click", trackUp);		
	    eventBuffer = document.getElementById("DownButton");
        eventBuffer.addEventListener("click", trackDown);	

	    FileDialog = document.getElementById("AddDialog");
        FileDialog.addEventListener("change", addFiles);			
	
		//init		
		LinkTag = document.getElementById("theme");	
		
		Player = document.getElementById("mediaPlayer");
		Player.volume = 0.5;		
		
		SongTitle = document.getElementById("songTitle");
		SongTitle.innerHTML = SongTitle_empty;		
		
		PlayListBlock = document.getElementById("Playlist");
		PlayListBlock.innerHTML = PlayListText_empty;
		
		eventBuffer = document.getElementById("EmptyPlaylistTag");
		eventBuffer.addEventListener("click", showDialog);
		
        showBlocks();
    });


//Methods:
function tryPlay() {
	if ((PlayList.names.length > 0) & (PlayList.pos > -1) & (PlayList.pos < PlayList.names.length)) {	
		var reader  = new FileReader();
			reader.onloadend = function () {
				Player.src = reader.result;
				Player.load();
				Player.play();				
			}
		reader.readAsDataURL(PlayList.urls[PlayList.pos]);				
	} else {
		SongTitle.innerHTML = SongTitle_empty;
	}
}

function waitAudio() {
	SongTitle.innerHTML = "Loading...";
}

function playingAudio() {
	if (PlayList.names.length > 0) { 
		SongTitle.innerHTML = PlayList.names[PlayList.pos]; 
	} else {
		SongTitle.innerHTML = SongTitle_empty;
	}
}	

function stopPlay() {
	Player.pause();	
	Player.src = "";
	SongTitle.innerHTML = SongTitle_empty;
}

function prevTrack(){
	PlayList.pos--;
	if (PlayList.pos <= -1) {PlayList.pos = Playlist.names.length-1};
	rebuildPlayList();
	tryPlay();
}		

function nextTrack(){
	PlayList.pos++;
	if (PlayList.pos >= PlayList.names.length) {PlayList.pos = 0};
	rebuildPlayList();
	tryPlay();
}	

function showDialog() {
	resetTimer();
	FileDialog.click();
}

function toStringNoComma(array) {
	var stringbuffer = "";
	for (var i = 0; i < array.length; i++) {
		stringbuffer += array[i];
	}
	return stringbuffer;
}

function getSong(songName) {
	var pos =  songName.lastIndexOf("\\");
	var stringbuffer = songName.substr( pos, songName.length - pos -1);
	pos =  songName.lastIndexOf(".");
	return songName.substr(0, pos);
}

function addFiles() {		
	if (FileDialog.files.length > 0) {
		var wasEmpty = (PlayList.names.length == 0);
		for (var i = 0; i < FileDialog.files.length; i++) {
			PlayList.urls.push(FileDialog.files[i]);
			PlayList.names.push(getSong(FileDialog.files[i].name));							
		}				
		if (wasEmpty) { 
			PlayList.pos = 0;
			rebuildPlayList();
			tryPlay();
		} else {
			rebuildPlayList();
		}
	}
	startTimer();
}
	
function clearList() {
	PlayList.pos = -1;
	PlayList.names = [];
	PlayList.urls = [];
	PlayList.htmls = [];
	PlayList.selected = -1;
	PlayListBlock.innerHTML = PlayListText_empty;
	document.getElementById("EmptyPlaylistTag").addEventListener("click", showDialog);	
	stopPlay();
}

function shuffleList() {
	if (PlayList.names.length > 1) {
		for (var i = 0; i < PlayList.names.length; i++) {
			var randomTrack = Math.floor((Math.random()*PlayList.names.length)+1); 
			swapTrack(i, randomTrack);
			if (i == PlayList.selected) { PlayList.selected = randomTrack } 
			else if (randomTrack == PlayList.selected) { PlayList.selected = i }
			if (i == PlayList.pos) { PlayList.pos = randomTrack }
			else if (randomTrack == PlayList.pos) { PlayList.pos = i }
		}
	}
	rebuildPlayList();
}

function playlistClick(id) {
	PlayList.selected = id.substr(2);
	rebuildPlayList();	
	return false;
}

function playlistDoubleClick(id) {
	PlayList.pos = id.substr(2);	
	tryPlay();
	rebuildPlayList();	
}

function rebuildPlayList() {
	PlayList.htmls = [];	
	if (PlayList.names.length > 0) {
		for (var i = 0; i < PlayList.names.length; i++) {
			var spanClass = "song";
			if (i == PlayList.selected) { spanClass = "selectedSong" }		
			if (i == PlayList.pos) { spanClass = "currentSong" }
			if ((i == PlayList.pos) && (i == PlayList.selected)) { spanClass = "currentAndSelectedSong" }
			PlayList.htmls.push("<span class=\""+spanClass+"\" id=\"id" + i + "\">" + PlayList.names[i] + "</span><br>");

		}
		PlayListBlock.innerHTML = toStringNoComma(PlayList.htmls);	
		for (var i = 0; i < PlayList.names.length; i++) {
			var eventBuffer = document.getElementById("id" + i);
			eventBuffer.addEventListener("click", function () { playlistClick((this.id)) });
			eventBuffer.addEventListener("dblclick", function () { playlistDoubleClick(this.id) });

		}		
	} else {
		stopPlay();
	}
}	

function removeTrack() {
	if ((PlayList.selected > -1) & (PlayList.names.length > 0)) {
		PlayList.names.splice(PlayList.selected, 1);
		PlayList.urls.splice(PlayList.selected, 1);
		if (PlayList.pos >= PlayList.selected) {
			PlayList.pos--; 
			if (PlayList.pos < 0) {PlayList.pos = 0}
		}
		rebuildPlayList();
	}
}

function swapTrack(a, b) {
	if ((PlayList.names.length > 0) & (a > -1) & (a < PlayList.names.length) & (b > -1) & (b < PlayList.names.length) & (a != b)) {
	
		var nameBuffer = PlayList.names[a];
		PlayList.names[a] = PlayList.names[b];
		PlayList.names[b] = nameBuffer;	
			
		var urlsBuffer = PlayList.urls[a];
		PlayList.urls[a] = PlayList.urls[b];
		PlayList.urls[b] = urlsBuffer;	
		return true;
	}	else { 
		return false;
	}
}

function trackUp() {
	if (swapTrack(PlayList.selected, PlayList.selected - 1)) {
		if (PlayList.pos == PlayList.selected) { 
			PlayList.pos--; 
		} else if (PlayList.pos == (PlayList.selected - 1)) {
			PlayList.pos++;
		}
		if ( PlayList.selected > 0 ) { PlayList.selected--; }
		rebuildPlayList();			
	}
}

function trackDown() {
	if (swapTrack(PlayList.selected, PlayList.selected + 1)) {
		if (PlayList.pos == PlayList.selected) { 
			PlayList.pos++; 
		} else if (PlayList.pos == (PlayList.selected + 1)) {
			PlayList.pos--;
		}				
		if ( PlayList.selected < PlayList.names.length-1 ) { PlayList.selected++; } 
		rebuildPlayList();			
	}	
}	

function showBlocks()
{
	resetTimer();
	LinkTag.href = "chromecast_player3_light.css";
	startTimer();
}

function hideBlocks()
{
	LinkTag.href = "chromecast_player3_dark.css";
}

function startTimer()
{
	hideTimer = setTimeout(hideBlocks, 10000);
}

function resetTimer()
{
	if (hideTimer)
	{
		clearTimeout(hideTimer);
	}
}
}(document));