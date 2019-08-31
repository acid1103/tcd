import {
    app,
    BrowserWindow,
} from "electron";

let mainWindow: BrowserWindow;
function createWindow() {
    mainWindow = new BrowserWindow({
        frame: false,
        height: 65,
        resizable: false,
        show: false,
        title: "TCD",
        webPreferences: {
            // unfortunately, node integration is necessary to call our compiled typescript code.
            nodeIntegration: true,
        },
        width: 504,
    });

    mainWindow.loadFile("index.html");

    mainWindow.once("ready-to-show", () => {
        mainWindow.show();
    });

    mainWindow.on("closed", () => {
        mainWindow = null;
    });
}

app.on("ready", () => {
    createWindow();
});

app.on("window-all-closed", () => {
    // On macOS it is common for applications and their menu bar
    // to stay active until the user quits explicitly with Cmd + Q
    if (process.platform !== "darwin") {
        app.quit();
    }
});

app.on("activate", () => {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (mainWindow === null) {
        createWindow();
    }
});
