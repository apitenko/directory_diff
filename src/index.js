


const { resolve } = require('path');
const fs = require('fs').promises;
const { constants } = require('fs');

// const dir1 = process.argv[2] + '\\';
// const dir2 = process.argv[3] + '\\'

const dir1 = "F:\\";
const dir2 = "C:\\data\\f";

console.log(`Comparing
source - ${dir1}
dest - ${dir2}`);

process.on('unhandledRejection', error => {
    // Will print "unhandledRejection err is not defined"
    console.log('unhandledRejection', error.message);
});

async function walk(currentDir, cbFinal) {
    try {

        const pathsInCurrentDir = await fs.readdir(currentDir);

        if (pathsInCurrentDir.length === 0) {
            await cbFinal(currentDir, "empty folder: ");
        }
        else {

            for (const path of pathsInCurrentDir) {
                await (async () => {
                    const newPath = resolve(currentDir, path);
                    const stat = await fs.stat(newPath);
                    if (stat.isDirectory()) {

                        pathsToWalk.push(newPath);

                    }
                    else {
                        await cbFinal(newPath);
                    }
                })();
            }
        }
    }
    catch (e) {
        console.log(e);
    }
}

async function checkFileExists(file) {
    return fs.access(file, constants.F_OK)
        .then(() => true)
        .catch(() => false)
}

async function callbackFinal(partialFilename, additive = '') {
    const trimmedFilename = partialFilename.replace(dir1, '');
    const currentFilename = resolve(dir2, trimmedFilename);

    if ((!await checkFileExists(currentFilename)) && (!trimmedFilename.startsWith('\\Pictures'))) {
        console.log(additive + trimmedFilename);
    }
}


const pathsToWalk = [];

const MAX_JOBS = 20;

async function job() {
    while (pathsToWalk.length > 0) {
        let currentPathsToWalk = pathsToWalk.splice(0, MAX_JOBS);
        currentPathsToWalk = currentPathsToWalk.map(item => walk(item, callbackFinal));
        await Promise.all(currentPathsToWalk);
    }
}

(async () => {

    pathsToWalk.push(dir1);
    await job();
    console.log('DONE');
})();