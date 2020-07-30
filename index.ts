import { Options } from "./types/options/options";
import { Paths } from "./types/options/options.paths";
import { Servers } from "./types/other/servers";
import { ConfigsObject } from "./types/options/options.configs";
import { existsSync, mkdirSync, writeFileSync } from "fs";
import { config } from "process";


export class Server {
    options: Options;
    servers: Servers = new Servers();

    express: any;
    app: any;

    serverObjects: ConfigsObject = new ConfigsObject();

    public constructor(options?: Options, express?: any) {
        this.options = options ? options : new Options();
        
        //require express or get it from the options object
        if(express){
            this.express = express;
            this.app = express();
        }else{
            this.express = require("express");
            this.app = this.express();
        }

        if(!this.checkFileStructure())
            process.exit();
        console.log("---------------------------------");

        this.loadStructure();
        console.log("---------------------------------");

        this.importControllers();
        console.log("---------------------------------");

        this.importMiddlewares();
        console.log("---------------------------------");

        this.importSql();
        console.log("---------------------------------");

        this.importRoutes();
        console.log("---------------------------------");
    }

    importRoutes = () => {

    }

    importSql = () => {

    }

    importMiddlewares = (config?: any, path?: string) => {
        const getPath = (p : string, ext : string) => {
            const newPath = path!.substring(0, path!.lastIndexOf("/") + 1);
            if(p.startsWith('./')){
                p = newPath + p.substring(2);
            }
            if(ext && !p.endsWith(ext)){
                p += ext;
            }
            return p.replace(/\\/g, "/");
        }

        const importThisMiddleware = () => {
            for(const conf in config){
                if(conf === "other-configs"){
                    if(config[conf]){
                        config[conf].forEach((x : any) => {
                            const newPath = getPath(x, ".json");
                            if(existsSync(newPath)){
                                this.importMiddlewares(require(newPath), newPath);
                            }else{
                                error("config-file: " + newPath + " does not exist (file: " + path ? path! : this.options.paths.configs.middlewares + ")");
                            }
                        });
                    }else{
                        error("the property 'other-configs' has to be an array (file: " + path ? path! : this.options.paths.configs.middlewares + ")");
                    }
                }else{
                    const newPath = getPath(config[conf], ".js");
                    if(existsSync(newPath)){
                        this.serverObjects.middlewares[conf] = require(newPath);
                        log("imported middleware: " + conf + " (file: " + path! + ")");
                    }else{
                        error("middleware-file: " + newPath + " does not exist (file: " + path ? path! : this.options.paths.configs.middlewares + ")");
                    }
                }
            }
        }

        if(!config){
            if(!path){
                config = this.options.configs.middlewares;
                path = this.options.paths.configs.middlewares;
                importThisMiddleware();
            }else{
                config = require(path);
                importThisMiddleware();
            }
        }else if(!path){
            config = this.options.configs.middlewares;
            path = this.options.paths.configs.middlewares;
            importThisMiddleware();
        }else{
            importThisMiddleware();
        }
    }


    importControllers(config?: any, path?: string) : void {
        const getPath = (p : string, ext : string) => {
            const newPath = path!.substring(0, path!.lastIndexOf("/") + 1);
            if(p.startsWith('./')){
                p = newPath + p.substring(2);
            }
            if(ext && !p.endsWith(ext)){
                p += ext;
            }
            return p.replace(/\\/g, "/");
        }

        const importThisController = () => {
            for(const conf in config){
                if(conf === "other-configs"){
                    if(config[conf]){
                        config[conf].forEach((x : any) => {
                            const newPath = getPath(x, ".json");
                            if(existsSync(newPath)){
                                this.importControllers(require(newPath), newPath);
                            }else{
                                error("config-file: " + newPath + " does not exist (file: " + path ? path! : this.options.paths.configs.controllers + ")");
                            }
                        });
                    }else{
                        error("the property 'other-configs' has to be an array (file: " + path ? path! : this.options.paths.configs.controllers + ")");
                    }
                }else{
                    const newPath = getPath(config[conf], ".js");
                    if(existsSync(newPath)){
                        this.serverObjects.controllers[conf] = require(newPath);
                        log("imported controller: " + conf + " (file: " + path! + ")");
                    }else{
                        error("controller-file: " + newPath + " does not exist (file: " + path ? path! : this.options.paths.configs.controllers + ")");
                    }
                }
            }
        }

        if(!config){
            if(!path){
                config = this.options.configs.controllers;
                path = this.options.paths.configs.controllers;
                importThisController();
            }else{
                config = require(path);
                importThisController();
            }
        }else if(!path){
            config = this.options.configs.controllers;
            path = this.options.paths.configs.controllers;
            importThisController();
        }else{
            importThisController();
        }
    }

