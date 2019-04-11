declare module 'node-dependency-injection' {
    export class ContainerBuilder {
        constructor ();

        addCompilerPass (compilerPass: any, ...args: any[]): void;

        compile (): void;

        findDefinition (key: any): any;

        findTaggedServiceIds (name: any): any;

        get (id: any): any;

        getDefinition (key: any): any;

        getParameter (key: any): any;

        has (key: any): any;

        hasDefinition (key: any): any;

        hasParameter (key: any): any;

        isSet (id: any): any;

        register (id: any, ...args: any[]): any;

        registerExtension (extension: any): void;

        remove (id: any): void;

        removeDefinition (key: any): any;

        set (id: any, instance: any): void;

        setAlias (alias: any, id: any): void;

        setDefinition (id: any, definition: any): any;

        setParameter (key: any, value: any): void;

    }

    export class Definition {
        constructor (...args: any[]);

        addArgument (argument: any): any;

        addMethodCall (method: any, ...args: any[]): any;

        addProperty (key: any, value: any): any;

        addTag (name: any, ...args: any[]): any;

        isPublic (...args: any[]): any;

        setFactory (Object: any, method: any): void;

    }

    export class JsFileLoader {
        constructor (...args: any[]);

        load (...args: any[]): void;

    }

    export class PackageReference {
        constructor (id: any);

        static prototype: {
            id: any;
        }

    }

    export class Reference {
        constructor (id: any, ...args: any[]);

        static prototype: {
            id: any;
            nullable: any;
        }

    }

    export class YamlFileLoader {
        constructor (...args: any[]);

        load (...args: any[]): void;

    }

    export function JsonFileLoader (...args: any[]): any;

    export function PassConfig (): void;
}