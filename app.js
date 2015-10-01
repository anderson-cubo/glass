#!/usr/bin/env node

var markdown = require('marked');
var nunjucks = require('nunjucks');
var mkpath = require('mkpath');
var path = require('path');
var list = require('dirs');
var fs = require('fs');
var cheerio = require('cheerio');

var getDefaultJsonObject = function() {
	var j = {
  "theme": "templates",
  "name": "",
  "title": "",
  "base": "",
  "positions": [],
  "variables": {}
}
	return JSON.stringify(j, null, 4);
}
var where = function(array, query) {
	return array.indexOf(query);
}
var _folder = process.cwd();

if(process.argv.indexOf('init') != -1) {
	mkpath.sync(path.join(_folder, './site'), 0700);
	mkpath.sync(path.join(_folder, './templates'), 0700);
	console.log('Created folders');
	fs.writeFileSync(path.join(_folder, 'default.json'), getDefaultJsonObject(), 'utf8');
	console.log('Created default.json');
	return false;
}
if(process.argv.indexOf('render') == -1 && process.argv.indexOf('watch') == -1) {
	return false;
}
nunjucks.configure(path.join(_folder, './templates/'), { autoescape: false });
if(fs.existsSync(path.join(_folder, 'default.json')))
	var _glassFile = JSON.parse(fs.readFileSync(path.join(_folder, 'default.json')).toString());
else
	var _glassFile = {};
//START FROM SYSTEM
//CREATE LIST OF MARKDOWN FILES
var _markdown = [];
var addMdown = function(obj, where) {
	if(where == -1) {
		return _markdown.push(obj);
	} else {
		_markdown[where] = obj;
		return where+1;
	}
};
console.log('Starting on Folder', _folder);
var _listOfFiles = list.sync(_folder);
//console.log('listing files', _listOfFiles);
//SEARCH FOR MARKDOWN FILES
var  i, _l = _listOfFiles.length;
for(i = 0; i < _l; i++) {
	//read file and save on _markdown
	var _file = _listOfFiles[i];
	var fileType = _file.split('.').pop().toLowerCase();
	if(fileType == 'md') {
		var newFile = _file.split(_folder)[1].split('.');
		newFile.pop();
		newFile = newFile.join('.').replace(/\\/g,"/");
		var realFile = newFile+'.md';
		//Here check if is to render only one file else keep running.
		var render = true;
		if(_glassFile.only && _glassFile.only.indexOf(realFile) != -1) {
			render = false;
		}
		newFile += "/";
		if(newFile.toLowerCase() == '/index/') {
			newFile = '/index.html';
		}
		console.log('Starting with ', newFile);
		//SAVE AS OBJECT
		var id = addMdown({
			file: newFile,
			render: render,
			content: markdown( fs.readFileSync(_file).toString() )
		}, where(_glassFile.positions, realFile));
		var $ = cheerio.load(_markdown[id-1].content);
		for(var key in _glassFile.variables){
			var newNameVariable = _glassFile.variables[key];
			_markdown[id-1][newNameVariable] = $(key).eq(0).text();
			$(key).eq(0).remove();
		}
		_markdown[id-1].content = $.html();
		console.log('Loaded MD', newFile);
	}
}

//RENDER FILES
//GET THEME
_glassFile.theme = path.join(_folder, _glassFile.theme, 'index.html');
//START RENDERING THEME.
for(var i = 0; i < _markdown.length; i++) {
	var render = _markdown[i];
	if(render.render) {
		console.log('RENDERING MDOWN FILE', render.file);
		//GET ALL FILES
		render.list =  _markdown;
		render.site = _glassFile;
		render.position = i;
		var res = nunjucks.render(_glassFile.theme, render);
		var _file = path.join(_folder, 'site', (render.file == '/index.html' ? "" : render.file));
		//CREATE FOLDER
		if (render.file != '/index.html')
			mkpath.sync(_file, 0700);
		//SAVE FILE
		fs.writeFileSync(path.join(_file, 'index.html'), res, 'utf8');
	}
}
console.log('DONE');
process.exit(0);
