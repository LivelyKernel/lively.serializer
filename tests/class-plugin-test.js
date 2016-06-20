/*global describe, it, beforeEach, afterEach*/

import { expect } from "mocha-es6";

import Serializer from "../src/serializer.js";
import ClassPlugin from "../src/plugins/class.js";

var serializerPackage = System.decanonicalize("lively.serializer/"),
    relativeTestModulePath = System.decanonicalize("./tests/class-plugin-test.js");

class SmartRefTestDummy {
  get someProperty() { return 23 }
  m1() { return 99 }
  toString() { return 'a ' + this.constructor.name }
}

describe('class plugin', function() {

  it("serialize class instance", function() {
    var instance1 = new SmartRefTestDummy(),
        instance2 = new SmartRefTestDummy();
    instance1.friend = instance2;
    instance2.specialProperty = 'some string';

    // serializer = lively.persistence.ObjectGraphLinearizer.forNewLively(); // plugin creation should happen there
    var serializer = Serializer.withPlugins([new ClassPlugin()]),
        result = serializer.deserialize(serializer.serialize(instance1))

    expect(instance2.specialProperty).to.equal(result.friend.specialProperty);

    expect().assert(result.m1, 'deserialized does not have method');
    expect(99).to.equal(result.m1(), 'wrong method invocation result');

    Object.defineProperty(SmartRefTestDummy.prototype, "someProperty", {configurable: true, value: -1});
    // SmartRefTestDummy.prototype.someProperty = -1; // change after serialization
    var observed = result.someProperty;
    Object.defineProperty(SmartRefTestDummy.prototype, "someProperty", {configurable: true, value: 23});
    expect(-1).to.equal(observed, 'proto prop');

    expect(SmartRefTestDummy).to.equal(result.constructor, 'constructor 1');
    expect(SmartRefTestDummy).to.equal(result.friend.constructor, 'constructor 2');
    expect().assert(result instanceof SmartRefTestDummy, 'instanceof 1');
    expect().assert(result.friend instanceof SmartRefTestDummy, 'instanceof 2');
  })

  it("find packages and modules of classes in serialized blob", function() {
    var instance1 = new SmartRefTestDummy(),
        instance2 = new SmartRefTestDummy();
    instance1.friend = instance2;
    instance2.specialProperty = 'some string';

    var serializer = Serializer.withPlugins([new ClassPlugin()]),
        serialized = serializer.serialize(instance1),
        result = ClassPlugin.sourceModulesIn(JSON.parse(serialized).registry);

    expect(result).to.deep.equal([{
      className: "SmartRefTestDummy",
      module: {
        package: {name: "lively.serializer"},
        pathInPackage: "./tests/class-plugin-test.js"
      }
    }]);
  })

  it("testRaiseErrorWhenClassNotFound", function() {
    serializer = lively.persistence.ObjectGraphLinearizer.forNewLively(); // plugin creation should happen there
    try {
      var klass = Object.subclass('Dummy_testDontRaiseErrorWhenClassNotFound', {}),
        instance = new klass(),
        serialized = serializer.serialize(instance);
    } finally {
      klass.remove();
    }

    var temp = Config.ignoreClassNotFound;
    Config.ignoreClassNotFound = false;
    try {
      serializer.deserialize(serialized)
    } catch(e) { return } finally { Config.ignoreClassNotFound = temp }

    expect().assert(false, 'No error rasied when deserializing obj without class')

  })

  it("testRaiseNoErrorWhenClassNotFoundWhenOverridden", function() {
    serializer = lively.persistence.ObjectGraphLinearizer.forNewLively(); // plugin creation should happen there
    try {
      var className = 'Dummy_testRaiseNoErrorWhenClassNotFoundWhenOverridden',
        klass = Object.subclass(className, {}),
        instance = new klass(),
        serialized = serializer.serialize(instance);
    } finally {
      klass.remove();
    }

    var temp = Config.ignoreClassNotFound;
    Config.ignoreClassNotFound = true;
    try {
      var result = serializer.deserialize(serialized)
    } finally {
      Config.ignoreClassNotFound = temp
    }
    expect().assert(result.isClassPlaceHolder)
    expect(className).to.equal(result.className)

  })

});
