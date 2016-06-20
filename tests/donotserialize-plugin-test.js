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

describe('donotserialize plugin', function() {

  // it("testDoNotSerializeFoundInClassHierarchy", function() {
  //   class DoNotSerializeA {
  //     get doNotSerialize() { return ['x'] }
  //   }
  //   class DoNotSerializeB extends DoNotSerializeA {
  //     get doNotSerialize() { return ['y'] }
  //   }

  //   // var obj = new DoNotSerializeB(),
  //   //     sut = new DoNotSerializePlugin();

  //   // expect().assert(sut.doNotSerialize(obj, 'y'), 'y');
  //   // expect().assert(sut.doNotSerialize(obj, 'x'), 'x');
  //   // expect().assert(!sut.doNotSerialize(obj, 'foo'), 'foo');
  // })

  // it("testDoNotSerializeWeakReferences", function() {
  //   serializer = lively.persistence.ObjectGraphLinearizer.forNewLively(); // plugin creation should happen there

  //   var obj1 = {n: 1},
  //     obj2 = {n: 2, o: obj1, doWeakSerialize: ['o']},
  //     obj3 = {o1: obj1, o2: obj2};

  //   var obj2Copy = serializeAndDeserialize(obj2);
  //   expect().assert(!obj2Copy.o, "weak ref was serialized");
  // })

});
