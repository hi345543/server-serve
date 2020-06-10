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
                handlers: "src/sql/handlers/config.json"
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
            handlers: {}
        }
    },

    routes: {},
    controllers: {},
    middlewares: {},
    sql: {
        bindings: {},
        loose: {},
        handlers: {}
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

            readControllerConfig(this.controllers, this.configs.controllers);

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
            routes: `{}`,
            middlewares:`{}`,
            controllers:`{}`,
            sql: {
                bindings: `{}`,
                loose: `{}`,
                handlers: `{}`
            }
        },
        normal: {
            routes: `{}`,
            middlewares:`{}`,
            controllers:`{}`,
            sql: {
                bindings: `{}`,
                loose: `{}`,
                handlers: `{}`
            }
        }
    }

    const inquirer = require('inquirer');

    let structureIsMissing = false;

    if(!fs.existsSync(serve.paths.configs.routes))
        structureIsMissing = true;

    if(!fs.existsSync(serve.paths.configs.controllers))
        structureIsMissing = true;

    if(!fs.existsSync(serve.paths.configs.middlewares))
        structureIsMissing = true;

    if(!fs.existsSync(serve.paths.configs.sql.bindings))
        structureIsMissing = true;

    if(!fs.existsSync(serve.paths.configs.sql.loose))
        structureIsMissing = true;

    if(!fs.existsSync(serve.paths.configs.sql.handlers))
        structureIsMissing = true;

    if(!structureIsMissing){
        return true;
    }

    let questions = [{
        type: 'input',
        name: 'createStruct',
        message: "do you want to create the base structure for server-serve? (y/n)",
    }];

    let createStructure = false;
    let createTestFiles = false;

    await inquirer.prompt(questions).then(async answers => {
        if(answers["createStruct"].toLowerCase() === "y" || answers["createStruct"].toLowerCase() === "yes"){
            createStructure = true;

            questions = [{
                type: 'input',
                name: 'createWithEverything',
                message: "do you want to create the base structure with example files? (y/n)",
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
        }else{
            file(serve.root + "/" + serve.paths.configs.routes, templates.normal.routes);
            file(serve.root + "/" + serve.paths.configs.controllers, templates.normal.controllers);
            file(serve.root + "/" + serve.paths.configs.middlewares, templates.normal.middlewares);
            file(serve.root + "/" + serve.paths.configs.sql.bindings, templates.normal.sql.bindings);
            file(serve.root + "/" + serve.paths.configs.sql.loose, templates.normal.sql.loose);
            file(serve.root + "/" + serve.paths.configs.sql.handlers, templates.normal.sql.handlers);
        }
        return true;
    }else{
        return false;
    }
}

function readControllerConfig(controllerObj, config) {

}