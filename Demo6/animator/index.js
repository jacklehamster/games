const express = require('express');
const app = express();
const path = require( 'path' );
const fs = require('fs');
const isImage = require('is-image');
const PNG = require('png-js');
const os = require('os');
const bodyParser = require("body-parser");

const PORT = 3000;
const home = os.homedir();
const animationPath = `${home}/Documents/sprites/`;
const initialFolder = '/Users/vincent/Google Drive/Project/Demo4/oozie';

app.use(express.static(path.join(__dirname, 'views')));
app.use(bodyParser.urlencoded({
    extended: true,
    limit: '50mb',
}));
app.use(bodyParser.json({
    extended: true,
    limit: '50mb',
}));

app.get('/', (req, res) => {
	res.render('index.html');
});

app.get('/img/local/:path', (req, res) => {
	const { path } = req.params;
	const img = fs.readFileSync(path);
	res.writeHead(200, {'Content-Type': 'image/png' });
	res.end(img, 'binary');
});

app.get('/api/animations', (req, res) => {
	const root = req.query.root || '/Users/vincent/Google Drive/Project/Demo4/oozie';

    list(root, true, (folders, images, time) => {
		res.setHeader('Content-Type', 'application/json');
    	res.write(JSON.stringify({
    		root,
			folders,
			images, 
			time,
    	},null,'\t'));
    	res.end();
    });
});

app.post('/api/save', (req, res) => {
	if (!fs.existsSync(animationPath)){
	    fs.mkdirSync(animationPath);
	}
	const name = req.body.name;
	const string = req.body.data;
	if(!name || !string) {
		res.send(JSON.stringify({error:"no name or data"}));
		return;
	}
	const ext = "png";
	const base64Data = string.replace(/^data:image\/png;base64,/, "");
	fs.writeFile(`${animationPath}${name}.${ext}`, base64Data, { encoding: 'base64', flag:'w'}, err => {
		if(err) {
			res.send(JSON.stringify({error:err}));
		}
	 	res.send(JSON.stringify({success:`${name}.${ext} saved successfully.`}));
	});
});

app.get('/img/sprite/:name', (req, res) => {
	const { name } = req.params;
	const img = fs.readFileSync(`${animationPath}${name}`);
	res.writeHead(200, {'Content-Type': 'image/png' });
	res.end(img, 'binary');
});

app.get('/api/list-sprites', (req, res) => {
    list(animationPath, true, (folders, images, time) => {
		res.setHeader('Content-Type', 'application/json');
    	res.write(JSON.stringify({
			images: images.map(path => `/img/sprite/${path.split('/').pop()}`),
			time
    	},null,'\t'));
    	res.end();
    });

});

app.listen(PORT, function() {
   console.log('Listening on port: ', PORT);
});

function list(folder, imagesOnly, onDone) {
    const now = new Date().getTime();
	fs.readdir(folder, (err, files) => {
		const filteredFiles = [];
		const folders = [];
		console.log(files);
		(files||[]).map(file => path.join(folder, file)).forEach(path => {
			if (fs.lstatSync(path).isDirectory()) {
				folders.push(path);
			} else {
				if (!imagesOnly || isImage(path)) {
					filteredFiles.push(path);
				}
			}
		})
		onDone(folders, filteredFiles, now);
	});
}

