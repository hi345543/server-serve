export function getPath(path : string, basePath : string, ext? : string){
    if(!path){
        throw "Path is invalid"
    }else if(!basePath){
        throw "unknown error occured"
    }

    let newPath = basePath;
    
    if(newPath.lastIndexOf(".") > newPath.lastIndexOf("/")){
        newPath = newPath!.substring(0, newPath!.lastIndexOf("/") + 1);
    }
    if(path.startsWith('./')){
        path = newPath + path.substring(2);
    }
    if(ext && !path.endsWith(ext)){
        path += ext;
    }
    return path.replace(/\\/g, "/");
}