import { XMLFilter } from '../XMLFilter/XMLFilter.js'
import { Assert } from'../class/Assert.js'

export class TestXMLFilter{
  static run(){
    console.log('===Test XMLFilter class===')

    var xmlFilter1 = new XMLFilter();
    xmlFilter1.emptyFilter();
    xmlFilter1.setAttrOp(1,'test', '=');
    Assert.equals('setOp 1',2, xmlFilter1.filterList.length);
    Assert.equals('setOp =', '=', xmlFilter1.getFilter(1).attrs['test'].op);
    Assert.equals('setOp filterStack', [], xmlFilter1.getFilter(1).filterStack);
    Assert.equals('setOp attachedStack', [], xmlFilter1.getFilter(1).attachedStack);
    xmlFilter1.setAttrOp(0, 'test', '<');
    Assert.equals('setOp op <', '<', xmlFilter1.getFilter(0).attrs['test'].op);
    xmlFilter1.setAttrOp(0, 'test', '<=');
    Assert.equals('setOp op <=', '<=', xmlFilter1.getFilter(0).attrs['test'].op);
    Assert.equals('setOp op <=', '<=', xmlFilter1.getFilter(0).attrs['test'].op);
    xmlFilter1.setAttrOp(0, 'test', '>=');
    Assert.equals('setOp op >=', '>=', xmlFilter1.getFilter(0).attrs['test'].op);
    xmlFilter1.setAttrOp(0, 'test', '!=');
    Assert.equals('setOp op !=', '!=', xmlFilter1.getFilter(0).attrs['test'].op);
    xmlFilter1.setAttrOp(0, 'test', '=');
    Assert.equals('setOp op =', '=', xmlFilter1.getFilter(0).attrs['test'].op);

    xmlFilter1.setAttrValue(1,'test', 'Hello');
    Assert.equals('setAttrValue 1',2, xmlFilter1.filterList.length);
    Assert.equals('setAttrValue value', 'Hello', xmlFilter1.getFilter(1).attrs['test'].value);
    Assert.equals('setAttrValue filterStack', [], xmlFilter1.getFilter(1).filterStack);
    Assert.equals('setAttrValue attachedStack', [], xmlFilter1.getFilter(1).attachedStack);

    xmlFilter1.filterList[0] = {};
    xmlFilter1.setAttrValue(0, 'test', 89);
    Assert.equals('setAttrValue value integer', 89, xmlFilter1.getFilter(0).attrs['test'].value);
    xmlFilter1.setAttrValue(3, 'test', [90]);
    Assert.equals('setAttrValue value array', 90, xmlFilter1.getFilter(3).attrs['test'].value);
    xmlFilter1.setAttrValue(3, 'test', [90, 200]);
    Assert.equals('setAttrValue value array', [90, 200], xmlFilter1.getFilter(3).attrs['test'].value);
    xmlFilter1.setAttrValue(3, 'test', []);
    Assert.equals('setAttrValue value array', '', xmlFilter1.getFilter(3).attrs['test'].value);

    var xmlFilter2 = new XMLFilter();
    xmlFilter2.setAttrOp(0, 'test',['>', '=', 'p'])
    Assert.equals('setAttrOp multi op', '>', xmlFilter2.getFilter(0).attrs['test'].op);
    xmlFilter2.setAttrOp(0, 'test', null)
    Assert.equals('setAttrOp null nothing', '>', xmlFilter2.getFilter(0).attrs['test'].op);
    xmlFilter2.setAttrOp(0, 'test', undefined)
    Assert.equals('setAttrOp undefined nothing', '>', xmlFilter2.getFilter(0).attrs['test'].op);

    xmlFilter2.setAttrOp(2, 'test', '=')
    xmlFilter2.setAttachedStack(2, ['root', 'node', 'leaf'])
    Assert.equals('setAttrOp setAttachedStack op', '=', xmlFilter2.getFilter(2).attrs['test'].op);
    Assert.equals('setAttrOp setAttachedStack attachedStack',  ['root', 'node', 'leaf'], xmlFilter2.getFilter(2).attachedStack);
    xmlFilter2.setAttachedStack(2, ['root', 'node', 'leaf'])
    xmlFilter2.setAttrOp(2, 'test', '=')
    Assert.equals('setAttachedStack setAttrOp op', '=', xmlFilter2.getFilter(2).attrs['test'].op);
    Assert.equals('setAttachedStack setAttrOp attachedStack',  ['root', 'node', 'leaf'], xmlFilter2.getFilter(2).attachedStack);
    xmlFilter2.setAttrValue(2, 'test', 'aValueForTest')
    xmlFilter2.setAttachedStack(2, ['root', 'node', 'leaf'])
    Assert.equals('setAttrOp setAttachedStack op', '=', xmlFilter2.getFilter(2).attrs['test'].op);
    Assert.equals('setAttrOp setAttachedStack attachedStack',  ['root', 'node', 'leaf'], xmlFilter2.getFilter(2).attachedStack);

    xmlFilter2.setAttachedStack(2, ['rootTest', 'nodeTest', 'leafTest'])
    xmlFilter2.setAttrValue(2, 'test', 'aValueForTest')
    Assert.equals('setAttachedStack setAttrValue value', 'aValueForTest', xmlFilter2.getFilter(2).attrs['test'].value);
    Assert.equals('setAttachedStack setAttrValue attachedStack',  ['rootTest', 'nodeTest', 'leafTest'], xmlFilter2.getFilter(2).attachedStack);
    xmlFilter2.setAttrValue(2, 'test', 'aValueForTest')
    xmlFilter2.setAttachedStack(2, ['rootTest', 'nodeTest', 'leafTest'])
    Assert.equals('setAttrValue setAttachedStack value', 'aValueForTest', xmlFilter2.getFilter(2).attrs['test'].value);
    Assert.equals('setAttrValue setAttachedStack attachedStack',  ['rootTest', 'nodeTest', 'leafTest'], xmlFilter2.getFilter(2).attachedStack);

    xmlFilter2.setAttrOp(2, 'test', '=')
    xmlFilter2.setFilterStack(2, ['root', 'node', 'leaf'])
    Assert.equals('setAttrOp setFilterStack op', '=', xmlFilter2.getFilter(2).attrs['test'].op);
    Assert.equals('setAttrOp setFilterStack filterStack',  ['root', 'node', 'leaf'], xmlFilter2.getFilter(2).filterStack);
    xmlFilter2.setAttachedStack(2, ['root', 'node', 'leaf'])
    xmlFilter2.setAttrOp(2, 'test', '=')
    Assert.equals('setFilterStack setAttrOp op', '=', xmlFilter2.getFilter(2).attrs['test'].op);
    Assert.equals('setFilterStack setAttrOp filterStack',  ['root', 'node', 'leaf'], xmlFilter2.getFilter(2).filterStack);
    xmlFilter2.setAttrValue(2, 'test', 'aValueForTest')
    xmlFilter2.setFilterStack(2, ['root', 'node', 'leaf'])
    Assert.equals('setAttrOp setFilterStack op', '=', xmlFilter2.getFilter(2).attrs['test'].op);
    Assert.equals('setAttrOp setFilterStack filterStack',  ['root', 'node', 'leaf'], xmlFilter2.getFilter(2).filterStack);

    xmlFilter2.setFilterStack(2, ['rootTest', 'nodeTest', 'leafTest'])
    xmlFilter2.setAttrValue(2, 'test', 'aValueForTest')
    Assert.equals('setFilterStack setAttrValue value', 'aValueForTest', xmlFilter2.getFilter(2).attrs['test'].value);
    Assert.equals('setFilterStack setAttrValue filterStack',  ['rootTest', 'nodeTest', 'leafTest'], xmlFilter2.getFilter(2).filterStack);
    xmlFilter2.setAttrValue(2, 'test', 'aValueForTest')
    xmlFilter2.setFilterStack(2, ['rootTest', 'nodeTest', 'leafTest'])
    Assert.equals('setAttrValue setFilterStack value', 'aValueForTest', xmlFilter2.getFilter(2).attrs['test'].value);
    Assert.equals('setAttrValue setFilterStack filterStack',  ['rootTest', 'nodeTest', 'leafTest'], xmlFilter2.getFilter(2).filterStack);


    xmlFilter2.setAttrValue(0, 'test','')
    Assert.equals('setAttrValue empty string ', '', xmlFilter2.getFilter(0).attrs['test'].value);
    xmlFilter2.setAttrValue(0, 'test', null)
    Assert.equals('setAttrValue null nothing', '', xmlFilter2.getFilter(0).attrs['test'].value);
    xmlFilter2.setAttrValue(0, 'test', undefined)
    Assert.equals('setAttrValue undefined nothing', '', xmlFilter2.getFilter(0).attrs['test'].value);

    Assert.equals('instanceof xmlFilter2', true, xmlFilter2 instanceof XMLFilter);
    Assert.equals('instanceof null', false, null instanceof XMLFilter);
    Assert.equals('instanceof undefined', false, undefined instanceof XMLFilter);

    var xmlFilter3 = new XMLFilter();
    xmlFilter3.setFilterStack(0, []);
    Assert.equals('setFilterStack empty stack:', [], xmlFilter3.getFilter(0).filterStack);
    Assert.equals('setFilterStack empty length', 1, xmlFilter3.filterList.length);
    xmlFilter3.emptyFilter();
    Assert.equals('setFilterStack empty length', 0, xmlFilter3.filterList.length);
    xmlFilter3.setFilterStack(0, []);
    Assert.equals('setFilterStack null stack:', [], xmlFilter3.getFilter(0).filterStack);
    Assert.equals('setFilterStack null length', 1, xmlFilter3.filterList.length);
    xmlFilter3.emptyFilter();
    Assert.equals('setFilterStack empty length', 0, xmlFilter3.filterList.length);
    xmlFilter3.emptyFilter();
    Assert.equals('setFilterStack empty length', 0, xmlFilter3.filterList.length);
    xmlFilter3.setFilterStack(0, [1]);
    Assert.equals('setFilterStack int stack:', ['1'], xmlFilter3.getFilter(0).filterStack);
    Assert.equals('setFilterStack int length', 1, xmlFilter3.filterList.length);
    xmlFilter3.deleteFilter(0);
    Assert.equals('setFilterStack empty length', 1, xmlFilter3.filterList.length);
    xmlFilter3.setFilterStack(0, 'toto');
    Assert.equals('setFilterStack string stack:', undefined, xmlFilter3.getFilter(0));
    Assert.equals('setFilterStack string length', 1, xmlFilter3.filterList.length);

    xmlFilter3.emptyFilter();
    Assert.equals('setFilterStack delete length', 0, xmlFilter3.filterList.length);
    xmlFilter3.setFilterStack(0, [{}]);
    Assert.equals('setFilterStack array object empty length', 1, xmlFilter3.filterList.length);
    xmlFilter3.setFilterStack(0, ['root', 'node', 'leaf']);
    Assert.equals('setFilterStack array length', 1, xmlFilter3.filterList.length);
    Assert.equals('setFilterStack string array stack:', ['root', 'node', 'leaf'], xmlFilter3.getFilter(0).filterStack);
    xmlFilter3.setFilterStack(0, [1, ['a', 'b'], [4, 'R', ['p', 5]], 'leaf']);
    Assert.equals('setFilterStack strange array stack:', ['1', 'a,b', '4,R,p,5', 'leaf'], xmlFilter3.getFilter(0).filterStack);
    xmlFilter3.setFilterStack(0, [{tag:'root', obj:{name:'test', type:'type0'}, i:5}, {tag:'root', obj:{name:'test', type:'type0'}, i:5}]);
    Assert.equals('setFilterStack object array stack:', ['[object Object]', '[object Object]'], xmlFilter3.getFilter(0).filterStack);

    var xmlFilter4 = new XMLFilter();
    xmlFilter4.setFilterStack(0, ['root', 'node1', 'node2', 'leaf' ]);
    xmlFilter4.setFilterStack(1, ['root', 'node', 'node2', 'leaf']);
    xmlFilter4.setFilterStack(6, ['root', 'node1', 'node2', 'leaf1']);
    xmlFilter4.setFilterStack(4, ['root', 'node1', 'node2', 'leaf1']);
    xmlFilter4.setFilterStack(2, ['root', 'node1', 'leaf']);
    var stack = ['root', 'node1', 'node2', 'leaf1', 'leaf2'];
    var expectedResult = [];
    var actualsResult =  xmlFilter4.getMatchedFilterList(stack);
    Assert.equals('getMatchedFilter empty', expectedResult, actualsResult);
    var stack = ['root', 'node1', 'node', 'leaf1'];
    var expectedResult = [];
    var actualsResult =  xmlFilter4.getMatchedFilterList(stack);
    Assert.equals('getMatchedFilter empty', expectedResult, actualsResult);

    var result
    result  = XMLFilter.samePlace(['root', 'node', 'leaf'], ['root', 'node']);
    Assert.equals('samePlace false', false, result)
    result  = XMLFilter.samePlace([], []);
    Assert.equals('samePlace empty true', true, result)
    result  = XMLFilter.samePlace(['root', 'node', 'leaf'], ['root', 'node', 'leaf']);
    Assert.equals('samePlace simple true', true, result)
    result  = XMLFilter.samePlace(['root', 'node1', 'leaf'], ['root', 'node', 'leaf']);
    Assert.equals('samePlace simple false', false, result)
    result  = XMLFilter.samePlace(['root', ['node1','node2'], 'leaf'], ['root', ['node1','node2'], 'leaf']);
    Assert.equals('samePlace nested true', true, result)
    result  = XMLFilter.samePlace(['root', ['node1','node'], 'leaf'], ['root', ['node1',' node2'], 'leaf']);
    Assert.equals('samePlace nested false', false, result)
    result  = XMLFilter.samePlace(['shot-extract', 'shot-extract'], ['shot-extract', 'shot-extract', 'scene', 'shot']);
    Assert.equals('samePlace include first into the second false', false, result)
    result  = XMLFilter.samePlace(['shot-extract', 'shot-extract', 'scene', 'shot'], ['shot-extract', 'shot-extract']);
    Assert.equals('samePlace include second into the first false', false, result)
    result = XMLFilter.samePlace('Test', ['test'])
    Assert.equals('samePlace "Test" ["test"]', false, result)
    result = XMLFilter.samePlace([], ['test'])
    Assert.equals('samePlace [] ["test"]', false, result)


    result = XMLFilter.childStack([], []);
    Assert.equals('childStack([],[])', false, result);
    result = XMLFilter.childStack(['root'], ['root']);
    Assert.equals('childStack(["root"],["root"])', false, result);
    result = XMLFilter.childStack(['root','leaf'], ['root']);
    Assert.equals('childStack(["root","leaf"],["root"])', true, result);
    result = XMLFilter.childStack(['root','node','leaf'], ['root','node1']);
    Assert.equals('childStack(["root","node","leaf"],["root","node1"])', false, result);
    result = XMLFilter.childStack(['root'], ['root','leaf']);
    Assert.equals('childStack(["root"],["root","leaf"])', false, result);
    result = XMLFilter.childStack(['root','node','leaf'], ['root']);
    Assert.equals('childStack(["root","node","leaf"],["root"])', true, result);
    result = XMLFilter.childStack(['root','node','leaf'], ['root','node']);
    Assert.equals('childStack(["root","node","leaf"],["root","node"])', true, result);

    var xmlFilter5 = new XMLFilter();
    xmlFilter5.setAttachedStack(0, []);
    Assert.equals('setAttachedStack empty stack:', [], xmlFilter5.getFilter(0).attachedStack);
    Assert.equals('setAttachedStack empty length', 1, xmlFilter5.filterList.length);
    xmlFilter5.emptyFilter();
    Assert.equals('setAttachedStack empty length', 0, xmlFilter5.filterList.length);
    xmlFilter5.setAttachedStack(0, []);
    Assert.equals('setAttachedStack null stack:', [], xmlFilter5.getFilter(0).attachedStack);
    Assert.equals('setAttachedStack null length', 1, xmlFilter5.filterList.length);
    xmlFilter5.emptyFilter();
    Assert.equals('setAttachedStack empty length', 0, xmlFilter5.filterList.length);
    xmlFilter5.emptyFilter();
    Assert.equals('setAttachedStack empty length', 0, xmlFilter5.filterList.length);
    xmlFilter5.setAttachedStack(0, [1]);
    Assert.equals('setAttachedStack int stack:', ['1'], xmlFilter5.getFilter(0).attachedStack);
    Assert.equals('setAttachedStack int length', 1, xmlFilter5.filterList.length);
    xmlFilter5.deleteFilter(0);
    Assert.equals('setAttachedStack empty length', 1, xmlFilter5.filterList.length);
    xmlFilter5.setAttachedStack(0, 'toto');
    Assert.equals('setAttachedStack string stack:', undefined, xmlFilter5.getFilter(0));
    Assert.equals('setAttachedStack string length', 1, xmlFilter5.filterList.length);

    xmlFilter3.emptyFilter();
    Assert.equals('setFilterStack delete length', 0, xmlFilter3.filterList.length);
    xmlFilter3.setFilterStack(0, [{}]);
    Assert.equals('setFilterStack array object empty length', 1, xmlFilter3.filterList.length);
    xmlFilter3.setFilterStack(0, ['root', 'node', 'leaf']);
    Assert.equals('setFilterStack array length', 1, xmlFilter3.filterList.length);
    Assert.equals('setFilterStack string array stack:', ['root', 'node', 'leaf'], xmlFilter3.getFilter(0).filterStack);
    xmlFilter3.setFilterStack(0, [1, ['a', 'b'], [4, 'R', ['p', 5]], 'leaf']);
    Assert.equals('setFilterStack strange array stack:', ['1', 'a,b', '4,R,p,5', 'leaf'], xmlFilter3.getFilter(0).filterStack);
    xmlFilter3.setFilterStack(0, [{tag:'root', obj:{name:'test', type:'type0'}, i:5}, {tag:'root', obj:{name:'test', type:'type0'}, i:5}]);
    Assert.equals('setFilterStack object array stack:', ['[object Object]', '[object Object]'], xmlFilter3.getFilter(0).filterStack);


    result = XMLFilter.match('Anything Is True','=','')
    Assert.equals('match string = ""', true, result)

    result = XMLFilter.match('test','=', 'test')
    Assert.equals('match string "test"="test"', true, result)
    result = XMLFilter.match('test1','=', 'test')
    Assert.equals('match string "test1"="test"', true, result)

    result = XMLFilter.match('test', '!=', 'test1')
    Assert.equals('match string "test"!="test1"', true, result)
    result = XMLFilter.match('test', '!=', 'test')
    Assert.equals('match string "test"!="test"', false, result)

    result = XMLFilter.match('0', '!=', 0)
    Assert.equals('match  "0"!=0', true, result)
    result = XMLFilter.match('0', '=', 0)
    Assert.equals('match  "0"=0', false, result)


    result = XMLFilter.match('Right elbow', '=', 'Right')
    Assert.equals('match  "Right elbow"="Right"', true, result)
    result = XMLFilter.match('Right', '=', 'Right elbow')
    Assert.equals('match  "Right"="Right elbow"', false, result)
    result = XMLFilter.match('right elbow', '=', 'Right')
    Assert.equals('match  "right"="Right elbow"', false, result)

    result = XMLFilter.match(0, '<', 0)
    Assert.equals('match int 0 < 0', false, result)
    result = XMLFilter.match(1, '<', 0)
    Assert.equals('match int 1 < 0', false, result)
    result = XMLFilter.match(0, '<', 1)
    Assert.equals('match int 0 < 1', true, result)
    result = XMLFilter.match(1000, '>', 1400)
    Assert.equals('match int 1000 < 1400', false, result)
    result = XMLFilter.match(1500, '>', 1400)
    Assert.equals('match int 1500 < 1400', true, result)

    result = XMLFilter.match(0, '>', 0)
    Assert.equals('match int 0 > 0', false, result)
    result = XMLFilter.match(1, '>', 0)
    Assert.equals('match int 1 > 0', true, result)
    result = XMLFilter.match(0, '>', 1)
    Assert.equals('match int 0 > 1', false, result)

    result = XMLFilter.match(0, '<=', 0)
    Assert.equals('match int 0 <= 0', true, result)
    result = XMLFilter.match(1, '<=', 0)
    Assert.equals('match int 1 <= 0', false, result)
    result = XMLFilter.match(0, '<=', 1)
    Assert.equals('match int 0 <= 1', true, result)

    result = XMLFilter.match(0, '>=', 0)
    Assert.equals('match int 0 >= 0', true, result)
    result = XMLFilter.match(1, '>=', 0)
    Assert.equals('match int 1 >= 0', true, result)
    result = XMLFilter.match(0, '>=', 1)
    Assert.equals('match int 0 >= 1', false, result)

    result = XMLFilter.match('0', '<', '0')
    Assert.equals('match string 0 < 0', false, result)
    result = XMLFilter.match('1', '<', '0')
    Assert.equals('match string 1 < 0', false, result)
    result = XMLFilter.match('0', '<', '1')
    Assert.equals('match string 0 < 1', false, result)

    result = XMLFilter.match('0', '>', '0')
    Assert.equals('match string 0 > 0', false, result)
    result = XMLFilter.match('1', '>', '0')
    Assert.equals('match string 1 > 0', false, result)
    result = XMLFilter.match('0', '>', '1')
    Assert.equals('match string 0 > 1', false, result)

    result = XMLFilter.match('0', '<=', '0')
    Assert.equals('match string 0 <= 0', false, result)
    result = XMLFilter.match('1', '<=', '0')
    Assert.equals('match string 1 <= 0', false, result)
    result = XMLFilter.match('0', '<=', '1')
    Assert.equals('match string 0 <= 1', false, result)

    result = XMLFilter.match('0', '>=', '0')
    Assert.equals('match string 0 >= 0', false, result)
    result = XMLFilter.match('1', '>=', '0')
    Assert.equals('match string 1 >= 0', false, result)
    result = XMLFilter.match('0', '>=', '1')
    Assert.equals('match string 0 >= 1', false, result)

    result = XMLFilter.match('NaN', '=', NaN)
    Assert.equals('match "NaN"=NaN', false, result)
    result = XMLFilter.match('NaN', '<', NaN)
    Assert.equals('match "NaN"<NaN', false, result)

    result = XMLFilter.match(true, '=', true)
    Assert.equals('match true = true', true, result)
    result = XMLFilter.match('true', '=', true)
    Assert.equals('match "true" = true', false, result)

    result = XMLFilter.match(true, '!=', true)
    Assert.equals('match true = true', false, result)
    result = XMLFilter.match('true', '!=', true)
    Assert.equals('match "true" = true', true, result)

    result = XMLFilter.match(true, '<', true)
    Assert.equals('match true < true', false, result)
    result = XMLFilter.match(true, '<=', true)
    result = XMLFilter.match(true, '>', true)
    Assert.equals('match true > true', false, result)
    result = XMLFilter.match(false, '>=', true)
    Assert.equals('match true >= true', false, result)

    result = XMLFilter.match(false, '<', false)
    Assert.equals('match false < false', false, result)
    result = XMLFilter.match(false, '<=', false)
    Assert.equals('match false <= false', false, result)
    result = XMLFilter.match(false, '>', false)
    Assert.equals('match false > false', false, result)
    result = XMLFilter.match(false, '>=', false)
    Assert.equals('match false >= false', false, result)

    result = XMLFilter.match(false, '<', false)
    Assert.equals('match false < false', false, result)
    result = XMLFilter.match(false, '<=', false)
    Assert.equals('match false <= false', false, result)
    result = XMLFilter.match(false, '>', false)
    Assert.equals('match false > false', false, result)
    result = XMLFilter.match(false, '>=', false)
    Assert.equals('match false >= false', false, result)

    var filter1 = {'attrs':{'strartFrame':{'op':'>', 'value':1400}}}
    var xmlxsdElement1 = {'attrs':{'strartFrame':{'value': 1500}}}
    result = XMLFilter.matchElement(xmlxsdElement1, filter1)
    Assert.equals('matchElement strartFrame 1500 > 1400', true, result);
    xmlxsdElement1 = {'attrs':{'strartFrame':{'value': 1000}}}
    result = XMLFilter.matchElement(xmlxsdElement1, filter1)
    Assert.equals('matchElement strartFrame 1000 > 1400', false, result);

    var filter2 = {'attrs':{'set':{'op':'=', 'value':['a']}}};
    var xmlxsdElement2 = {'attrs':{'set':{'value':'a'}}};
    result = XMLFilter.matchElement(xmlxsdElement2, filter2)
    Assert.equals('matchElement set ["a"] = "a" ', true, result);
    filter2 = {'attrs':{'set':{'op':'!=', 'value':['a']}}};
    result = XMLFilter.matchElement(xmlxsdElement2, filter2)
    Assert.equals('matchElement set ["a"] !="a" ', false, result);

    filter2 = {'attrs':{'set':{'op':'!=', 'value':['a','b']}}};
    xmlxsdElement2 = {'attrs':{'set':{'value':'c'}}};
    result = XMLFilter.matchElement(xmlxsdElement2, filter2)
    Assert.equals('matchElement set ["a", "b"] !="c" ', true, result);
    xmlxsdElement2 = {'attrs':{'set':{'value':'b'}}};
    result = XMLFilter.matchElement(xmlxsdElement2, filter2)
    Assert.equals('matchElement set ["a", "b"] !="b" ', false, result);
    console.log('===End Test XMLFilter class===');


  }

}
