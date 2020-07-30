import { Express } from "express";
import { Paths } from "./options.paths";
import { Servers } from "../other/servers";
import { ConfigsObject } from "./options.configs";

export class Options {
    paths: Paths;
    configs: ConfigsObject = new ConfigsObject();
    
    constructor(paths?: Paths) {
        if(paths){
            this.paths = paths;
        }else{
            this.paths = new Paths();
        }
    }
}