/*global describe, it, beforeEach, afterEach*/

import { expect } from "mocha-es6";

import Serializer from "../src/serializer.js";

describe('expr plugin', function() {
  
// lively.persistence.tests.PersistenceTests.ObjectGraphLinearizerTest.subclass('lively.persistence.tests.SerializeAsExpression',
// 'running', {
//     setUp: function($super) {
//         $super();
//         this.sut.addPlugin(new lively.persistence.ExprPlugin());
//     },

//     assertSerializesFromExpr: function(expectedObj, expr) {
//         var result = this.sut.deserializeJso({id: 0, registry: {
//             '0': {
//                 registeredObject: {
//                     __serializedExpressions__: [ "testObj" ],
//                     testObj: expr
//                 }
//             }
//         }});
//         this.assertEquals(expectedObj, result.testObj,
//                           Strings.format('expr %s does not eval to %s',
//                                         expr, expectedObj));
//     },

//     assertSerializesToExpr: function(expectedExpr, obj) {
//         var ref = this.sut.register({testExpr: obj}),
//             regObj = this.sut.getRegisteredObjectFromId(ref.id);
//         this.assertEquals(expectedExpr, regObj.testExpr);
//     }
// },
// 'testing', {
//     test01ToExpr: function() {
//         var obj = {point: lively.pt(1,2)},
//             ref = this.sut.register(obj),
//             regObj = this.sut.getRegisteredObjectFromId(ref.id);
//         this.assertEqualState({
//             '__serializedExpressions__': ['point'],
//             point: 'lively.pt(1.0,2.0)'
//         }, regObj, JSON.prettyPrint(regObj));
//     },

//     test02ToExpr: function() {
//         var regObj = {__serializedExpressions__: ['point'], point: 'lively.pt(1.0,2.0)'},
//             result = this.sut.deserializeJso({id: 0, registry: {'0': {registeredObject: regObj}}});
//         this.assertEquals(pt(1,2), result.point);
//     },
//     test03ObjectsToAndFrom: function() {
//         var test = this, tests = [
//             {obj: lively.pt(2,3), expr: "lively.pt(2.0,3.0)"},
//             {obj: lively.rect(pt(1,2), pt(4,5)), expr: "lively.rect(1,2,3,3)"},
//             {obj: Color.red, expr: 'Color.' + Color.red.toString()}
//         ];
//         tests.forEach(function(testData) {
//             test.assertSerializesToExpr(testData.expr, testData.obj);
//             test.assertSerializesFromExpr(testData.obj, testData.expr);
//         });
//     },
//     test04SpecialPropertyCleaned: function() {
//         var obj = {pos: lively.pt(1,2)};
//         var serialized = this.sut.serializeToJso(obj);
//         var deserialized = this.sut.deserializeJso(serialized);
//         this.assert(!deserialized.hasOwnProperty('__serializedExpressions__'));
//     },
//     test05ExprInArray: function() {
//         var obj = {arrayWithPoint: [2, 3, [lively.pt(1,2)]]};
//         // First test serialized representation
//         var ref = this.sut.register(obj),
//             regObj = this.sut.getRegisteredObjectFromId(ref.id);
//         this.assertEqualState({
//             '__serializedExpressions__': ["arrayWithPoint.2.0"],
//             arrayWithPoint: [2, 3, ['lively.pt(1.0,2.0)']]
//         }, regObj, 'registry object: ' + JSON.prettyPrint(this.sut.registry));
//         // now test if deserialization works
//         var deserialized = this.sut.deserializeJso(this.sut.serializeToJso(obj));
//         this.assertEqualState(obj, deserialized, 'deserialized: ' + Objects.inspect(deserialized));
//     },
//     test06ExprInArrayInObjInArray: function() {
//         var obj = {foo: [{arrayWithPoint: [lively.pt(1,2),lively.pt(1,2),lively.pt(1,2),lively.pt(1,2)]}]},
//             deserialized = this.sut.deserializeJso(this.sut.serializeToJso(obj));
//         this.assertEqualState(obj, deserialized, 'deserialized: ' + Objects.inspect(deserialized));
//     }
// });
});
