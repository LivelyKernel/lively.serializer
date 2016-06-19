/*global describe, it, beforeEach, afterEach*/

import { expect } from "mocha-es6";

import Serializer from "../src/serializer.js";

describe("lively.serializer", () => {

  var sut;
  beforeEach(() => sut = new Serializer());

  describe("registering", () => {

    it("simple object", () => {
      var obj = {foo: 23},
          ref = sut.register(obj);
      expect(23).to.equal(sut.getRegisteredObjectFromId(ref.id).foo);
      sut.cleanup(sut.state.registry);
      expect().assert(!sut.getIdFromObject(obj), 'id property not removed from original objects');
    });    
  });

  it("test02RegisterObjectsWithReferences", function() {
    var obj1 = {foo: 23}, obj2 = {other: obj1, bar: null};
    sut.register(obj2);
    var id1 = sut.getIdFromObject(obj1), id2 = sut.getIdFromObject(obj2);
    var regObj1 = sut.getRegisteredObjectFromId(id1), regObj2 = sut.getRegisteredObjectFromId(id2);
    expect(23).to.equal(regObj1.foo);
    expect(null).to.equal(regObj2.bar);
    expect().assert(regObj2.other !== obj1, 'registered object points to real object!')
    expect().assert(regObj2.other, 'no reference object created')
    expect().assert(regObj2.other.id, 'reference object has no id')
    expect(id1).to.equal(regObj2.other.id)
  })

  it("test03RegisterObjectsWithArrayReferences", function() {
    var obj1 = {a: true}, obj2 = {b: true}, obj3 = {others: [obj1, [obj2], 99]};
    sut.register(obj3);
    var id1 = sut.getIdFromObject(obj1),
        id2 = sut.getIdFromObject(obj2),
        id3 = sut.getIdFromObject(obj3),
        regObj1 = sut.getRegisteredObjectFromId(id1),
        regObj2 = sut.getRegisteredObjectFromId(id2),
        regObj3 = sut.getRegisteredObjectFromId(id3);
    expect().assert(Object.isArray(regObj3.others), 'array gone away')
    expect().assert(3, regObj3.others.length, 'array strange')
    expect(id1).to.equal(regObj3.others[0].id, 'plain ref in array')
    expect(id2).to.equal(regObj3.others[1][0].id, 'nested ref in array')
    expect(99).to.equal(regObj3.others[2])
  })

  it("test04RegisterArray", function() {
    var obj1 = {}, obj2 = {}, arr = [obj1, obj2];
    var registeredArr = sut.register(arr);
    var id1 = sut.getIdFromObject(obj1),
      id2 = sut.getIdFromObject(obj2);
    expect(id1).to.equal(registeredArr[0].id, 'obj1')
    expect(id2).to.equal(registeredArr[1].id, 'obj2')
  })

  it("test05RegisterNumber", function() {
    expect(3).to.equal(sut.register(3));
  })

  it("test06RecreateObjectTree", function() {
    var obj1 = {foo: 23}, obj2 = {other: obj1, bar: 42};
    var id = sut.register(obj2).id;
    var result = sut.recreateFromId(id)
    expect(42).to.equal(result.bar);
    expect(23).to.equal(result.other.foo);
  })

  it("test07RecreateObjectTreeWithArray", function() {
    var obj1 = {foo: 23}, obj2 = {bar: 42}, obj3 = {others: [obj1, [obj2], obj1]};
    var id = sut.register(obj3).id;
    var result = sut.recreateFromId(id)
    expect(23).to.equal(result.others[0].foo, 'not resolved item 0');
    expect(42).to.equal(result.others[1][0].bar, 'not resolved item 1');
    expect(23).to.equal(result.others[2].foo, 'not resolved item 2');
    expect(result.others[0]).to.equal(result.others[2], 'not resolved identity');
  })

  it("test08RecreateBidirectionalRef", function() {
    var obj1 = {}, obj2 = {};
    obj1.friend = obj2;
    obj2.friend = obj1;
    var id = sut.register(obj1).id;
    var result = sut.recreateFromId(id)
    var recreated1 = result, recreated2 = result.friend;
    expect(recreated1).to.equal(recreated2.friend);
    expect(recreated2).to.equal(recreated1.friend);
  })

  it("test09SerializeAndDeserialize", function() {
    var obj1 = { value: 1 },
        obj2 = { value: 2, friend: obj1 },
        obj3 = { value: 3, friends: [obj1, obj2]};
    obj1.friend = obj3;

    var json = sut.serialize(obj3),
        result = sut.deserialize(json);

    expect(3).to.equal(result.value);
    expect(2).to.equal(result.friends.length);
    expect(1).to.equal(result.friends[0].value);
    expect(result.friends[0]).to.equal(result.friends[1].friend);
    expect(result).to.equal(result.friends[0].friend);
  })

  it("test10IdIsStored", function() {
    sut.options.keepIds = true;
    var obj = {foo: 23},
        id = sut.register(obj).id,
        registeredCopy = sut.getRegisteredObjectFromId(id);
    expect().assert(registeredCopy[sut.options.idProperty] !== undefined, 'copy has no id');
  })

  it("test11IdIsNotAlwaysDeleted", function() {
    sut.options.keepIds = true;
    var obj = {foo: 23},
        id = sut.register(obj).id,
        recreated = sut.recreateFromId(id);
    sut.cleanup(sut.state.registry); // evil!!!!
    expect(id).to.equal(obj[sut.options.idProperty], 'orig');
    expect(id).to.equal(recreated[sut.options.idProperty], 'recreated');
  })

  it("test12GraceFulErrorInSerialization", function() {
    var obj = {
      get prop1() { throw new Error },
      prop2: 23
    }, serialized = sut.serializeToJso(obj);
    expect(23).to.equal(serialized.registry[0].prop2);
    expect().assert(!serialized.registry[0].hasOwnProperty("prop1"), 'prop1 should be ignored and excluded');
  })

});
