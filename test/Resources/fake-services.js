module.exports = {
    services: {
        foo: {class: "./foo", arguments: ["@bar", "%fs-extra", "foo-bar"]},
        bar: {class: "./bar"}
    }
};