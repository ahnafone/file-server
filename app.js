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



app.listen(port, () => {
    console.log("Express server listening on port " + port + ".");
});

app.get("/", (req, res) => {
    res.redirect("/home")
})


function getDir(filepath) {
    let out = fs.readdirSync(filepath, { withFileTypes: true });
    out.sort((a, b) => {
        return fs.statSync(filepath + "/" + b.name).mtime.getTime() -
                fs.statSync(filepath + "/" + a.name).mtime.getTime();
    });

    let dirs = [];
    let files = [];
    let filesEncoded = [];

    for(let f of out) {
        if(f.isDirectory()) {
            dirs.push(f.name);
        } else {
            files.push(f.name);
            filesEncoded.push(encodeURIComponent(f.name));
        }
    }
    return({ dirs, files, filesEncoded });
}



app.get("/home", (req, res) => {
    let dirr = getDir("./public/data/");

    res.render("home", {
        dirs: dirr.dirs,
        files: dirr.files,
        encodedFiles: dirr.filesEncoded,
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
        encodedFiles: dirr.filesEncoded,
        path: "/" + path + "/",
        prevPath: prevPath,
        prevDir
    });
});