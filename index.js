const fs = require('fs');

module.exports = {
    express: undefined,
    app: undefined,

    root: (require("app-root-path") + "").replace(/\\/g, "/"),

    paths: {
        configs:{
            routes: "src/routes/config.json",
            controllers: "src/controllers/config.json",
            middlewares: "src/middlewares/config.json",
            sql: {
                bindings: "src/sql/bindings/config.json",
                loose: "src/sql/loose/config.json",
                handlers: "src/sql/handlers/config.json",
                bases: "src/sql/bases/config.json"
            }
        }
    },

    server:{
        http: undefined,
        https: undefined
    },

    configs:{
        routes: {},
        controllers: {},
        middlewares: {},
        sql: {
            bindings: {},
            loose: {},
            handlers: {},
            bases: {}
        }
    },

    routes: {},
    controllers: {},
    middlewares: {},
    sql: {
        bindings: {},
        loose: {},
        handlers: {},
        bases: {},
    },

    build: function(options) { 
        return new Promise(async (resolve, reject) => {
            //require express or get it from the options object
            if(options && options.express && options.app){
                this.express = options.express;
                this.app = options.app;
            }else{
                this.express = require("express");
                this.app = this.express();
            }

            //overwrite paths if options is custom
            if(options && options.paths){
                this.paths = options.paths;
            }

            if(!await checkStructure(this))
                process.exit();

            loadStructure(this);

            importControllerAlikeConfig(this.controllers, this.configs.controllers, this.root + "/" + this.paths.configs.controllers, "controller");
            console.log("---------------------------------");

            importControllerAlikeConfig(this.middlewares, this.configs.middlewares, this.root + "/" + this.paths.configs.middlewares, "middleware");
            console.log("---------------------------------");

            importSql(this.sql, this.configs.sql, this.root, this.paths.configs.sql);

            resolve();
        })
    },

    
};

function loadStructure(serve){
    //require all config files
    serve.configs.routes = require(serve.root + "/" + serve.paths.configs.routes);
    serve.configs.middlewares = require(serve.root + "/" + serve.paths.configs.middlewares);
    serve.configs.controllers = require(serve.root + "/" + serve.paths.configs.controllers);
    serve.configs.sql.bindings = require(serve.root + "/" + serve.paths.configs.sql.bindings);
    serve.configs.sql.loose = require(serve.root + "/" + serve.paths.configs.sql.loose);
    serve.configs.sql.handlers = require(serve.root + "/" + serve.paths.configs.sql.handlers);
    serve.configs.sql.bases = require(serve.root + "/" + serve.paths.configs.sql.bases);
}

async function checkStructure(serve) {
    const dir = (path) => {
        if (!fs.existsSync(path)){
            fs.mkdirSync(path);
        }
    }
    
    const file = (path, data) => {
        let curPath = "";
        if(fs.existsSync(path)){
            return;
        }
        path.split('/').forEach(p => {
            curPath += "/" + p;
            while(curPath.startsWith("/"))
                curPath = curPath.substring(1);
            
            if(path === curPath){
                fs.writeFileSync(path, data);
            }else{
                dir(curPath);
            }
        });
    }

    const templates = {
        example: {
            routes: `{
                "other-configs": []
            }`,
            middlewares:`{
                "other-configs": []
            }`,
            controllers:`{
                "other-configs": []
            }`,
            sql: {
                bindings: `{
                    "other-configs": []
                }`,
                loose: `{
                    "other-configs": []
                }`,
                handlers: `{
                    "other-configs": []
                }`,
                bases: `{
                    "other-configs": []
                }`
            }
        },
        normal: {
            routes: `{
                "other-configs": []
            }`,
            middlewares:`{
                "other-configs": []
            }`,
            controllers:`{
                "other-configs": []
            }`,
            sql: {
                bindings: `{
                    "other-configs": []
                }`,
                loose: `{
                    "other-configs": []
                }`,
                handlers: `{
                    "other-configs": []
                }`,
                bases: `{
                    "other-configs": []
                }`
            }
        }
    }

    const inquirer = require('inquirer');

    let structureIsMissing = 0;

    if(!fs.existsSync(serve.paths.configs.routes))
        structureIsMissing++;

    if(!fs.existsSync(serve.paths.configs.controllers))
        structureIsMissing++;

    if(!fs.existsSync(serve.paths.configs.middlewares))
        structureIsMissing++;

    if(!fs.existsSync(serve.paths.configs.sql.bindings))
        structureIsMissing++;

    if(!fs.existsSync(serve.paths.configs.sql.loose))
        structureIsMissing++;

    if(!fs.existsSync(serve.paths.configs.sql.handlers))
        structureIsMissing++;

    if(!fs.existsSync(serve.paths.configs.sql.bases))
        structureIsMissing++;

    if(structureIsMissing === 0){
        return true;
    }

    let questions = [{
        type: 'input',
        name: 'createStruct',
        message: structureIsMissing === 7 ? "do you want to create the base structure for server-serve? (y/n)" : "do you want to fix the base structure for server-serve? (y/n)",
    }];

    let createStructure = false;
    let createTestFiles = false;

    await inquirer.prompt(questions).then(async answers => {
        if(answers["createStruct"].toLowerCase() === "y" || answers["createStruct"].toLowerCase() === "yes"){
            createStructure = true;

            questions = [{
                type: 'input',
                name: 'createWithEverything',
                message: structureIsMissing === 7 ? "do you want to create the base structure with example files? (y/n)" : "do you want to fix the base structure with example files? (y/n)",
            }];

            await inquirer.prompt(questions, answers => {
                if(answers['createWithEverything'].toLowerCase() === "y" || answers['createWithEverything'].toLowerCase() === "yes"){
                    createTestFiles = true;
                }
            });
        }
    });

    if(createStructure){
        if(createTestFiles){
            file(serve.root + "/" + serve.paths.configs.routes, templates.example.routes);
            file(serve.root + "/" + serve.paths.configs.controllers, templates.example.controllers);
            file(serve.root + "/" + serve.paths.configs.middlewares, templates.example.middlewares);
            file(serve.root + "/" + serve.paths.configs.sql.bindings, templates.example.sql.bindings);
            file(serve.root + "/" + serve.paths.configs.sql.loose, templates.example.sql.loose);
            file(serve.root + "/" + serve.paths.configs.sql.handlers, templates.example.sql.handlers);
            file(serve.root + "/" + serve.paths.configs.sql.bases, templates.example.sql.bases);
        }else{
            file(serve.root + "/" + serve.paths.configs.routes, templates.normal.routes);
            file(serve.root + "/" + serve.paths.configs.controllers, templates.normal.controllers);
            file(serve.root + "/" + serve.paths.configs.middlewares, templates.normal.middlewares);
            file(serve.root + "/" + serve.paths.configs.sql.bindings, templates.normal.sql.bindings);
            file(serve.root + "/" + serve.paths.configs.sql.loose, templates.normal.sql.loose);
            file(serve.root + "/" + serve.paths.configs.sql.handlers, templates.normal.sql.handlers);
            file(serve.root + "/" + serve.paths.configs.sql.bases, templates.normal.sql.bases);
        }
        return true;
    }else{
        return false;
    }
}

