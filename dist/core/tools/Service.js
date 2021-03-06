"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const util = require("util");
const events_1 = require("events");
const Cache = require("sfn-cache");
const Logger = require("sfn-logger");
const modelar_1 = require("modelar");
const HideProtectedProperties = require("hide-protected-properties");
const init_1 = require("../../init");
const LocaleMap_1 = require("./LocaleMap");
const symbols_1 = require("./symbols");
exports.LogOptions = {
    ttl: 1000,
    size: 0,
    filename: process.cwd() + "/logs/sfn.log",
    fileSize: 1024 * 1024 * 2,
    mail: null,
    action: "default"
};
let Service = Service_1 = class Service extends events_1.EventEmitter {
    constructor() {
        super(...arguments);
        this.lang = init_1.config.lang;
        this.logConfig = Object.assign(exports.LogOptions, {
            action: this.constructor.name
        });
    }
    i18n(text, ...replacements) {
        var locale = LocaleMap_1.LocaleMap, lang = this.lang.toLowerCase(), _lang = init_1.config.lang.toLowerCase();
        if (locale[lang] && locale[lang][text]) {
            text = locale[lang][text];
        }
        else if (locale[_lang] && locale[_lang][text]) {
            text = locale[_lang][text];
        }
        return util.format(text, ...replacements);
    }
    get logger() {
        let filename = this.logConfig.filename;
        if (!Service_1.Loggers[filename]) {
            Service_1.Loggers[filename] = new Logger(this.logConfig);
        }
        Service_1.Loggers[filename].action = this.logConfig.action;
        return Service_1.Loggers[filename];
    }
    get cache() {
        if (!this[symbols_1.realCache]) {
            this[symbols_1.realCache] = new Cache(init_1.config.redis);
        }
        return this[symbols_1.realCache];
    }
    set cache(v) {
        this[symbols_1.realCache] = v;
    }
    get db() {
        if (!this[symbols_1.realDB]) {
            this[symbols_1.realDB] = new modelar_1.DB(init_1.config.database);
        }
        return this[symbols_1.realDB];
    }
    set db(v) {
        this[symbols_1.realDB] = v;
    }
};
Service.Loggers = {};
Service = Service_1 = tslib_1.__decorate([
    HideProtectedProperties
], Service);
exports.Service = Service;
var Service_1;
//# sourceMappingURL=Service.js.map