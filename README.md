##Installing glass
```bash
$ npm install teaglass -g
```
##glass
Start new project
```bash
$ glass init
```
Build Project - it will update `site` folder with the new build.
```bash
$ glass render
```
##default.json
With this file you can set the position of files and set any global variable.
```javascript
{
    "theme": "templates", //theme folder
    "name": "", //name of the Site
    "title": "", //title of the site.
    "base": "", //base url from project
    "only": "" //can be an array or a string only this files will be rendered,
    "positions": [], //set prosition of files which come first and which come at last.
    "variables": {} //set xml variables such as <icon> and get the value setted as an variable on the templating system.
}
```

##Positions example
```javascript
 {
 	"positions": ["index.md", "about.md", "how.md"]
 }
```
The first element rendered it will be `index.md` after that `about.md` and so on...
The `{{position}}` object on template it will be `0` for `index.md` and `1` for `about.md` and at last `2` for `how.md`.

##Variables example
```javascript
 {
 	"variables": {
    	"h1": "title"
    }
 }
```
The `<h1>` element it will be saved as a variable `{{title}}` on the templating system. Remember the `<h1>` element it will be removed from the markdown file.

##Templating
All variables from `default.json` can be accessed by `site` object over the template.

###Example
```xml
<title>{{site.name}} - {{site.title}}</title>
```

###All objects:
```xml
{{content}} <!-- get content from markdown -->
{{site}} <!-- get object from default.json -->
{{position}} <!-- get position from rendering example if index.md it's the first to be rendered the position will be 0 -->
{{list}} <!-- it will return an array with all markdown files precompiled in html. -->
```
