/*global describe, it, beforeEach, afterEach*/

import { expect } from "mocha-es6";

import Serializer from "../src/serializer.js";

describe('weak serialization plugin', function() {
  
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

});
