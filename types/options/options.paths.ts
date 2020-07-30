
let rootPath = (require("app-root-path") + "").replace(/\\/g, "/");

export class Paths {
    public static projectRoot = () => rootPath;
    configs = {
        routes: "src/routes/config.json",
        controllers: "src/controllers/config.json",
        middlewares: "src/middlewares/config.json",
        sql: {
            bindings: "src/sql/bindings/config.json",
            loose: "src/sql/loose/config.json",
            handlers: "src/sql/handlers/config.json",
            bases: "src/sql/bases/config.json"
        }
    };

    constructor(root?: string){
        if(root){
            if(root[0] === '.'){
                throw "the root path has to be absolute";
            }
            rootPath = root;
        }
        
        if(rootPath.lastIndexOf("/") + 1 !== rootPath.length){
            rootPath += "/";
        }
        this.configs.routes = rootPath + this.configs.routes;
        this.configs.controllers = rootPath + this.configs.controllers;
        this.configs.middlewares = rootPath + this.configs.middlewares;
        this.configs.sql.bindings = rootPath + this.configs.sql.bindings;
        this.configs.sql.bases = rootPath + this.configs.sql.bases;
        this.configs.sql.handlers = rootPath + this.configs.sql.handlers;
        this.configs.sql.loose = rootPath + this.configs.sql.loose;
    }
}