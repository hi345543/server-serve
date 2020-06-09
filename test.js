const serve = require('./index.js');

serve.paths.configs.sql.bindings = "../server-serve-structure/" + serve.paths.configs.sql.bindings;
serve.paths.configs.sql.handlers = "../server-serve-structure/" + serve.paths.configs.sql.handlers;
serve.paths.configs.sql.loose = "../server-serve-structure/" + serve.paths.configs.sql.loose;
serve.paths.configs.middlewares = "../server-serve-structure/" + serve.paths.configs.middlewares;
serve.paths.configs.routes = "../server-serve-structure/" + serve.paths.configs.routes;
serve.paths.configs.controllers = "../server-serve-structure/" + serve.paths.configs.controllers;

serve.build();