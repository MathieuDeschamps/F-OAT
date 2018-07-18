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
    Assert.equals('setOp 1',2, xmlFilter1.filterList.length);
    Assert.equals('setOp value', 'Hello', xmlFilter1.getFilter(1).attrs['test'].value);
    xmlFilter1.filterList[0] = {};
    xmlFilter1.setAttrValue(0, 'test', 89);
    Assert.equals('setOp value integer', 89, xmlFilter1.getFilter(0).attrs['test'].value);
    xmlFilter1.setAttrValue(3, 'test', [90]);
    Assert.equals('setOp value array', 90, xmlFilter1.getFilter(3).attrs['test'].value);
    xmlFilter1.setAttrValue(3, 'test', [90, 200]);
    Assert.equals('setOp value array', [90, 200], xmlFilter1.getFilter(3).attrs['test'].value);
    xmlFilter1.setAttrValue(3, 'test', []);
    Assert.equals('setOp value array', '', xmlFilter1.getFilter(3).attrs['test'].value);

    var xmlFilter2 = new XMLFilter();
    xmlFilter2.setAttrOp(0, 'test',['>', '=', 'p'])
    Assert.equals('setOp multi op', '>', xmlFilter2.getFilter(0).attrs['test'].op);
    xmlFilter2.setAttrOp(0, 'test', null)
    Assert.equals('setOp null nothing', '>', xmlFilter2.getFilter(0).attrs['test'].op);
    xmlFilter2.setAttrOp(0, 'test', undefined)
    Assert.equals('setOp undefined nothing', '>', xmlFilter2.getFilter(0).attrs['test'].op);

    xmlFilter2.setAttrValue(0, 'test','')
    Assert.equals('setValue empty string ', '', xmlFilter2.getFilter(0).attrs['test'].value);
    xmlFilter2.setAttrValue(0, 'test', null)
    Assert.equals('setValue null nothing', '', xmlFilter2.getFilter(0).attrs['test'].value);
    xmlFilter2.setAttrValue(0, 'test', undefined)
    Assert.equals('setValue undefined nothing', '', xmlFilter2.getFilter(0).attrs['test'].value);

    var xmlFilter3 = new XMLFilter();
    xmlFilter3.setStack(0, []);
    Assert.equals('setStack empty stack:', [], xmlFilter3.getFilter(0).stack);
    Assert.equals('setStack empty length', 1, xmlFilter3.filterList.length);
    xmlFilter3.emptyFilter();
    Assert.equals('setStack empty length', 0, xmlFilter3.filterList.length);
    xmlFilter3.setStack(0, null);
    Assert.equals('setStack null stack:', [], xmlFilter3.getFilter(0).stack);
    Assert.equals('setStack null length', 1, xmlFilter3.filterList.length);
    xmlFilter3.emptyFilter();
    Assert.equals('setStack empty length', 0, xmlFilter3.filterList.length);
    xmlFilter3.setStack(0, undefined);
    Assert.equals('setStack undefined stack:', [], xmlFilter3.getFilter(0).stack);
    Assert.equals('setStack undefined length', 1, xmlFilter3.filterList.length);
    xmlFilter3.emptyFilter();
    Assert.equals('setStack empty length', 0, xmlFilter3.filterList.length);
    xmlFilter3.setStack(0, 1);
    Assert.equals('setStack int stack:', [], xmlFilter3.getFilter(0).stack);
    Assert.equals('setStack int length', 1, xmlFilter3.filterList.length);
    xmlFilter3.deleteFilter(0);
    Assert.equals('setStack empty length', 1, xmlFilter3.filterList.length);
    xmlFilter3.setStack(0, 'toto');
    Assert.equals('setStack string stack:', [], xmlFilter3.getFilter(0).stack);
    Assert.equals('setStack string length', 1, xmlFilter3.filterList.length);

    xmlFilter3.emptyFilter();
    Assert.equals('setStack delete length', 0, xmlFilter3.filterList.length);
    xmlFilter3.setStack(0, [{}]);
    Assert.equals('setStack array object empty length', 1, xmlFilter3.filterList.length);
    xmlFilter3.setStack(0, ['root', 'node', 'leaf']);
    Assert.equals('setStack array length', 1, xmlFilter3.filterList.length);
    Assert.equals('setStack string array stack:', ['root', 'node', 'leaf'], xmlFilter3.getFilter(0).stack);
    xmlFilter3.setStack(0, [1, ['a', 'b'], [4, 'R', ['p', 5]], 'leaf']);
    Assert.equals('setStack strange array stack:', ['1', 'a,b', '4,R,p,5', 'leaf'], xmlFilter3.getFilter(0).stack);
    xmlFilter3.setStack(0, [{tag:'root', obj:{name:'test', type:'type0'}, i:5}, {tag:'root', obj:{name:'test', type:'type0'}, i:5}]);
    Assert.equals('setStack object array stack:', ['[object Object]', '[object Object]'], xmlFilter3.getFilter(0).stack);


    var xmlFilter4 = new XMLFilter()
    xmlFilter4.setStack(0, ['root', 'node1', 'node2', 'leaf' ]);
    xmlFilter4.setStack(1, ['root', 'node', 'node2', 'leaf']);
    xmlFilter4.setStack(6, ['root', 'node1', 'node2', 'leaf1']);
    xmlFilter4.setStack(4, ['root', 'node1', 'node2', 'leaf1']);
    xmlFilter4.setStack(2, ['root', 'node1', 'leaf']);
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
    Assert.equals('samePlace lenght false', false, result)
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

    result = XMLFilter.match('test','=', 'test')
    Assert.equals('match string =', true, result)
    result = XMLFilter.match('test1','=', 'test')
    Assert.equals('match string =', false, result)

    result = XMLFilter.match('test', '!=', 'test1')
    Assert.equals('match string !=', true, result)
    result = XMLFilter.match('test', '!=', 'test')
    Assert.equals('match string !=', false, result)


    result = XMLFilter.match('0', '!=', 0)
    Assert.equals('match  "0"!=0', true, result)
    result = XMLFilter.match('0', '=', 0)
    Assert.equals('match  "0"=0', false, result)

    result = XMLFilter.match(0, '<', 0)
    Assert.equals('match int 0 < 0', false, result)
    result = XMLFilter.match(1, '<', 0)
    Assert.equals('match int 1 < 0', false, result)
    result = XMLFilter.match(0, '<', 1)
    Assert.equals('match int 0 < 1', true, result)

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


    console.log('===End Test XMLFilter class===');


  }

}
