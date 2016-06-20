/*global describe, it, beforeEach, afterEach*/

import { expect } from "mocha-es6";

import Serializer from "../src/serializer.js";

describe('serialize connections', function() {

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

    // test01aConnect: function() {
    //     var obj1 = {}, obj2 = {};
    //     obj1.ref = obj2;
    //     lively.bindings.connect(obj1, 'x', obj2, 'y');
    //     obj1.x = 23;
    //     this.assertEquals(23, obj2.y);
    //     var result = this.serializeAndDeserialize(obj1);
    //     result.x = 42
    //     this.assertEquals(23, obj2.y, 'connect affects non serialized');
    //     this.assertEquals(42, result.ref.y, 'connect not serialized');
    // },

    // test01bConnectWithConverter: function() {
    //     var obj1 = {}, obj2 = {};
    //     obj1.ref = obj2;
    //     lively.bindings.connect(obj1, 'x', obj2, 'y', {converter: function(val) { return val + 1 }});
    //     var result = this.serializeAndDeserialize(obj1);
    //     result.x = 42
    //     this.assertEquals(43, result.ref.y, 'connect not serialized');
    // },


// TestCase.subclass('lively.persistence.tests.PersistenceTests.AttributeConnectionGarbageCollectionPluginTest',
// 'testing', {

//   testGarbageCollectConnectionIfNoOtherRef: function() {
//     var obj1 = {}, obj2 = {};
//     lively.bindings.connect(obj1, 'x', obj2, 'y');
//     var copied = lively.persistence.Serializer.deserialize(
//       lively.persistence.Serializer.serialize(obj1));
//     this.assert(!copied.attributeConnections || !copied.attributeConnections.length,
//       "connection not garbage collected");
//   },

//   testDontGarbageCollectConnectionIfTargetIsRefed: function() {
//     var obj1 = {}, obj2 = {};
//     obj1.ref = obj2;
//     lively.bindings.connect(obj1, 'x', obj2, 'y');
//     var copied = lively.persistence.Serializer.deserialize(
//       lively.persistence.Serializer.serialize(obj1));
//     this.assertIdentity(copied.ref, copied.attributeConnections[0].targetObj);
//   },

//   testDontGarbageCollectConnectionIfNotCollectable: function() {
//     var obj1 = {}, obj2 = {};
//     lively.bindings.connect(obj1, 'x', obj2, 'y', {garbageCollect: false});
//     var copied = lively.persistence.Serializer.deserialize(
//       lively.persistence.Serializer.serialize(obj1));
//     this.assert(copied.attributeConnections[0].targetObj);
//   }
// });