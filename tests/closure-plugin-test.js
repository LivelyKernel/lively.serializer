/*global describe, it, beforeEach, afterEach*/

import { expect } from "mocha-es6";

import Serializer from "../src/serializer.js";

describe('closure plugin', function() {
  


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


    // test03bSerializeScript: function() {
    //     var obj = {foo: function(x) { this.x = x }.asScript()};
    //     obj.foo(2)
    //     this.assertEquals(2, obj.x);
    //     var result = this.serializeAndDeserialize(obj);
    //     result.foo(3);
    //     this.assertEquals(3, result.x, 'script not serialized');
    // }

  // test03aSerializeMorphScript: function() {
  //       var morph = lively.morphic.Morph.makeRectangle(0,0,0,0)
  //       morph.addScript(function someScript(val) { this.val = val });
  //       morph.someScript(23);
  //       this.assertEquals(23, morph.val);
  //       var result = this.serializeAndDeserialize(morph);
  //       result.someScript(42);
  //       this.assertEquals(42, result.val, 'script not serialized');
  //   },
});
