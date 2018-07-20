import { XMLSelector } from '../XMLFilter/XMLSelector.js'
import { Assert } from'../class/Assert.js'

export class TestXMLSelector{
  static run(){
    console.log('===Test XMLSelector class===')

    Assert.equals('"0" === ""', false, "0"==='')
    Assert.equals('Number("")', 0, Number(''))
    Assert.equals('Number("0")', 0, Number('0'))

    var result
    result = XMLSelector.parseInput('true', 'bool')
    Assert.equals('parseInput "true"', true, result)
    result = XMLSelector.parseInput(true, 'bool')
    Assert.equals('parseInput "true"', '', result)
    result = XMLSelector.parseInput('true', 'string')
    Assert.equals('parseInput "true"', 'true', result)
    result = XMLSelector.parseInput('false', 'bool')
    Assert.equals('parseInput "false"', false, result)
    result = XMLSelector.parseInput(false, 'bool')
    Assert.equals('parseInput "false"', '', result)
    result = XMLSelector.parseInput('false', 'string')
    Assert.equals('parseInput "false"', 'false', result)

    result = XMLSelector.parseInput('NaN', 'number')
    Assert.equals('parseInput NaN number ', '', result)
    result = XMLSelector.parseInput('9.0', 'number')
    Assert.equals('parseInput "9.0" number', 9, result)
    result = XMLSelector.parseInput(0, 'number')
    Assert.equals('parseInput 0 number', '', result)
    result = XMLSelector.parseInput('', 'number')
    Assert.equals('parseInput "0" number', '', result)
    result = XMLSelector.parseInput('0.8', 'number')
    Assert.equals('parseInput 0.8 number', 0.8, result)
    result = XMLSelector.parseInput('10RT.8', 'number')
    Assert.equals('parseInput "10RT.8" number ','', result)
    result = XMLSelector.parseInput(undefined, 'number')
    Assert.equals('parseInput undefined number ', '', result)
    result = XMLSelector.parseInput(null, 'number')
    Assert.equals('parseInput null number', '', result)
    result = XMLSelector.parseInput('undefined ', 'number')
    Assert.equals('parseInput "undefined" number ', '', result)
    result = XMLSelector.parseInput('null', 'number')
    Assert.equals('parseInput "null" number ', '', result)
    result = XMLSelector.parseInput('', 'number')
    Assert.equals('parseInput "" number ', '', result)

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
