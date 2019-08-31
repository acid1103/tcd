import { remote, shell } from "electron";
import fs = require("fs");
import $ = require("jquery");
import { getTwitchComments } from "./download";

export default () => {
    // the api key twitch uses for the web client.
    const TWITCH_WEB_API_KEY = "jzkbprff40iqj646a697cyrvl0zt2m6";
    const dialog = remote.dialog;
    const remoteWindow = remote.getCurrentWindow();

    // wait until the DOM has been fully loaded. then call init
    const readyStateCheckInterval = setInterval(() => {
        if (document.readyState === "complete") {
            clearInterval(readyStateCheckInterval);
            init();
        }
    }, 10);

    function init() {
        const windowClose = $("#windowClose");
        const windowMinimize = $("#windowMinimize");
        const vIdInput = $("#vid");
        const dlButton = $("#dl");

        windowClose.click(() => remoteWindow.close());

        windowMinimize.click(() => {
            remoteWindow.minimize();
        });

        vIdInput.keyup((e) => { if (e.key === "Enter") { download(); } });
        dlButton.click(() => download());
    }

    let downloading = false;
    async function download() {
        if (downloading) { return; }
        startDownloading();
        const result = await dialog.showSaveDialog(remoteWindow, {
            filters: [{
                extensions: ["json"],
                name: "JSON",
            }],
            securityScopedBookmarks: false,
        });

        if (result.canceled) { finishDownloading(); return; }

        // escape the video id to prevent any oddities
        const vId = escape(String($("#vid").val()));
        let data: any;
        try {
            let updateCount = 0;
            data = await getTwitchComments(vId, TWITCH_WEB_API_KEY,
                () => updateDownloadProgress(++updateCount));
            fs.writeFile(result.filePath, JSON.stringify(data, null, 2), (e) => {
                finishDownloading();
                if (e) { flashError(); } else { flashSuccess(); }
            });
        } catch (e) {
            finishDownloading();
            fs.writeFile(result.filePath, JSON.stringify(e, null, 2), () => { /* */ });
            flashError();
        }
    }

    function startDownloading() {
        downloading = true;
        $("#vid").attr("disabled", "");
        $("#dl").attr("disabled", "");
    }

    function finishDownloading() {
        downloading = false;
        updateDownloadProgress(0);
        $("#vid").removeAttr("disabled");
        $("#dl").removeAttr("disabled");
    }

    function updateDownloadProgress(updateCount: number) {
        if (updateCount === 0) {
            $("#progress").css({ opacity: 0 });
            // i believe jquery keeps an animation queue internally, so in order to set the width back to 0, we have to
            // animate it, rather than simply setting it to 0 with jquery.css()
            $("#progress").animate({ width: `0%` }, 0);
        } else {
            $("#progress").css({ opacity: 1 });
            const width = 1 - Math.pow(0.95, Math.pow(updateCount, 1.5) / 5);
            $("#progress").animate({ width: `${width * 100}%` }, 100);
        }
    }

    function flashError() {
        $("#error").addClass("flash");
        setTimeout(() => $("#error").removeClass("flash"), 500);
    }

    function flashSuccess() {
        $("#success").addClass("flash");
        setTimeout(() => $("#success").removeClass("flash"), 500);
    }
};