    loadStructure = () => {
        //require all config files
        this.options.configs.routes = require(this.options.paths.configs.routes);
        this.options.configs.middlewares = require(this.options.paths.configs.middlewares);
        this.options.configs.controllers = require(this.options.paths.configs.controllers);
        this.options.configs.sql.bindings = require(this.options.paths.configs.sql.bindings);
        this.options.configs.sql.loose = require(this.options.paths.configs.sql.loose);
        this.options.configs.sql.handlers = require(this.options.paths.configs.sql.handlers);
        this.options.configs.sql.bases = require(this.options.paths.configs.sql.bases);
        log("first layer of structure has been loaded!");
    }

    checkFileStructure = async () => {
        const dir = (path : any) => {
            if (!existsSync(path)){
                mkdirSync(path);
            }
        }
        
        const file = (path : any, data : any) => {
            let curPath = "";
            if(existsSync(path)){
                return;
            }
            path.split('/').forEach((p : any) => {
                curPath += "/" + p;
                while(curPath.startsWith("/"))
                    curPath = curPath.substring(1);
                
                if(path === curPath){
                    writeFileSync(path, data);
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
        
        if(!existsSync(this.options.paths.configs.routes))
            structureIsMissing++;
    
        if(!existsSync(this.options.paths.configs.controllers))
            structureIsMissing++;
    
        if(!existsSync(this.options.paths.configs.middlewares))
            structureIsMissing++;
    
        if(!existsSync(this.options.paths.configs.sql.bindings))
            structureIsMissing++;
    
        if(!existsSync(this.options.paths.configs.sql.loose))
            structureIsMissing++;
    
        if(!existsSync(this.options.paths.configs.sql.handlers))
            structureIsMissing++;
    
        if(!existsSync(this.options.paths.configs.sql.bases))
            structureIsMissing++;
    
        if(structureIsMissing === 0){
            log("file structure seems to be right.");
            return true;
        }
    
        let questions = [{
            type: 'input',
            name: 'createStruct',
            message: structureIsMissing === 7 ? "do you want to create the base structure for server-serve? (y/n)" : "do you want to fix the base structure for server-serve? (y/n)",
        }];
    
        let createStructure = false;
        let createTestFiles = false;
    
        await inquirer.prompt(questions).then(async (answers : any) => {
            if(answers["createStruct"].toLowerCase() === "y" || answers["createStruct"].toLowerCase() === "yes"){
                createStructure = true;
    
                questions = [{
                    type: 'input',
                    name: 'createWithEverything',
                    message: structureIsMissing === 7 ? "do you want to create the base structure with example files? (y/n)" : "do you want to fix the base structure with example files? (y/n)",
                }];
    
                await inquirer.prompt(questions, (answers : any) => {
                    if(answers['createWithEverything'].toLowerCase() === "y" || answers['createWithEverything'].toLowerCase() === "yes"){
                        createTestFiles = true;
                    }
                });
            }
        });
    
        if(createStructure){
            if(createTestFiles){
                file(this.options.paths.configs.routes, templates.example.routes);
                file(this.options.paths.configs.controllers, templates.example.controllers);
                file(this.options.paths.configs.middlewares, templates.example.middlewares);
                file(this.options.paths.configs.sql.bindings, templates.example.sql.bindings);
                file(this.options.paths.configs.sql.loose, templates.example.sql.loose);
                file(this.options.paths.configs.sql.handlers, templates.example.sql.handlers);
                file(this.options.paths.configs.sql.bases, templates.example.sql.bases);
            }else{
                file(this.options.paths.configs.routes, templates.normal.routes);
                file(this.options.paths.configs.controllers, templates.normal.controllers);
                file(this.options.paths.configs.middlewares, templates.normal.middlewares);
                file(this.options.paths.configs.sql.bindings, templates.normal.sql.bindings);
                file(this.options.paths.configs.sql.loose, templates.normal.sql.loose);
                file(this.options.paths.configs.sql.handlers, templates.normal.sql.handlers);
                file(this.options.paths.configs.sql.bases, templates.normal.sql.bases);
            }
            return true;
        }else{
            return false;
        }
    }
}

function importControllerAlikeConfig(controllerObj : any, config : any, filePath : any, type = ""){
    
}

function importRoutes(configRoutes : any, routePaths : any){

}

function importSql(sqlObj : any, config : any, root : any, paths : any) {
    const getPath = (p : any, root : any, ext : any) => {
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
    
    const bases = (path : string, thisConfig : any) => {
        for(const conf in thisConfig){
            if(conf === "other-configs"){
                if(Array.isArray(thisConfig[conf])){
                    thisConfig[conf].forEach((x : any) => {
                        const p = getPath(x, path, ".json");
                        if(existsSync(p)){
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

function log(message : string){
    console.log("[LOG] " + message);
}

function error(message : string){
    console.log("[ERR] " + message);
}