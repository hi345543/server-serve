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
        return new Promise((resolve, reject) => {
            checkStructure();

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

            //require all config files
            this.configs.routes = require(this.root + "/" + this.paths.configs.routes);
            this.configs.middlewares = require(this.root + "/" + this.paths.configs.middlewares);
            this.configs.controllers = require(this.root + "/" + this.paths.configs.controllers);
            this.configs.sql.bindings = require(this.root + "/" + this.paths.configs.sql.bindings);
            this.configs.sql.loose = require(this.root + "/" + this.paths.configs.sql.loose);
            this.configs.sql.handlers = require(this.root + "/" + this.paths.configs.sql.handlers);

            readControllerConfig(this.controllers, this.configs.controllers);

            resolve();
        })
    },
};

async function checkStructure() {
    const dir = (path) => {
        if (!fs.existsSync(path)){
            fs.mkdirSync(path);
        }
    }
    
    const file = (path, data) => {
        if(!fs.existsSync(path)){
            fs.writeFileSync(path, data);
        }
    }

    const templates = {
        routes: `{}`,
        middlewares:`{}`,
        controllers:`{}`,
        sql: {
            bindings: `{}`,
            loose: `{}`,
            handlers: `{}`
        }
    }

    if(fs.existsSync("./checked.info"))
        return true;

    const inquirer = require('inquirer')

    const questions = [{
        type: 'input',
        name: 'createStruct',
        message: "do you want to create the base structure for server-serve? (y/n)",
    }]
    
    await inquirer.prompt(questions).then(answers => {
        if(answers["createStruct"].toLowerCase() === "y" || answers["createStruct"].toLowerCase() === "yes"){
            console.log("b");
        }
    })
    console.log("abc");
    return true;
}

function readControllerConfig(controllerObj, config) {

}