function importControllerAlikeConfig(controllerObj, config, filePath, type = ""){
    const getPath = (p, ext) => {
        const path = filePath.substring(0, filePath.lastIndexOf("/") + 1);
        if(p.startsWith('./')){
            p = path + p.substring(2);
        }
        if(ext && !p.endsWith(ext)){
            p += ext;
        }
        return p.replace(/\\/g, "/");
    }
    for(const conf in config){
        if(conf === "other-configs"){
            if(Array.isArray(config[conf])){
                config[conf].forEach(x => {
                    const path = getPath(x, ".json");
                    if(fs.existsSync(path)){
                        importControllerAlikeConfig(controllerObj, require(path), path, type);
                    }else{
                        error("config-file: " + path + " does not exist (file: " + filePath + ")");
                    }
                });
            }else{
                error("the property 'other-configs' has to be an array (file: " + filePath + ")");
            }
        }else{
            const path = getPath(config[conf], ".js");
            if(fs.existsSync(path)){
                controllerObj[conf] = require(path);
                log("imported " + type + ": " + conf + " (file: " + path + ")");
            }else{
                error(type + "-file: " + path + " does not exist (file: " + filePath + ")");
            }
        }

    }
}

function importRoutes(){

}

function importSql(sqlObj, config, root, paths) {
    const getPath = (p, root, ext) => {
        const path = root.substring(0, root.lastIndexOf("/") + 1);
        if(p.startsWith('./')){
            p = path + p.substring(2);
        }
        if(ext && !p.endsWith(ext)){
            p += ext;
        }
        return p.replace(/\\/g, "/");
    }
    
    const bindings = () => {
        
    };
    
    const loose = () => {
        
    };
    
    const handlers = () => {
        
    };
    
    const bases = (path, thisConfig) => {
        for(const conf in thisConfig){
            if(conf === "other-configs"){
                if(Array.isArray(thisConfig[conf])){
                    thisConfig[conf].forEach(x => {
                        const p = getPath(x, path, ".json");
                        if(fs.existsSync(p)){
                            bases(p, require(p));
                        }else{
                            error("config-file: " + p + " does not exist (file: " + path + ")");
                        }
                    });
                }else{
                    error("the property 'other-configs' has to be an array (file: " + path + ")");
                }
            }else{
                sqlObj.bases[conf] = thisConfig[conf];
                log("imported sql-base: " + conf + " (file: " + path + ")");
            }
        }
    };

    bases(root + "/" + paths.bases, config.bases);
}

function log(message){
    console.log("[LOG] " + message);
}

function error(message){
    console.log("[ERR] " + message);
}