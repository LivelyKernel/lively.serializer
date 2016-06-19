/*global describe, it, beforeEach, afterEach*/

import { expect } from "mocha-es6";

import Serializer from "../src/serializer.js";
import Plugin from "../src/plugin.js";

// Object.subclass('lively.persistence.tests.PersistenceTests.SmartRefTestDummy', // for testing
// 'default category', {
//   someProperty: 23,
//   m1: function() { return 99 },
//   toString: function() { return 'a ' + this.constructor.name }
// });
// 


describe('lively.persistence.tests.PersistenceTests.ObjectGraphLinearizerPluginTest', function() {

  function createAndAddDummyPlugin() {
    var plugin = new Plugin();
    serializer.addPlugin(plugin);
    return plugin;
  }

  function serializeAndDeserialize(obj) { return serializer.deserialize(serializer.serialize(obj)) }

  var serializer;
  beforeEach(() => serializer = new Serializer());

  xit("test01RecreationPlugin", function() {
    var sut = createAndAddDummyPlugin(), obj = {foo: 23};
    sut.deserializeObj = function(registeredObj) { return {bar: registeredObj.foo * 2} };
    var result = serializeAndDeserialize(obj);
    expect(23).to.equal(result.foo);
    expect(23*2).to.equal(result.bar);
  })

  xit("testSerializeObjectSpecificLayers", function() {
    var instance1 = new lively.persistence.tests.PersistenceTests.SmartRefTestDummy()
    var layer = cop.create('TestSerializeLayersLayer');
    instance1.withLayers = [layer];

    serializer = lively.persistence.ObjectGraphLinearizer.forNewLively(); // plugin creation should happen there
    var result = serializeAndDeserialize(instance1)

    expect().assert(result.withLayers, 'deserialized has no withLayers');
    expect().assert(result.withLayers[0], 'deserialized has no reference to the layer');
    expect().assert(result.withLayers[0] instanceof Layer, 'deserialized layer is layer ');
    expect(result.withLayers[0]).to.equal(instance1.withLayers[0], 'deserialized layer is not identical with original');
  })

  xit("testSerializeObjectSpecificWithoutLayers", function() {
    var instance1 = new lively.persistence.tests.PersistenceTests.SmartRefTestDummy()
    var layer = cop.create('TestSerializeLayersLayer');
    instance1.withoutLayers = [layer];

    serializer = lively.persistence.ObjectGraphLinearizer.forNewLively(); // plugin creation should happen there
    var result = serializeAndDeserialize(instance1)

    expect().assert(result.withoutLayers, 'deserialized has no withLayers');
    expect().assert(result.withoutLayers[0], 'deserialized has no reference to the layer');
    expect().assert(result.withoutLayers[0] instanceof Layer, 'deserialized layer is layer ');
    expect(result.withoutLayers[0]).to.equal(instance1.withoutLayers[0], 'deserialized layer is not identical with original');
  })

  xit("test03IgnoreProps", function() {
    var obj = {
      doNotSerialize: ['foo'],
      foo: 23,
      bar: 42,
    };
    serializer = lively.persistence.ObjectGraphLinearizer.forNewLively(); // plugin creation should happen there
    var result = serializeAndDeserialize(obj);
    expect().assert(!result.foo, 'property that was supposed to be ignored was serialized');
    expect(42).to.equal(result.bar, 'property that shouldn\'t be ignored was removed');
  })

  xit("testIgnoreOfArrayItemsShrinksArra", function() {
    var obj = {
      list: [1, 2, {ignoreMe: true}, 3]
    };
    serializer = lively.persistence.ObjectGraphLinearizer.forNewLively(); // plugin creation should happen there
    var filter = new GenericFilter();
    filter.addFilter(function(obj, propName, value) { return value.ignoreMe })
    serializer.addPlugin(filter);
    var result = serializeAndDeserialize(obj);
    expect([1,2,3]).to.deep.equal(result.list, 'ignoring props does not work');
  })


  xit("test04FindModulesOfClasses", function() {
    var morph1 = lively.morphic.Morph.makeRectangle(0,0, 100, 100),
      morph2 = lively.morphic.Morph.makeRectangle(0,0, 50, 50);
    morph1.addMorph(morph2);
    // plugin creation should happen there
    serializer = lively.persistence.ObjectGraphLinearizer.forNewLively();
    var string = serializer.serialize(morph1),
      jso = JSON.parse(string),
      result = lively.persistence.Serializer.sourceModulesIn(jso);
    expect(2).to.equal(result.length, 'not the correct amount of classes recognized ' + result);
    expect().assert(result.include('Global.lively.morphic.Core'), 'Global.lively.morphic.Core not included');
    expect().assert(result.include('Global.lively.morphic.Shapes'), 'Global.lively.morphic.Shapes not included');
  })


  xit("testDoNotSerializeFoundInClassHierarchy", function() {
    Object.subclass('ObjectLinearizerPluginTestClassA', { doNotSerialize: ['x'] });
    ObjectLinearizerPluginTestClassA.subclass('ObjectLinearizerPluginTestClassB', { doNotSerialize: ['y'] });
    var obj = new ObjectLinearizerPluginTestClassB(),
      sut = new DoNotSerializePlugin();
    expect().assert(sut.doNotSerialize(obj, 'y'), 'y');
    expect().assert(sut.doNotSerialize(obj, 'x'), 'x');
    expect().assert(!sut.doNotSerialize(obj, 'foo'), 'foo');
  })

  xit("testRaiseErrorWhenClassNotFound", function() {
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

  xit("testRaiseNoErrorWhenClassNotFoundWhenOverridden", function() {
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

  xit("testSerializeRegexp", function() {
    serializer = lively.persistence.ObjectGraphLinearizer.forNewLively(); // plugin creation should happen there
    var obj = {regexp:  /.*/i},
      result = serializeAndDeserialize(obj);
    expect().assert(result.regexp instanceof RegExp, 'not a regular expression')
    expect().assert(result.regexp.test('aab'), 'regular expression not working')
  })

  xit("testSerializeClosure", function() {
    serializer = lively.persistence.ObjectGraphLinearizer.forNewLively(); // plugin creation should happen there
    var obj = {foo: lively.Closure.fromFunction(function() { return y + 3 }, {y: 2}).recreateFunc()},
      result = serializeAndDeserialize(obj);
    expect().assert(result.foo, 'function not deserialized')
    expect(5).to.equal(result.foo(), 'closure not working')
  })

  xit("testClosureSerializationWithBoundThis", function() {
    serializer = lively.persistence.ObjectGraphLinearizer.forNewLively(); // plugin creation should happen there
    var obj = {myName: function myName() { return this.name }.asScript(), name: 'SomeName2'};
    expect('SomeName2').to.equal(obj.myName());
    var copy = serializer.copy(obj);
    expect('SomeName2').to.equal(copy.myName());
    copy.name = 'Foo'
    expect('Foo').to.equal(copy.myName());
    expect('SomeName2').to.equal(obj.myName());
  })

  xit("testSerializeChangeAndSerializeClosure", function() {
    serializer = lively.persistence.ObjectGraphLinearizer.forNewLively(); // plugin creation should happen there
    var obj = {foo: function() { return 23 }.asScript()};
    var copy = serializer.copy(obj);
    expect(23).to.equal(copy.foo());
    serializer = lively.persistence.ObjectGraphLinearizer.forNewLively(); // plugin creation should happen there
    (function() { return 42 }).asScriptOf(obj, 'foo');
    var copy2 = serializer.copy(obj);
    expect(42).to.equal(copy2.foo(), 'copy 2 deserialized wrong function');
  })


  xit("testSerializeAndDeserializeDate", function() {
    serializer = lively.persistence.ObjectGraphLinearizer.forNewLively(); // plugin creation should happen there
    var obj = {date: new Date()},
      result = serializeAndDeserialize(obj);
    expect(String(obj.date)).to.equal(String(result.date), 'date not correctly (de)serialized')
  })

  xit("testDoNotSerializeWeakReferences", function() {
    serializer = lively.persistence.ObjectGraphLinearizer.forNewLively(); // plugin creation should happen there

    var obj1 = {n: 1},
      obj2 = {n: 2, o: obj1, doWeakSerialize: ['o']},
      obj3 = {o1: obj1, o2: obj2};

    var obj2Copy = serializeAndDeserialize(obj2);
    expect().assert(!obj2Copy.o, "weak ref was serialized");
  })

  xit("testSerializeWeakReferencesWhenRealReferenceIsFound", function() {
    serializer = lively.persistence.ObjectGraphLinearizer.forNewLively();

    var obj1 = {n: 1},
      obj2 = {n: 2, o: obj1, doWeakSerialize: ['o']},
      obj3 = {o1: obj1, o2: obj2};

    var result = serializer.serializeToJso(obj3), //serializeAndDeserialize(obj3);
      rootId = result.id,
      obj3Copy = result.registry[rootId],
      obj2Copy = result.registry[obj3Copy.o2.id];

    expect().assert(obj2Copy.o !== undefined, "weak ref was not serialized");
  })

  xit("testSerializeDependendConnections", function() {
    serializer = lively.persistence.ObjectGraphLinearizer.forNewLively(); // plugin creation should happen there
    var m1 = new lively.morphic.Morph();
    var m2 = new lively.morphic.Morph();
    lively.bindings.connect(m1, 'rotation', m2, 'setRotation', {garbageCollect: false});
    var oldCount = m1.attributeConnections[0].dependendConnections.length;
    var copy = serializer.copy(m1);
    var newCount = copy.attributeConnections[0].dependendConnections.length;
    expect(oldCount).to.equal(newCount, 'serialization adds additional dependent connection');
  })

});

// 
// describe('lively.persistence.tests.PersistenceTests.AttributeConnectionGarbageCollectionPluginTest', function() {
// 
//   it("testGarbageCollectConnectionIfNoOtherRef", function() {
//   var obj1 = {}, obj2 = {};
//   lively.bindings.connect(obj1, 'x', obj2, 'y');
//   var copied = lively.persistence.Serializer.deserialize(
//     lively.persistence.Serializer.serialize(obj1));
//   expect().assert(!copied.attributeConnections || !copied.attributeConnections.length, "connection not garbage collected");
//   });
// 
//   it("testDontGarbageCollectConnectionIfTargetIsRefed", function() {
//   var obj1 = {}, obj2 = {};
//   obj1.ref = obj2;
//   lively.bindings.connect(obj1, 'x', obj2, 'y');
//   var copied = lively.persistence.Serializer.deserialize(
//     lively.persistence.Serializer.serialize(obj1));
//   expect(copied.ref).to.equal(copied.attributeConnections[0].targetObj);
//   });
// 
//   it("testDontGarbageCollectConnectionIfNotCollectable", function() {
//   var obj1 = {}, obj2 = {};
//   lively.bindings.connect(obj1, 'x', obj2, 'y', {garbageCollect: false});
//   var copied = lively.persistence.Serializer.deserialize(
//     lively.persistence.Serializer.serialize(obj1));
//   expect().assert(copied.attributeConnections[0].targetObj);
//   })
// 
// });
// 
// describe('lively.persistence.tests.PersistenceTests.RestoreTest', function() {
// 
// // 'running', {
// //   setUp: function($super) {
// //     $super();
// //     sut = lively.persistence.Serializer.createObjectGraphLinearizer();
// //   }
// // },
// // 'helper', {
// //   serializeAndDeserialize: function(obj) {
// //     return deserialize(sut.serialize(obj))
// //   }
// // },
// // 'testing', {
// 
//   it("test01aConnect", function() {
//     var obj1 = {}, obj2 = {};
//     obj1.ref = obj2;
//     lively.bindings.connect(obj1, 'x', obj2, 'y');
//     obj1.x = 23;
//     expect(23).to.equal(obj2.y);
//     var result = serializeAndDeserialize(obj1);
//     result.x = 42
//     expect(23).to.equal(obj2.y, 'connect affects non serialized');
//     expect(42).to.equal(result.ref.y, 'connect not serialized');
//   })
// 
// 
//   it("test01bConnectWithConverter", function() {
//     var obj1 = {}, obj2 = {};
//     obj1.ref = obj2;
//     lively.bindings.connect(obj1, 'x', obj2, 'y', {converter: function(val) { return val + 1 }});
//     var result = serializeAndDeserialize(obj1);
//     result.x = 42
//     expect(43).to.equal(result.ref.y, 'connect not serialized');
//   })
// 
// 
//   it("test03aSerializeMorphScript", function() {
//     var morph = lively.morphic.Morph.makeRectangle(0,0,0,0)
//     morph.addScript(function someScript(val) { this.val = val });
//     morph.someScript(23);
//     expect(23).to.equal(morph.val);
//     var result = serializeAndDeserialize(morph);
//     result.someScript(42);
//     expect(42).to.equal(result.val, 'script not serialized');
//   })
// 
//   it("test03bSerializeScript", function() {
//     var obj = {foo: function(x) { this.x = x }.asScript()};
//     obj.foo(2)
//     expect(2).to.equal(obj.x);
//     var result = serializeAndDeserialize(obj);
//     result.foo(3);
//     expect(3).to.equal(result.x, 'script not serialized');
//   })
// 
// 
// });
// 
// describe('lively.persistence.tests.PersistenceTests.PrototypeInstanceSerializationTest', function() {
// 
// // 'helper', {
// //   createObj: function(constr, constrArg) {
// //     constr.prototype.foo = 3;
// //     return constrArg ? new constr(constrArg) : new constr();
// //   },
// //   createPlugin: function() {
// //     this.plugin = new lively.persistence.GenericConstructorPlugin();
// //   }
// // },
// // 'running', {
// //   setUp: function($super) {
// //     $super();
// //     this.createPlugin();
// //     serializer = lively.persistence.Serializer.createObjectGraphLinearizer();
// //     serializer.addPlugin(this.plugin);
// //   },
// 
// //   tearDown: function($super) {
// //     $super();
// //     if (Global.constr) delete Global.constr;
// //   }
// // },
// // 'testing', {
// 
//   it("testConstructorPluginGetsConstructorName", function() {
//     var obj = this.createObj(function constr() {}),
//       name = this.plugin.getConstructorName(obj);
//     expect('constr').to.equal(name);
//   })
// 
// 
//   it("testSerializeAndDeserializeSimpleInstance", function() {
//     Global.constr = function constr() {};
//     var obj = this.createObj(constr),
//       copy = serializer.deserialize(serializer.serialize(obj));
//     expect(3).to.equal(copy.foo, 'copy does not have property');
//     expect().assert(!copy.hasOwnProperty('foo'), 'copy does not inherit property');
//     expect(constr).to.equal(copy.constructor, 'constructor not set');
//   })
// 
// 
//   it("testSerializeAndDeserializeWithConstructorExpectingArgs", function() {
//     Global.constr = function constr(arg) {
//       if (!arg) throw new Error("need arg to create object!");
//       this.bar = arg;
//     };
//     var obj = this.createObj(constr, 5),
//       serialized = serializer.serialize(obj),
//       copy = serializer.deserialize(serialized);
//     expect().assert(copy.foo && !copy.hasOwnProperty('foo'), 'copy does not have/inherit property');
//     expect(5).to.equal(copy.bar, 'copy does not have prop set in constructor');
//     expect(constr).to.equal(copy.constructor, 'constructor not set');
//   })
// 
// 
//   it("testDontSerializeConstructorForSimpleObjects", function() {
//     var obj = {};
//     var id = serializer.serializeToJso(obj).id;
//     var serialized = serializer.getRegisteredObjectFromId(id);
//     expect().assert(!serialized[this.plugin.constructorProperty], 'serialized constr for simple obj');
//   })
// 
// 
//   it("testDontSerializeLivelyClass", function() {
//     var obj = pt(3,2);;
//     var id = serializer.serializeToJso(obj).id;
//     var serialized = serializer.getRegisteredObjectFromId(id);
//     expect().assert(!serialized[this.plugin.constructorProperty], 'serialized constr for Lively Point');
//   })
// 
// });
// 
// lively.persistence.tests.PersistenceTests.ObjectGraphLinearizerTest.subclass('lively.persistence.tests.SerializeAsExpression', function() {
// // 'running', {
// //   setUp: function($super) {
// //     $super();
// //     addPlugin(new lively.persistence.ExprPlugin());
// //   },
// 
// //   assertSerializesFromExpr: function(expectedObj, expr) {
// //     var result = deserializeJso({id: 0, registry: {
// //       '0': {
// //         registeredObject: {
// //           __serializedExpressions__: [ "testObj" ],
// //           testObj: expr
// //         }
// //       }
// //     }});
// //     expect(expectedObj).to.equal(result.testObj, Strings.format('expr %s does not eval to %s',
// //                     expr, expectedObj));
// //   },
// 
// //   assertSerializesToExpr: function(expectedExpr, obj) {
// //     var ref = register({testExpr: obj}),
// //       regObj = getRegisteredObjectFromId(ref.id);
// //     expect(expectedExpr).to.equal(regObj.testExpr);
// //   }
// // },
// // 'testing', {
// 
//   it("test01ToExpr", function() {
//     var obj = {point: lively.pt(1,2)},
//       ref = register(obj),
//       regObj = getRegisteredObjectFromId(ref.id);
//     expect({
//       '__serializedExpressions__': ['point'],
//       point: 'lively.pt(1.0,2.0)'
//     }).to.deep.equal(regObj, JSON.prettyPrint(regObj));
//   })
// 
// 
//   it("test02ToExpr", function() {
//     var regObj = {__serializedExpressions__: ['point'], point: 'lively.pt(1.0,2.0)'},
//       result = deserializeJso({id: 0, registry: {'0': {registeredObject: regObj}}});
//     expect(pt(1,2)).to.equal(result.point);
//   })
// 
//   it("test03ObjectsToAndFrom", function() {
//     var test = this, tests = [
//       {obj: lively.pt(2,3), expr: "lively.pt(2.0,3.0)"},
//       {obj: lively.rect(pt(1,2), pt(4,5)), expr: "lively.rect(1,2,3,3)"},
//       {obj: Color.red, expr: 'Color.' + Color.red.toString()}
//     ];
//     tests.forEach(function(testData) {
//       test.assertSerializesToExpr(testData.expr, testData.obj);
//       test.assertSerializesFromExpr(testData.obj, testData.expr);
//     });
//   })
// 
//   it("test04SpecialPropertyCleaned", function() {
//     var obj = {pos: lively.pt(1,2)};
//     var serialized = serializeToJso(obj);
//     var deserialized = deserializeJso(serialized);
//     expect().assert(!deserialized.hasOwnProperty('__serializedExpressions__'));
//   })
// 
//   it("test05ExprInArray", function() {
//     var obj = {arrayWithPoint: [2, 3, [lively.pt(1,2)]]};
//     // First test serialized representation
//     var ref = register(obj),
//       regObj = getRegisteredObjectFromId(ref.id);
//     expect({
//       '__serializedExpressions__': ["arrayWithPoint.2.0"],
//       arrayWithPoint: [2, 3, ['lively.pt(1.0,2.0)']]
//     }).to.deep.equal(regObj, 'registry object: ' + JSON.prettyPrint(sut.registry));
//     // now test if deserialization works
//     var deserialized = deserializeJso(sut.serializeToJso(obj));
//     expect(obj).to.deep.equal(deserialized, 'deserialized: ' + Objects.inspect(deserialized));
//   })
// 
//   it("test06ExprInArrayInObjInArray", function() {
//     var obj = {foo: [{arrayWithPoint: [lively.pt(1,2),lively.pt(1,2),lively.pt(1,2),lively.pt(1,2)]}]},
//       deserialized = deserializeJso(sut.serializeToJso(obj));
//     expect(obj).to.deep.equal(deserialized, 'deserialized: ' + Objects.inspect(deserialized));
//   })
// 
// });
// 
// lively.persistence.tests.PersistenceTests.ObjectGraphLinearizerTest.subclass('lively.persistence.tests.Compaction', function() {
// 
// // 'running', {
// //   setUp: function($super) {
// //     $super();
// //     // sut.addPlugin(new lively.persistence.ExprPlugin());
// //   },
// // },
// // 'testing', {
// 
//   it("testDirectCompaction", function() {
//   var objs = [{name: "1"}, {name: "2"}, {name: "3"}, {name: "4"}, {name: "5"}];
//   objs[0].ref = objs[1];
//   objs[1].ref1 = objs[2];
//   objs[1].ref2 = objs[3];
//   objs[2].refs = [objs[3], [objs[4]], objs[0]];
// 
//   var serializer = lively.persistence.Serializer.createObjectGraphLinearizer(),
//     snapshot = serializer.serializeToJso(objs[0]),
//     compacted;
// 
//   // no changes
//   compacted = serializer.compactRegistry(lively.lang.obj.deepCopy(snapshot));
//   expect(snapshot).to.deep.equal(compacted, "1");
//   expect(lively.lang.obj.inspect(objs[0], {maxDepth: 5})).to.equal(lively.lang.obj.inspect(serializer.deserializeJso(compacted), {maxDepth: 5}));
// 
//   // removals
//   compacted = serializer.compactRegistry(lively.lang.obj.deepCopy(snapshot), [2]);
//   expect(["0", "1", "3", "isSimplifiedRegistry"]).to.deep.equal(Object.keys(compacted.registry), "2");
//   expect({name: "1", ref: {name: "2", ref1: null, ref2: {name: "4"}}}).to.deep.equal(serializer.deserializeJso(compacted), "2 deserialized");
// 
//   compacted = serializer.compactRegistry(lively.lang.obj.deepCopy(snapshot), [3]);
//   expect(["0", "1", "2", "4", "isSimplifiedRegistry"]).to.deep.equal(Object.keys(compacted.registry), "3");
//   expect({name: "1",ref: {name: "2",ref1: null,ref2: null}}).to.deep.equal(serializer.deserializeJso(compacted), "2 deserialized");
//   })
// 
// 
//   it("testRemoveAllReferences", function() {
//   var objs = [{}, {}, {}, {}, {}, {}];
//   objs[0].ref = objs[1];
//   objs[1].ref = objs[2];
//   objs[2].ref = objs[3];
//   objs[3].ref = objs[4];
//   objs[4].ref = objs[5];
//   objs[5].ref = objs[3];
// 
//   // There is a loop 3 -> 4 -> 5
//   //         ^---------|
//   var serializer = lively.persistence.Serializer.createObjectGraphLinearizer(),
//     snapshot = serializer.serializeToJso(objs[0]),
//     compacted = serializer.compactRegistry(lively.lang.obj.deepCopy(snapshot), ["1"]);
//   expect(["0", "isSimplifiedRegistry"]).to.deep.equal(Object.keys(compacted.registry));
// 
//   objs[0].ref2 = objs[5];
//   var serializer = lively.persistence.Serializer.createObjectGraphLinearizer(),
//     snapshot = serializer.serializeToJso(objs[0]);
//     compacted = serializer.compactRegistry(lively.lang.obj.deepCopy(snapshot), ["1"]);
//   expect(["0", "3", "4", "5", "isSimplifiedRegistry"]).to.deep.equal(Object.keys(compacted.registry));
//   })
// 
// 
//   it("testCompactionHappensWithNormalSerialization", function() {
//   var objs = [{}, {}, {}, {}, {}, {}];
//   objs[0].ref = objs[1];
//   objs[1].ref = objs[2];
//   objs[2].ref = objs[3];
//   objs[3].ref = objs[4];
//   objs[4].ref = objs[5];
//   objs[5].ref = objs[3];
// 
//   // There is a loop 3 -> 4 -> 5
//   //         ^---------|
//   var serializer = lively.persistence.Serializer.createObjectGraphLinearizer();
//   var filter = new GenericFilter();
//   filter.addFilter(function(obj, propName, value) { return value === objs[1]; })
//   serializer.addPlugin(filter);
//   var snapshot = serializer.serializeToJso(objs[0]);
//   expect(["0", "isSimplifiedRegistry"]).to.deep.equal(Object.keys(snapshot.registry));
// 
//   expect().assert(!objs[1][lively.persistence.ObjectGraphLinearizer.prototype.idProperty], "removed object not cleaned up!");
//   })
// 
// });
// 
// }) // end of module