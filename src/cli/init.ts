/** Initiate the project after SFN is installed. */
import * as path from "path";
import * as fs from "fs-extra";

export var sfnd = path.normalize(__dirname + "/../../");
export var cwd = process.cwd();
var ts = fs.existsSync(cwd + "/tsconfig.json");
export var ext = ts ? "ts" : "js";
let src = ts ? "src" : "dist";

global["APP_PATH"] = cwd + (ts ? "/dist" : "/src");

if (!fs.existsSync(`${cwd}/src`))
    fs.ensureDirSync(`${cwd}/src`);

if (!fs.existsSync(`${cwd}/src/assets`))
    fs.copySync(`${sfnd}/src/assets`, `${cwd}/src/assets`);

let bootstrap = `${cwd}/src/bootstrap`;
if (!fs.existsSync(bootstrap)) {
    fs.ensureDirSync(bootstrap);
    fs.writeFileSync(bootstrap + "/http." + (ts ? "ts" : "js"), "");
    fs.writeFileSync(bootstrap + "/websocket." + (ts ? "ts" : "js"), "");
}

if (!fs.existsSync(`${cwd}/src/controllers`)) {
    let dir = sfnd + "/src/" + (ts ? "controllers" : "cli/templates/controllers");
    fs.copySync(dir, `${cwd}/src/controllers`);
}

if (!fs.existsSync(`${cwd}/src/locales`))
    fs.copySync(`${sfnd}/src/locales`, `${cwd}/src/locales`);

if (!fs.existsSync(`${cwd}/src/views`))
    fs.copySync(`${sfnd}/src/views`, `${cwd}/src/views`);

if (!fs.existsSync(`${cwd}/src/models`))
    fs.ensureDirSync(`${cwd}/src/models`);

if (!fs.existsSync(`${cwd}/src/schedules`))
    fs.ensureDirSync(`${cwd}/src/schedules`);

if (!fs.existsSync(`${cwd}/src/services`))
    fs.ensureDirSync(`${cwd}/src/services`);

if (!fs.existsSync(`${cwd}/src/config.${ext}`))
    fs.copySync(`${sfnd}/src/cli/templates/config.${ext}`, `${cwd}/src/config.${ext}`);

if (!fs.existsSync(`${cwd}/src/index.${ext}`))
    fs.copySync(`${sfnd}/src/cli/templates/index.${ext}`, `${cwd}/src/index.${ext}`);

if (ts && !fs.existsSync(`${cwd}/tsconfig.json`))
    fs.copySync(`${sfnd}/src/cli/templates/tsconfig.json`, `${cwd}/tsconfig.json`);