import { XMLSelector } from '../XMLFilter/XMLSelector.js'
import { Assert } from'../class/Assert.js'

export class TestXMLSelector{
  static run(){
    console.log('===Test XMLSelector class===')
    var result
    result = XMLSelector.parseInput('NaN', 'number')
    Assert.equals('parseInput NaN number isNaN', true, isNaN(result))
    result = XMLSelector.parseInput('9.0', 'number')
    Assert.equals('parseInput "9.0" number', 9, result)
    result = XMLSelector.parseInput(0, 'number')
    Assert.equals('parseInput 0 number', 0, result)
    result = XMLSelector.parseInput('0', 'number')
    Assert.equals('parseInput "0" number', 0, result)
    result = XMLSelector.parseInput('0.8', 'number')
    Assert.equals('parseInput 0.8 number', 0.8, result)
    result = XMLSelector.parseInput('10RT.8', 'number')
    Assert.equals('parseInput "10RT.8" number isNaN',true, isNaN(result))
    result = XMLSelector.parseInput(undefined, 'number')
    Assert.equals('parseInput undefined number isNaN', true, isNaN(result))
    result = XMLSelector.parseInput(null, 'number')
    Assert.equals('parseInput null number', true, isNaN(result))
    result = XMLSelector.parseInput('undefined isNaN', 'number')
    Assert.equals('parseInput "undefined" number isNaN', true, isNaN(result))
    result = XMLSelector.parseInput('null', 'number')
    Assert.equals('parseInput "null" number isNaN', true, isNaN(result))
    result = XMLSelector.parseInput('', 'number')
    Assert.equals('parseInput "" number isNaN', true,isNaN(result))

    result = XMLSelector.parseInput(undefined, 'text')
    Assert.equals('parseInput undefined text', '', result)
    result = XMLSelector.parseInput(null, 'text')
    Assert.equals('parseInput null text', '', result)
    result = XMLSelector.parseInput('undefined', 'text')
    Assert.equals('parseInput "undefined" text', 'undefined', result)
    result = XMLSelector.parseInput('null', 'text')
    Assert.equals('parseInput "null" text', 'null', result)
    result = XMLSelector.parseInput('NaN', 'text')
    Assert.equals('parseInput "NaN" text', 'NaN', result)

    result = XMLSelector.parseInput(undefined, 'email')
    Assert.equals('parseInput undefined email', '', result)
    result = XMLSelector.parseInput(null, 'email')
    Assert.equals('parseInput null email', '', result)
    result = XMLSelector.parseInput('undefined', 'email')
    Assert.equals('parseInput "undefined" email', 'undefined', result)
    result = XMLSelector.parseInput('null', 'email')
    Assert.equals('parseInput "null" email', 'null', result)
    result = XMLSelector.parseInput('NaN', 'email')
    Assert.equals('parseInput "NaN" email', 'NaN', result)

    console.log('===End Test XMLSelector class===');

  }

}
