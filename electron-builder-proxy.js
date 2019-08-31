// Build script. electron-builder allows no way to customize the artifact name based on the build target, and this
// results in different build targets which end in the same extension to overwrite the previous build file. Since I'd
// like to provide both portable and nsis windows builds, I need a fix for this. This build script provides this fix.

const {
    archFromString,
    build,
    Platform
} = require('electron-builder');

// **** START CONFIG **** //

const files = [
    "dist/**/*",
    "index.html"
];

const config = {
    appId: "your.app.id",
    productName: "product_name",
    copyright: "Copyright © 2019 Your Name",
    directories: {
        buildResources: "build_assets",
        output: "build"
    }
};

// **** END CONFIG **** //

const hasArg = s => process.argv.includes(s, 2);
const argIndex = s => process.argv.indexOf(s, 2);

const publish = hasArg("--publish");
if (publish) {
    config.publish = "onTagOrDraft";
}

const archs = [];
if (hasArg("-a")) {
    var archsStrs = process.argv[argIndex("-a") + 1].split(",");
    archsStrs.forEach(s => archs.push(archFromString(s)));
}

const twIndex = argIndex("-t:w");
const tmIndex = argIndex("-t:m");
const tlIndex = argIndex("-t:l");

if (twIndex === -1 && tmIndex === -1 && tlIndex === -1) {
    console.error("Must include at least one of -t:w, -t:m, or -t:l.");
    process.exit(1);
}

startBuilds(twIndex, "win", Platform.WINDOWS);
startBuilds(tmIndex, "mac", Platform.MAC);
startBuilds(tlIndex, "linux", Platform.LINUX);

async function startBuilds(flagIndex, platformName, platform) {
    if (flagIndex === -1) return;
    config[platformName] = {
        files
    };
    if (publish) config[platformName].publish = "github";
    var targets = process.argv[flagIndex + 1].split(",");
    for (var target of targets) {
        config[platformName].artifactName = `\${productName}-\${os}-\${arch}-${target}.\${ext}`;
        config[platformName].target = target;
        await build({
            // we have to recreate the target for each build, as the build process modifies it.
            targets: platform.createTarget(undefined, ...archs),
            config
        });
    }
}
