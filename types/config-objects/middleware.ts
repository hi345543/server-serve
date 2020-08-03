export class Middleware {
    name : string | undefined;
    middleware : string | undefined;
    function : Array<string | object | Array<string | object>> | undefined;
    links: Array<string> | string | undefined;

    IsLink() : boolean { return this.name === "other-configs" && this.links !== undefined; };
    IsMiddleware() : boolean { return this.name !== "other-configs" && this.middleware !== undefined && this.function !== undefined; };

    constructor(middlewareLikeObject : any){
        this.name = middlewareLikeObject.name;
        this.middleware = middlewareLikeObject.middleware;
        this.function = middlewareLikeObject.function;
        this.links = middlewareLikeObject.links;
    }
}