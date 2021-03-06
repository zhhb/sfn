"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const path = require("path");
const fs = require("fs-extra");
exports.sfnd = path.normalize(__dirname + "/../../");
exports.cwd = process.cwd();
var ts = fs.existsSync(exports.cwd + "/tsconfig.json");
exports.ext = ts ? "ts" : "js";
let src = ts ? "src" : "dist";
global["APP_PATH"] = exports.cwd + (ts ? "/dist" : "/src");
if (!fs.existsSync(`${exports.cwd}/src`))
    fs.ensureDirSync(`${exports.cwd}/src`);
if (!fs.existsSync(`${exports.cwd}/src/assets`))
    fs.copySync(`${exports.sfnd}/src/assets`, `${exports.cwd}/src/assets`);
let bootstrap = `${exports.cwd}/src/bootstrap`;
if (!fs.existsSync(bootstrap)) {
    fs.ensureDirSync(bootstrap);
    fs.writeFileSync(bootstrap + "/http." + (ts ? "ts" : "js"), "");
    fs.writeFileSync(bootstrap + "/websocket." + (ts ? "ts" : "js"), "");
}
if (!fs.existsSync(`${exports.cwd}/src/controllers`)) {
    let dir = exports.sfnd + "/src/" + (ts ? "controllers" : "cli/templates/controllers");
    fs.copySync(dir, `${exports.cwd}/src/controllers`);
}
if (!fs.existsSync(`${exports.cwd}/src/locales`))
    fs.copySync(`${exports.sfnd}/src/locales`, `${exports.cwd}/src/locales`);
if (!fs.existsSync(`${exports.cwd}/src/views`))
    fs.copySync(`${exports.sfnd}/src/views`, `${exports.cwd}/src/views`);
if (!fs.existsSync(`${exports.cwd}/src/models`))
    fs.ensureDirSync(`${exports.cwd}/src/models`);
if (!fs.existsSync(`${exports.cwd}/src/schedules`))
    fs.ensureDirSync(`${exports.cwd}/src/schedules`);
if (!fs.existsSync(`${exports.cwd}/src/services`))
    fs.ensureDirSync(`${exports.cwd}/src/services`);
if (!fs.existsSync(`${exports.cwd}/src/config.${exports.ext}`))
    fs.copySync(`${exports.sfnd}/src/cli/templates/config.${exports.ext}`, `${exports.cwd}/src/config.${exports.ext}`);
if (!fs.existsSync(`${exports.cwd}/src/index.${exports.ext}`))
    fs.copySync(`${exports.sfnd}/src/cli/templates/index.${exports.ext}`, `${exports.cwd}/src/index.${exports.ext}`);
if (ts && !fs.existsSync(`${exports.cwd}/tsconfig.json`))
    fs.copySync(`${exports.sfnd}/src/cli/templates/tsconfig.json`, `${exports.cwd}/tsconfig.json`);
//# sourceMappingURL=init.js.map