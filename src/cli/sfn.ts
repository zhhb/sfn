#!/usr/bin/env node
import * as fs from "fs-extra";
import * as path from "path";
import * as cmd from "commander";
import * as trimmer from "string-trimmer";
import pluralize = require("pluralize");
import { sfnd, cwd, ext } from "./init";
import { version, config, APP_PATH, SRC_PATH } from "../init";
import { capitalize, hyphenate } from "capitalization";
import { loadLanguagePack } from "../core/tools/functions-inner";

cmd.version(version)
    .description("create a new controller, model. etc.")
    .option("-c, --controller <name>", "create a new controller with a specified name.")
    .option("-m, --model <name>", "create a new model with a specified name.")
    .option("-l, --language <name>", "create a new language pack with a specified name.")
    .option("-t, --type <type>", "set the type 'http' (default) or 'websocket' when creating a controller.")
    .on("--help", () => {
        console.log("\n\n  Examples:\n");
        console.log("    sfn -c Article                   create an http controller named 'Article'.");
        console.log("    sfn -c ArticleSock -t websocket  create a websocket controller named 'ArticleSock'.")
        console.log("    sfn -m Article                   create a model named 'Article'");
        console.log("    sfn -l zh-CN                     create a language pack named 'zh-CN'.");
        console.log("");
    }).parse(process.argv);

function outputFile(filename: string, data: any, type: string): void {
    var dir = path.dirname(filename);

    if (fs.existsSync(filename)) {
        throw new Error(`${type} already exists.`);
    } else if (!fs.existsSync(dir)) {
        fs.ensureDirSync(dir);
    }

    fs.writeFileSync(filename, data);
    console.log(`${type} '${filename}' created.`);

    process.exit();
}

function lastChar(str: string): string {
    return str[str.length - 1];
}

function checkSource(filename: string): void {
    if (!fs.existsSync(filename))
        throw new Error("Source file is missing.");
}

if (cmd.controller) { // create controller.
    let filename = lastChar(cmd.controller) == "/"
        ? cmd.controller + "index"
        : cmd.controller;
    let type = cmd.type == "websocket" ? "WebSocket" : "Http",
        input = `${sfnd}/src/cli/templates/${type}Controller.${ext}`,
        output = `${cwd}/src/controllers/${filename}.${ext}`;

    checkSource(input);

    let route = hyphenate(cmd.controller, true);
    let contents = fs.readFileSync(input, "utf8").replace(/\{name\}/g, route);

    outputFile(output, contents, "controller");
} else if (cmd.model) { // create model.
    var input = `${sfnd}/src/cli/templates/Model.${ext}`,
        output = `${cwd}/src/models/${cmd.model}.${ext}`,
        ModelName = path.basename(cmd.model),
        table = pluralize(hyphenate(ModelName, true));

    checkSource(input);

    var contents = fs.readFileSync(input, "utf8")
        .replace(/__Model__/g, ModelName)
        .replace(/__table__/g, table);

    outputFile(output, contents, "Model");
} else if (cmd.language) {
    let output: string = `${SRC_PATH}/locales/${cmd.language}.json`;
    let contents: string;
    let lang: any;
    let file1 = `${APP_PATH}/locales/${config.lang}.js`;
    let file2 = `${SRC_PATH}/locales/${config.lang}.json`;
    let file3 = `${SRC_PATH}/locales/${config.lang}.js`;

    if (fs.existsSync(file1)) {
        lang = loadLanguagePack(file1);
    } else if (fs.existsSync(file2)) {
        lang = loadLanguagePack(file2);
    } else if (file3 !== file1 && fs.existsSync(file3)) {
        lang = loadLanguagePack(file3);
    } else {
        lang = {};
    }

    contents = JSON.stringify({}, null, "  ");
    outputFile(output, contents, "Language pack");
} else {
    throw new TypeError("No valid argument was specified.");
}