import { Paths } from "./types/options/options.paths";
import express from "express";
import { Options } from "./types/options/options";
import { Server } from "./index";

const paths = new Paths(Paths.projectRoot() + "/../server-serve-structure");
const buildOptions = new Options(paths);

new Server(buildOptions, express);