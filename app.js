const express = require('express');
const bodyParser = require('body-parser');
const cors = require("cors");
const fs = require('fs');

const app = express()
    .use(bodyParser.json())
    .use(cors());

app.set('view engine', 'ejs');
app.use(express.static('public'));

const port = process.env.PORT || 80;
let mime  = {
    '.mp4': 'video/mp4',
    '.ts': 'video/mp2t',
    '.mkv': 'video/x-matroska',
    '.avi': 'video/x-msvideo',
    '.flv': 'video/x-flv',
    '.wmv': 'video/x-ms-wmv',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.png': 'image/png',
    '.gif': 'image/gif'
}



app.listen(port, () => {
    console.log("Express server listening on port " + port + ".");
});

app.get("/", (req, res) => {
    res.redirect("/home")
})


function getDir(filepath) {
    let out = fs.readdirSync(filepath, { withFileTypes: true });

    let dirs = [];
    let files = [];

    for(let f of out) {
        if(f.isDirectory()) {
            dirs.push(f.name);
        } else {
            files.push(f.name);
        }
    }
    return({ dirs, files });
}

app.get("/home", (req, res) => {
    let dirr = getDir("./public/data/");

    res.render("home", {
        dirs: dirr.dirs,
        files: dirr.files,
        path: "/",
        prevDir: []
    });
});

app.get("/home/:path(*)", (req, res) => {
    let path = req.params.path;
    let dirr = getDir("./public/data/" + path + "/");

    let url = path.split("/");

    let prevPath = "";
    let prevDir = [];
    if(url.length <= 1) {
        prevDir = ["home", ...getDir("./public/data/").dirs];
    } else {
        for(let i=0; i<url.length-1; i++) {
            prevPath = prevPath + "/" + url[i];
        }
        prevDir = [url[url.length-2], ...getDir("./public/data/" + prevPath).dirs];
    }

    res.render("home", {
        dirs: dirr.dirs,
        files: dirr.files,
        path: "/" + path + "/",
        prevPath: prevPath,
        prevDir
    });
});