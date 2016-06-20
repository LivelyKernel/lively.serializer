/*global describe, it, beforeEach, afterEach*/

import { expect } from "mocha-es6";

import Serializer from "../src/serializer.js";

describe('generic construcot plugin', function() {
  
//   TestCase.subclass('lively.persistence.tests.PersistenceTests.PrototypeInstanceSerializationTest',
// 'helper', {
//     createObj: function(constr, constrArg) {
//         constr.prototype.foo = 3;
//         return constrArg ? new constr(constrArg) : new constr();
//     },
//     createPlugin: function() {
//         this.plugin = new lively.persistence.GenericConstructorPlugin();
//     }
// },
// 'running', {
//     setUp: function($super) {
//         $super();
//         this.createPlugin();
//         this.serializer = lively.persistence.Serializer.createObjectGraphLinearizer();
//         this.serializer.addPlugin(this.plugin);
//     },

//     tearDown: function($super) {
//         $super();
//         if (Global.constr) delete Global.constr;
//     }
// },
// 'testing', {
//     testConstructorPluginGetsConstructorName: function() {
//         var obj = this.createObj(function constr() {}),
//             name = this.plugin.getConstructorName(obj);
//         this.assertEquals('constr', name);
//     },

//     testSerializeAndDeserializeSimpleInstance: function() {
//         Global.constr = function constr() {};
//         var obj = this.createObj(constr),
//             copy = this.serializer.deserialize(this.serializer.serialize(obj));
//         this.assertEquals(3, copy.foo, 'copy does not have property');
//         this.assert(!copy.hasOwnProperty('foo'), 'copy does not inherit property');
//         this.assertIdentity(constr, copy.constructor, 'constructor not set');
//     },

//     testSerializeAndDeserializeWithConstructorExpectingArgs: function() {
//         Global.constr = function constr(arg) {
//             if (!arg) throw new Error("need arg to create object!");
//             this.bar = arg;
//         };
//         var obj = this.createObj(constr, 5),
//             serialized = this.serializer.serialize(obj),
//             copy = this.serializer.deserialize(serialized);
//         this.assert(copy.foo && !copy.hasOwnProperty('foo'), 'copy does not have/inherit property');
//         this.assertEquals(5, copy.bar, 'copy does not have prop set in constructor');
//         this.assertIdentity(constr, copy.constructor, 'constructor not set');
//     },

//     testDontSerializeConstructorForSimpleObjects: function() {
//         var obj = {};
//         var id = this.serializer.serializeToJso(obj).id;
//         var serialized = this.serializer.getRegisteredObjectFromId(id);
//         this.assert(!serialized[this.plugin.constructorProperty],
//                     'serialized constr for simple obj');
//     },

//     testDontSerializeLivelyClass: function() {
//         var obj = pt(3,2);;
//         var id = this.serializer.serializeToJso(obj).id;
//         var serialized = this.serializer.getRegisteredObjectFromId(id);
//         this.assert(!serialized[this.plugin.constructorProperty],
//                     'serialized constr for Lively Point');
//     }
// });
});
