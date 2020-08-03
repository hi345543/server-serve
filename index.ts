import { Options } from "./types/options/options";
import { Paths } from "./types/options/options.paths";
import { Servers } from "./types/other/servers";
import { ConfigsObject } from "./types/options/options.configs";
import { existsSync, mkdirSync, writeFileSync } from "fs";
import { config } from "process";

import { getPath } from "./helper";

import { Middleware } from "./types/config-objects/middleware";
import { stringify } from "querystring";

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
    }

    public build() : void {
        log("building server...");
        console.log("---------------------------------");
        this.buildRoutes();
        console.log("---------------------------------");
    }

    private buildRoutes = () => {
        
    }

    private importSql = () => {

    }

    private importMiddlewares = (config?: Array<Middleware>, path?: string) => {
        const importThisMiddleware = () => {
            for(const confTemp of config!){
                const conf = new Middleware(confTemp);
                if(conf.IsLink()){
                    if(conf.links){
                        let links : Array<string> = [];
                        if(typeof(conf.links) === typeof(String)){
                            links.push(conf.links.toString());
                        }else if(Array.isArray(conf.links)){
                            links = conf.links;
                        }else{
                            continue;
                        }
                        for (const link of links){
                            const newPath = getPath(link, path!, ".json");
                            if(existsSync(newPath)){
                                this.importMiddlewares(require(newPath), newPath);
                            }else{
                                error("config-file: " + newPath + " does not exist (file: " + path ? path! : this.options.paths.configs.middlewares + ")");
                            }
                        }
                    }else{
                        error("the property 'other-configs' has to be an array (file: " + path ? path! : this.options.paths.configs.middlewares + ")");
                    }
                }else if(conf.IsMiddleware()){
                    const newPath : string = getPath(conf.middleware!, path!, ".js");
                    if(existsSync(newPath)){
                        this.serverObjects.middlewares[conf.name!] = require(newPath);
                        log("imported middleware: " + conf.name + " (file: " + path! + ")");
                    }else{
                        error("middleware-file: " + newPath + " does not exist (file: " + path ? path! : this.options.paths.configs.middlewares + ")");
                    }
                }else{
                    error("An object inside file: " + path + " is neither a middleware nor a link to other configs");
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


    private importControllers(config?: any, path?: string) : void {
        const importThisController = () => {
            for(const conf in config){
                if(conf === "other-configs"){
                    if(config[conf]){
                        config[conf].forEach((x : any) => {
                            const newPath = getPath(x, path!, ".json");
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
                    const newPath = getPath(config[conf], path!, ".js");
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

    private loadStructure = () => {
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

    private checkFileStructure = async () => {
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

function log(message : string){
    console.log("[LOG] " + message);
}

function error(message : string){
    console.log("[ERR] " + message);
}