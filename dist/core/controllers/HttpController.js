"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const path = require("path");
const fs = require("fs-extra");
const sfn_ejs_engine_1 = require("sfn-ejs-engine");
const SSE = require("sfn-sse");
const init_1 = require("../../init");
const Controller_1 = require("./Controller");
const MarkdownParser_1 = require("../tools/MarkdownParser");
const symbols_1 = require("../tools/symbols");
const Engine = new sfn_ejs_engine_1.EjsEngine();
exports.UploadOptions = {
    maxCount: 1,
    savePath: process.cwd() + "/uploads",
    filter: (file) => file && file.size !== undefined,
    filename: "auto-increment"
};
class HttpController extends Controller_1.Controller {
    constructor(req, res, next = null) {
        super();
        this.Class = this.constructor;
        this.viewPath = this.Class.viewPath;
        this.viewExtname = this.Class.viewExtname;
        this.engine = this.Class.engine;
        this.gzip = true;
        this.jsonp = false;
        this.csrfProtection = false;
        this.cors = false;
        this.uploadConfig = exports.UploadOptions;
        this.authorized = req.user !== null;
        this.req = req;
        this.res = res;
        this.isAsync = next instanceof Function;
        this.lang = (req.query && req.query.lang)
            || (req.cookies && req.cookies.lang)
            || req.lang
            || init_1.config.lang;
    }
    _realFilename(filename) {
        if (!path.isAbsolute(filename))
            filename = `${this.viewPath}/${filename}`;
        return filename;
    }
    view(filename, vars) {
        let ext = path.extname(filename);
        if (ext != this.viewExtname) {
            ext = this.viewExtname;
            filename += ext;
        }
        filename = this._realFilename(filename);
        this.res.type = ext;
        if (!("i18n" in vars)) {
            vars.i18n = function i18n(text, ...replacements) {
                return this.i18n(text, ...replacements);
            };
        }
        return this.engine.renderFile(filename, vars);
    }
    viewMarkdown(filename) {
        if (path.extname(filename) != ".md")
            filename += ".md";
        filename = this._realFilename(filename);
        this.res.type = ".md";
        return MarkdownParser_1.MarkdownParser.parseFile(filename);
    }
    viewRaw(filename) {
        filename = this._realFilename(filename);
        this.res.type = path.extname(filename);
        return fs.readFile(filename, "utf8");
    }
    send(data) {
        return this.res.send(data);
    }
    get db() {
        return this.req.db;
    }
    set db(v) {
        this.req.db = v;
    }
    get session() {
        return this.req.session;
    }
    get user() {
        return this.req.user;
    }
    set user(v) {
        this.req.user = v;
    }
    get sse() {
        if (!this[symbols_1.realSSE]) {
            this[symbols_1.realSSE] = new SSE(this.req, this.res);
        }
        return this[symbols_1.realSSE];
    }
    get isEventSource() {
        return this.req.isEventSource;
    }
    get csrfToken() {
        return this.req.csrfToken;
    }
    static httpErrorView(err, instance) {
        return instance.view(instance.res.code.toString(), { err });
    }
}
HttpController.viewPath = init_1.SRC_PATH + "/views";
HttpController.viewExtname = ".html";
HttpController.engine = Engine;
HttpController.UploadFields = {};
exports.HttpController = HttpController;
//# sourceMappingURL=HttpController.js.map