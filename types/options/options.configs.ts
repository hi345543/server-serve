export class ConfigsObject {
    routes: any;
    controllers: any;
    middlewares: any;
    sql: {
        bindings: any;
        loose: any;
        handlers: any;
        bases: any;
    };

    constructor() {
        this.routes = {};
        this.controllers = {};
        this.middlewares = {};
        this.sql = {
            bindings: {},
            loose: {},
            handlers: {},
            bases: {}
        }
    }
}