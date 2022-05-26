import {
    Call,
    CompilerPass,
    ContainerBuilder,
    Definition,
    JsFileLoader,
    JsonFileLoader,
    Logger,
    PackageReference,
    PassConfig,
    Reference,
    Tag,
    YamlFileLoader
} from './index'

// Stuff for using in tests
class Mailer {
    private transport: string
    private count: number

    constructor(transport: string, count: number) {
        this.transport = transport
        this.count = count
    }

    sendMail(email: string, text: string) {
        console.log(email, text)
    }
}

class NewsletterManager {
    private mailer: Mailer
    private fs: any

    construct(mailer: Mailer, fs: any) {
        this.mailer = mailer
        this.fs = fs
    }
}

class MailerManager {
    private mailer: Mailer

    setMailer(mailer: Mailer) {
        this.mailer = mailer
    }
}

class SomeManager {
    getFactory(): any {
        // return something
    }
}

class CustomPass implements CompilerPass {
    async process(container: ContainerBuilder) {
        // ... do something during the compilation
    }
}

function assertIsBoolean(value: boolean): void {
    if (value !== true && value !== false) {
        throw TypeError()
    }
}

function assertIsDefinition(value: Definition): void {
    if (!(value instanceof Definition)) {
        throw TypeError()
    }
}

async function assertIsPromisedDefinition(value: Promise<Definition>): Promise<void> {
    const definition = await value
    if (!(definition instanceof Definition)) {
        throw TypeError()
    }
}

function assertType<T>(value: T): void {
}

// * Container *
// Constructors
new ContainerBuilder(true)
new ContainerBuilder(false, '/')
let container = new ContainerBuilder()

// Register
container.register('mailer')
container.register('mailer', Mailer)
container.register('mailer', Mailer, ['sendmail'])
container
    .register('mailer')
    .addArgument('sendmail')
container
    .register('newsletter_manager', NewsletterManager)
    .addArgument(new Reference('mailer'))
    .addArgument(new PackageReference('fs-extra'))
container
    .register('mailer_manager', MailerManager)
    .addMethodCall('setMailer', [new Reference('mailer')])

// Set
container.set('mailer', new Mailer('sendmail', 5))

// Get
const mailer = container.get<Mailer>('mailer')
mailer.sendMail('hello@example.com', 'Hi!')

// Logger
container.logger = console

class NullLogger implements Logger {
    warn(message?: any, ...optionalParams: any[]): void {
        // do nothing
    }
}

container.logger = new NullLogger()

// Other methods
assertIsBoolean(container.has('some'))
assertIsBoolean(container.hasDefinition('some'))
assertIsBoolean(container.removeDefinition('some'))
assertIsDefinition(container.getDefinition('some'))
assertIsPromisedDefinition(container.findDefinition('some'))
assertIsBoolean(container.hasParameter('mailer.transport'))
container.findTaggedServiceIds('tag')
container.setAlias('mailer', 'service.mailer')
container.setParameter('mailer.transport', 'sendmail')
// Compile
container.addCompilerPass(new CustomPass())
container.addCompilerPass(new CustomPass(), PassConfig.TYPE_AFTER_REMOVING)
container.addCompilerPass(new CustomPass(), PassConfig.TYPE_OPTIMIZE, 10)
container.compile()

// * Configurations *
container = new ContainerBuilder()
let loader = new YamlFileLoader(container)
loader.load('/path/to/file.yml')

container = new ContainerBuilder()
loader = new JsonFileLoader(container)
loader.load('/path/to/file.json')

container = new ContainerBuilder()
loader = new JsFileLoader(container)
loader.load('/path/to/file.js')

// * Definition *
// Constructor
new Definition()
new Definition(null, ['some_argument'])
const mailerDefinition = new Definition(Mailer, ['sendmail'])

// Properties
mailerDefinition.public = false
mailerDefinition.deprecated = 'Example of message deprecation'
mailerDefinition.lazy = true
mailerDefinition.decoratedService = 'app.mailer'
mailerDefinition.decorationPriority = 5
mailerDefinition.synthetic = true
mailerDefinition.shared = false
mailerDefinition.abstract = true
mailerDefinition.parent = 'base_mailer'
mailerDefinition.Object = {}
mailerDefinition.args = [3.14, 'sendmail', new PackageReference('fs')]
mailerDefinition.appendArgs = ['sendmail']
// Readonly properties
const mailerFactory = mailerDefinition.factory
if (mailerFactory != null) {
    assertType<Object | Reference>(mailerFactory.Object);
    assertType<string>(mailerFactory.method)
}
assertType<Call[]>(mailerDefinition.calls)
assertType<Tag[]>(mailerDefinition.tags)
assertType<Map<string, any>>(mailerDefinition.properties)

// Other methods
mailerDefinition.addTag('tag_name')
const tagAttributes = new Map()
tagAttributes.set('event', 'prePersist')
mailerDefinition.addTag('listener', tagAttributes)
new Definition(SomeManager).setFactory(SomeManager, 'getFactory')

// Setter injection
const mailerManagerDefinition = new Definition(MailerManager)
mailerManagerDefinition.addMethodCall('setMailer', [new Reference('mailer')])
container.setDefinition('mailer_manage', mailerManagerDefinition)

// Property injection
const definition = new Definition(NewsletterManager)
definition.addProperty('mailer', new Reference('mailer'))
