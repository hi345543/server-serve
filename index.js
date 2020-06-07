module.exports = {
    express: undefined,
    app: undefined,

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
        http,
        https
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
            this.configs.routes = require(paths.configs.routes);
            this.configs.middlewares = require(paths.configs.middlewares);
            this.configs.controllers = require(paths.configs.controllers);
            this.configs.sql.bindings = require(paths.configs.sql.bindings);
            this.configs.sql.loose = require(paths.configs.sql.loose);
            this.configs.sql.handlers = require(paths.configs.sql.handlers);

            

            resolve();
        })
    },
};
