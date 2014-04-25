"use strict";

var Player = document.getElementById("mediaPlayer");
Player.volume = 0.5;

var FileDialog = document.getElementById("AddDialog");

var PlayList = {
	pos : -1,
	names : [],
	urls : [],
	htmls : [],
	selected : -1
};	

var SongTitle = document.getElementById("songTitle");
var SongTitle_empty = "[No Track]";	
SongTitle.innerHTML = SongTitle_empty;

var PlayListBlock = document.getElementById("Playlist");	
var PlayListText_empty = "<span id=\"EmptyPlaylistTag\" onclick=\"showDialog()\">[Playlist Empty]</span>";
PlayListBlock.innerHTML = PlayListText_empty;

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
}
	
function clearList() {
	PlayList.pos = -1;
	PlayList.names = [];
	PlayList.urls = [];
	PlayList.htmls = [];
	PlayList.selected = -1;
	PlayListBlock.innerHTML = PlayListText_empty;
	stopPlay();
}

function shuffleList() {
	//TODO
}

function playlistClick(id) {
	PlayList.selected = id;
	rebuildPlayList();	
	return false;
}

function playlistDoubleClick(id) {
	PlayList.pos = id;		
	tryPlay();
	rebuildPlayList();	
}

function rebuildPlayList() {
	PlayList.htmls = [];	
	if (PlayList.names.length > 0) {
		for (var i = 0; i < PlayList.names.length; i++) {
			var backgroundColor = "#101010";	
			if (i == PlayList.selected) { backgroundColor = "#505050"; }		
			var textColor = "#C0C0C0";
			if (i == PlayList.pos) { textColor = "#FFFFFF"; }
			PlayList.htmls.push("<span id=\"id" + i + "\" style=\"background:"+backgroundColor+";color:"+textColor+"\" onclick=\"playlistClick("+ i + ")\" ondblclick=\"playlistDoubleClick("+ i+ ")\">" + PlayList.names[i] + "</span><br>");
		}
		PlayListBlock.innerHTML = toStringNoComma(PlayList.htmls);	
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

