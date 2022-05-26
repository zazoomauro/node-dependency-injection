// Only for typings exports

export type PassConfigHook = 'beforeOptimization' | 'optimize' | 'beforeRemoving' | 'remove' | 'afterRemoving';

export type Parameter = string | boolean | object | any[];

export type Argument = TagReference | Reference | PackageReference | any;

export interface Extension {
    load: Function;
}

export interface Logger {
    warn(message?: any, ...optionalParams: any[]): void;
}

export interface CompilerPass {
    process(container: ContainerBuilder): Promise<void>;
}

export interface Factory {
    Object: Object | Reference;
    method: string;
}

export interface Call {
    method: string;
    args: Argument[];
}

export interface Tag {
    name: string;
    attributes: Map<any, any>;
}

export class InstanceManager {
    constructor(containerBuilder: ContainerBuilder, definitions: Map<string, Definition>, alias: Map<string, string>);

    getInstance(id: any, bypassPublic?: boolean): any;

    getInstanceFromDefinition(definition: Definition): any;
}

// Package exports
export class ContainerBuilder {
    readonly defaultDir: string;
    readonly containerReferenceAsService: boolean;
    readonly definitions: Map<string, Definition>;
    readonly instanceManager: InstanceManager;
    readonly extensions: Extension[];
    readonly services: Map<string, any>;
    frozen: boolean;
    logger: Logger;

    constructor(containerReferenceAsService?: boolean, defaultDir?: string | null);

    addCompilerPass(compilerPass: any, type?: PassConfigHook, priority?: number): void;

    compile(): Promise<void>;

    findDefinition(key: string): Promise<Definition>;

    findTaggedServiceIds(name: string): Iterable<{id: string, definition: Definition}>;

    get<T = any>(id: string|any): T;

    getDefinition(key: string): Definition;

    getParameter<T extends Parameter>(key: string): T;

    has(key: string): boolean;

    hasDefinition(key: string): boolean;

    hasParameter(key: string): boolean;

    isSet(id: string): boolean;

    register(id: string, object?: any, args?: Argument[]): Definition;

    registerExtension(extension: Extension): void;

    remove(id: string): void;

    removeDefinition(key: string): boolean;

    set(id: string, instance: any): void;

    setAlias(alias: string, id: string): void;

    setDefinition(id: string, definition: Definition): Definition;

    setParameter(key: string, value: Parameter): void;

}

export class Definition {
    Object: any
    args: Argument[];
    appendArgs: Argument[];
    public: boolean;
    deprecated: string;
    lazy: boolean;
    decoratedService: string;
    decorationPriority: number;
    synthetic: boolean;
    shared: boolean;
    abstract: boolean;
    parent: string;
    readonly factory: Factory | null;
    readonly calls: Call[];
    readonly tags: Tag[];
    readonly properties: Map<string, any>;

    constructor(object?: any, args?: Argument[]);

    addArgument(argument: Argument): Definition;

    addMethodCall(method: string, args: any[]): Definition;

    addProperty(key: string, value: any): Definition;

    addTag(name: string, attributes?: Map<any, any>): Definition;

    isPublic(bypassPublic?: boolean): boolean;

    setFactory(Object: Reference | Object, method: string): void;

}

export class PackageReference {
    readonly id: string;

    constructor(id: string);
}

export class Reference {
    readonly id: string;
    readonly nullable: boolean;

    constructor(id: string, nullable?: boolean);
}

export class TagReference {
    readonly name: string;

    constructor(name: string);
}

export class PassConfig {
    static readonly TYPE_BEFORE_OPTIMIZATION: PassConfigHook;
    static readonly TYPE_OPTIMIZE: PassConfigHook;
    static readonly TYPE_BEFORE_REMOVING: PassConfigHook;
    static readonly TYPE_REMOVE: PassConfigHook;
    static readonly TYPE_AFTER_REMOVING: PassConfigHook;

    static isValidType(type: string): boolean;
}

export class FileLoader {
    constructor(container: ContainerBuilder);

    load(file: string | null): Promise<void>;
}

export class YamlFileLoader extends FileLoader {
}

export class JsFileLoader extends FileLoader {
}

export class JsonFileLoader extends JsFileLoader {
}

export class Autowire {
    constructor (container: ContainerBuilder);

    get container (): ContainerBuilder;

    process (): Promise<void>;

    addExclude(excludedPath: string): void;

    set serviceFile(serviceFile: ServiceFile);

    get serviceFile(): ServiceFile;
}

export class ServiceFile {
    constructor (servicesDumpPath: string, absolutePath: boolean);

    generateFromContainer(container: ContainerBuilder): Promise<void>;
}
