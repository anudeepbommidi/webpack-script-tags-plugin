const fs = require('fs');
const EOL = require("os").EOL;
const path = require('path');
const { RawSource } = require("webpack-sources");
const validateOptions = require('schema-utils');
const schema = require('./schema.json');

const SCRIPTS_START = '<!-- webpack scripts: START -->';
const SCRIPTS_END = '<!-- webpack scripts: END -->';
const LOC_REGEX = new RegExp(`${SCRIPTS_START}([\\d\\D]*)${SCRIPTS_END}`,'i');

class WebpackScriptTagsPlugin {
    constructor(config = {}) {
        validateOptions(schema, config, "WebpackScriptTagsPlugin");
        this.chunkVersions = {};
        this.config = config;
        this.publicPath = '';
        this.rootPath = '';
    }

    apply(compiler) {
        compiler.hooks.emit.tapAsync('WebpackScriptTagsPlugin', (compilation, callback) => {
            const changedChunks = compilation.chunks.filter((chunk) => {
                var oldVersion = this.chunkVersions[chunk.name];
                this.chunkVersions[chunk.name] = chunk.hash;
                return chunk.hash !== oldVersion;
            });
            if (!changedChunks.length) {
                return;
            }

            this.publicPath = compilation.options.output.publicPath.split('/').filter(x => x).join('/');
            this.rootPath = compilation.options.context;

            const allChunks = this.getAllChunks(compilation);
            const assetKeys = Object.keys(compilation.assets);
            if (compilation.options.mode === 'production') {
                this.setContent();
                Object.keys(this.config)
                    .forEach((key) => {
                        this.processScripts(this.config[key], allChunks);
                    });
            } else {
                Object.keys(this.config)
                .forEach((key) => {
                    const assetKey = this.findAsset(assetKeys, this.config[key].filePath);
                    if (assetKey) {
                        const fileContent = compilation.assets[assetKey]._value.toString('utf8');
                        const matchMeta = this.getMatchMeta(fileContent);
                        const source = new RawSource(
                            this.addScriptsToFile(this.config[key], fileContent, matchMeta, allChunks),
                        );
                        compilation.updateAsset(assetKey, source, source.size());
                    }
                });
            }
            callback();
        });
    }

    getAllChunks(compilation) {
        // flatten the chunks, filter duplicates(if any), convert to array, reverse and return
        return [...compilation.chunks.reduce((set, chunk) => {
            chunk.files.forEach(set.add, set);
            return set;
        }, new Set())].reverse();
    }

    findAsset(assetKeys, path) {
        const pathRegex = new RegExp(path+'$');
        return assetKeys.find(key => pathRegex.test(key));
    }

    addScriptsToFile(config, content, matchMeta, chunks) {
        let scripts = SCRIPTS_START + EOL;
        chunks.forEach((chunk) => {
            const script = config.scripts.find(script => script.test.test(chunk));
            if (script) {
                scripts = scripts.concat(this.generateScriptTag(chunk, config, script)).concat(EOL);
            }
        });
        scripts += SCRIPTS_END;
        return content.replace(matchMeta[0], scripts);
    }

    setContent() {
        Object.keys(this.config)
            .forEach((key) => {
                this.config[key].fileContent = this.getFileContent(this.config[key].filePath);
                this.config[key].matchMeta = this.getMatchMeta(this.config[key].fileContent);
            });
    }

    getMatchMeta(content) {
        const matchMeta = content.match(LOC_REGEX);
        if (matchMeta === null) {
            throw new Error(`Expected to find comments: ${SCRIPTS_START}...${SCRIPTS_END}`);
        }
        return matchMeta;
    }

    processScripts(config, chunks) {
        let scripts = SCRIPTS_START + EOL;
        chunks.forEach((chunk) => {
            const script = config.scripts.find(script => chunk.match(script.test) !== null);
            if (script) {
                scripts = scripts.concat(this.generateScriptTag(chunk, config, script)).concat(EOL);
            }
        });
        scripts += SCRIPTS_END;
        const content = config.fileContent.replace(config.matchMeta[0], scripts);
        fs.writeFileSync(path.join(this.rootPath, config.filePath), content);
    }

    getFileContent(filePath) {
        return fs.readFileSync(path.join(this.rootPath, filePath), 'utf8');
    }

    generateScriptTag(chunk, config, scriptMeta) {
        const contextPath = config.useContextVar;
        let src = contextPath ? `<%=${contextPath}%>/` : '';
        src += `${this.publicPath}/${chunk}`;
        return `<script ${scriptMeta.attrs ? ` ${scriptMeta.attrs} ` : ' '}src="${src}" charset="utf-8"></script>`;
    }
}

module.exports = WebpackScriptTagsPlugin;