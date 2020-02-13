import libHelper = require("Core/library");
import { IoC } from "Env/Env";

type Module = unknown;
let cache: Record<string, Promise<Module>> = {};
interface IParsedName {
    name: string
    path: string[]
}

class ModuleLoader {
    /**
     * requirejs.defined работает не корректно. Возвращает true, хотя callback в defined(name, callback) ещё не был вызван.
     */
    private asyncLoadedModules: Record<string, boolean> = {};

    private getFromLib(lib: Module, parsedName: IParsedName): Module {
        let mod = lib;
        let processed = [];
        parsedName.path.forEach(function (property) {
            processed.push(property);
            if (mod && typeof mod === 'object' && property in mod) {
                mod = mod[property];
            } else {
                IoC.resolve("ILogger").error("Async module loading error",
                    'Cannot find module "' + processed.join('.')
                    + '" in library "' + parsedName.name + '".');
            }
        });
        return mod;
    };

    public loadAsync(name: string): Promise<Module> {
        if (this.isLoaded(name)) {
            return Promise.resolve(this.loadSync(name));
        }

        let parsedInfo: IParsedName = libHelper.parse(name);
        var loadFromModule = (res) => {
            return this.getFromLib(res, parsedInfo);
        };
        if (this.isCached(parsedInfo.name)) {
            return cache[parsedInfo.name].then(loadFromModule);
        }

        let promiseResult = this.requireAsync(parsedInfo.name);
        cache[parsedInfo.name] = promiseResult = promiseResult.then((res) => {
            delete cache[parsedInfo.name];
            this.asyncLoadedModules[parsedInfo.name] = true;
            return res;
        }, (e) => {
            delete cache[parsedInfo.name];
            let errorMessage = "Couldn't load module " + parsedInfo.name;
            IoC.resolve("ILogger").error(errorMessage, e);
            throw new Error(errorMessage);
        });

        return promiseResult.then(loadFromModule);
    };

    public loadSync(name: string): Module {
        let parsedInfo = libHelper.parse(name);
        try {
            var loaded = this.requireSync(parsedInfo.name);
        } catch(e) {
            IoC.resolve("ILogger").error("Couldn't load module " + parsedInfo.name, e);
            return null;
        }
        if (!loaded) {
            return null;
        }
        this.asyncLoadedModules
        return this.getFromLib(loaded, parsedInfo);
    };

    /**
     * Делаю проверку, что загруженный модуль имеет тип функции, т.к. может быть require уже реально загрузил.
     * Текущее решение, нужно для случая, когда модуль реально возвращает пустой объект, и нужно
     *   вернуть ответ, что модуль загружен.
     * @param name имя модуля
     */
    private isLoaded(name: string): boolean {
        let parsedInfo: IParsedName = libHelper.parse(name);
        if (!!this.asyncLoadedModules[parsedInfo.name]) {
            return true;
        }
        let module = require(parsedInfo.name);
        if (!module) {
            return false;
        }
        if (module instanceof Function || Object.keys(module).length > 0) {
            this.asyncLoadedModules[parsedInfo.name] = true;
            return true;
        };
        return false;
    };

    private isCached(name: string): boolean {
        return !!cache[name];
    }

    private requireSync(name: string): Module {
        return require(name);
    };

    private requireAsync(name): Promise<any> {
        return new Promise((resolve, reject) => {
            require([name], resolve, reject);
        });
    };

    public clearCache(): void {
        cache = {};
    }
}

export = ModuleLoader;