/*global describe, it, beforeEach, afterEach*/

import { expect } from "mocha-es6";

import Serializer from "../src/serializer.js";
import ClassPlugin from "../src/plugins/class.js";

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

  // it("test04FindModulesOfClasses", function() {
  //   var morph1 = lively.morphic.Morph.makeRectangle(0,0, 100, 100),
  //     morph2 = lively.morphic.Morph.makeRectangle(0,0, 50, 50);
  //   morph1.addMorph(morph2);
  //   // plugin creation should happen there
  //   serializer = lively.persistence.ObjectGraphLinearizer.forNewLively();
  //   var string = serializer.serialize(morph1),
  //     jso = JSON.parse(string),
  //     result = lively.persistence.Serializer.sourceModulesIn(jso);
  //   expect(2).to.equal(result.length, 'not the correct amount of classes recognized ' + result);
  //   expect().assert(result.include('Global.lively.morphic.Core'), 'Global.lively.morphic.Core not included');
  //   expect().assert(result.include('Global.lively.morphic.Shapes'), 'Global.lively.morphic.Shapes not included');
  // })


  // it("testDoNotSerializeFoundInClassHierarchy", function() {
  //   Object.subclass('ObjectLinearizerPluginTestClassA', { doNotSerialize: ['x'] });
  //   ObjectLinearizerPluginTestClassA.subclass('ObjectLinearizerPluginTestClassB', { doNotSerialize: ['y'] });
  //   var obj = new ObjectLinearizerPluginTestClassB(),
  //     sut = new DoNotSerializePlugin();
  //   expect().assert(sut.doNotSerialize(obj, 'y'), 'y');
  //   expect().assert(sut.doNotSerialize(obj, 'x'), 'x');
  //   expect().assert(!sut.doNotSerialize(obj, 'foo'), 'foo');
  // })

  // it("testRaiseErrorWhenClassNotFound", function() {
  //   serializer = lively.persistence.ObjectGraphLinearizer.forNewLively(); // plugin creation should happen there
  //   try {
  //     var klass = Object.subclass('Dummy_testDontRaiseErrorWhenClassNotFound', {}),
  //       instance = new klass(),
  //       serialized = serializer.serialize(instance);
  //   } finally {
  //     klass.remove();
  //   }

  //   var temp = Config.ignoreClassNotFound;
  //   Config.ignoreClassNotFound = false;
  //   try {
  //     serializer.deserialize(serialized)
  //   } catch(e) { return } finally { Config.ignoreClassNotFound = temp }

  //   expect().assert(false, 'No error rasied when deserializing obj without class')

  // })

  // it("testRaiseNoErrorWhenClassNotFoundWhenOverridden", function() {
  //   serializer = lively.persistence.ObjectGraphLinearizer.forNewLively(); // plugin creation should happen there
  //   try {
  //     var className = 'Dummy_testRaiseNoErrorWhenClassNotFoundWhenOverridden',
  //       klass = Object.subclass(className, {}),
  //       instance = new klass(),
  //       serialized = serializer.serialize(instance);
  //   } finally {
  //     klass.remove();
  //   }

  //   var temp = Config.ignoreClassNotFound;
  //   Config.ignoreClassNotFound = true;
  //   try {
  //     var result = serializer.deserialize(serialized)
  //   } finally {
  //     Config.ignoreClassNotFound = temp
  //   }
  //   expect().assert(result.isClassPlaceHolder)
  //   expect(className).to.equal(result.className)


  // })

  // it("testSerializeRegexp", function() {
  //   serializer = lively.persistence.ObjectGraphLinearizer.forNewLively(); // plugin creation should happen there
  //   var obj = {regexp:  /.*/i},
  //     result = serializeAndDeserialize(obj);
  //   expect().assert(result.regexp instanceof RegExp, 'not a regular expression')
  //   expect().assert(result.regexp.test('aab'), 'regular expression not working')
  // })

  // it("testSerializeClosure", function() {
  //   serializer = lively.persistence.ObjectGraphLinearizer.forNewLively(); // plugin creation should happen there
  //   var obj = {foo: lively.Closure.fromFunction(function() { return y + 3 }, {y: 2}).recreateFunc()},
  //     result = serializeAndDeserialize(obj);
  //   expect().assert(result.foo, 'function not deserialized')
  //   expect(5).to.equal(result.foo(), 'closure not working')
  // })

  // it("testClosureSerializationWithBoundThis", function() {
  //   serializer = lively.persistence.ObjectGraphLinearizer.forNewLively(); // plugin creation should happen there
  //   var obj = {myName: function myName() { return this.name }.asScript(), name: 'SomeName2'};
  //   expect('SomeName2').to.equal(obj.myName());
  //   var copy = serializer.copy(obj);
  //   expect('SomeName2').to.equal(copy.myName());
  //   copy.name = 'Foo'
  //   expect('Foo').to.equal(copy.myName());
  //   expect('SomeName2').to.equal(obj.myName());
  // })

  // it("testSerializeChangeAndSerializeClosure", function() {
  //   serializer = lively.persistence.ObjectGraphLinearizer.forNewLively(); // plugin creation should happen there
  //   var obj = {foo: function() { return 23 }.asScript()};
  //   var copy = serializer.copy(obj);
  //   expect(23).to.equal(copy.foo());
  //   serializer = lively.persistence.ObjectGraphLinearizer.forNewLively(); // plugin creation should happen there
  //   (function() { return 42 }).asScriptOf(obj, 'foo');
  //   var copy2 = serializer.copy(obj);
  //   expect(42).to.equal(copy2.foo(), 'copy 2 deserialized wrong function');
  // })


  // it("testSerializeAndDeserializeDate", function() {
  //   serializer = lively.persistence.ObjectGraphLinearizer.forNewLively(); // plugin creation should happen there
  //   var obj = {date: new Date()},
  //     result = serializeAndDeserialize(obj);
  //   expect(String(obj.date)).to.equal(String(result.date), 'date not correctly (de)serialized')
  // })

  // it("testDoNotSerializeWeakReferences", function() {
  //   serializer = lively.persistence.ObjectGraphLinearizer.forNewLively(); // plugin creation should happen there

  //   var obj1 = {n: 1},
  //     obj2 = {n: 2, o: obj1, doWeakSerialize: ['o']},
  //     obj3 = {o1: obj1, o2: obj2};

  //   var obj2Copy = serializeAndDeserialize(obj2);
  //   expect().assert(!obj2Copy.o, "weak ref was serialized");
  // })

  // it("testSerializeWeakReferencesWhenRealReferenceIsFound", function() {
  //   serializer = lively.persistence.ObjectGraphLinearizer.forNewLively();

  //   var obj1 = {n: 1},
  //     obj2 = {n: 2, o: obj1, doWeakSerialize: ['o']},
  //     obj3 = {o1: obj1, o2: obj2};

  //   var result = serializer.serializeToJso(obj3), //serializeAndDeserialize(obj3);
  //     rootId = result.id,
  //     obj3Copy = result.registry[rootId],
  //     obj2Copy = result.registry[obj3Copy.o2.id];

  //   expect().assert(obj2Copy.o !== undefined, "weak ref was not serialized");
  // })

  // it("testSerializeDependendConnections", function() {
  //   serializer = lively.persistence.ObjectGraphLinearizer.forNewLively(); // plugin creation should happen there
  //   var m1 = new lively.morphic.Morph();
  //   var m2 = new lively.morphic.Morph();
  //   lively.bindings.connect(m1, 'rotation', m2, 'setRotation', {garbageCollect: false});
  //   var oldCount = m1.attributeConnections[0].dependendConnections.length;
  //   var copy = serializer.copy(m1);
  //   var newCount = copy.attributeConnections[0].dependendConnections.length;
  //   expect(oldCount).to.equal(newCount, 'serialization adds additional dependent connection');
  // })

});
