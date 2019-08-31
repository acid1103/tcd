/* This file is required since Windows doesn't have the rm or cp commands, and building might occur on any platform. */

const fs = require('fs');

// remove the current distribution assets directory
rm('dist/assets');
// copy the current source assets directory into the distribution directory
cp('src/assets', 'dist/assets');

function rm(path) {
    if (fs.existsSync(path)) {
        if (fs.lstatSync(path).isDirectory()) {
            for (file of fs.readdirSync(path)) {
                rm(path + "/" + file);
            }
            fs.rmdirSync(path);
        } else {
            fs.unlinkSync(path);
        }
    }
}

function cp(fromPath, toPath) {
    if (fs.existsSync(fromPath)) {
        if (fs.lstatSync(fromPath).isDirectory()) {
            fs.mkdirSync(toPath);
            for (file of fs.readdirSync(fromPath)) {
                cp(fromPath + "/" + file, toPath + "/" + file);
            }
        } else {
            fs.copyFileSync(fromPath, toPath);
        }
    }
}
