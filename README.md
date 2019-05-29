# RemoteData

## Introduction
`RemoteData` is an Algebra meant to represent any fetched data,
as such it streamline interaction with a fetched data in any of the following state, `NotAsked`, `Loading`, `Failure`, `Success`.

This allow you to interact safely with all those state without having to write multiple conditionnal branch tourought your code.

## Example

Imagine that our application rely on a webservice that provide us with a list of elements, and that our job is to both store the number of element in the application state for future usage, and display it.

```javascript
// TODO

```

## How to use
The different algebras used can be used in the following fashion:
Using the instance method
```javascript
const stringLength = string => string.length;
success('abc').map(stringLength)
// => Success(3)
```

The provided map implementation
```javascript
remoteData.map(success('abc'), stringLength);
// => Success(3)
```

Or any fantasyland complient library
```javascript
import map from 'ramda/map';
map(success('abc'), stringLength);
// => Success(3)
```

# API

## Functor
The functor interface allow you to map over the `Success` value of `RemoteData`.

```javascript
const stringLength = string => string.length;
remoteData.map(success('abc'), stringLength);
// => Success(3)
remoteData.map(failure('xyz'), stringLength);
// => Failure('xyz')
remoteData.map(loading(), stringLength);
// => Loading()
remoteData.map(notAsked(), stringLength);
// => NotAsked()
```

## Apply
The apply interface allow you to safely apply RemoteData value to another one
```javascript
const f = (s1: string, s2: string) => `${s1}${s2}`;
success('abc').map(f).ap(success('def'));
// => success('abcdef')
success('abc').map(f).ap(failure('xyz'));
// => failure('xyz');
success('abc').map(f).ap(loading());
// => loading();
success('abc').map(f).ap(notAsked());
// => notAsked();
```

You can note a pattern here that will apply to many function down this documentation.
when composing with multiple `RemoteData` the following rules apply in order:
- only if all are `success`, the result is a `success`.
- if one is in `failure`, the result is a `failure`.
- the first `failure` will be used to generate the end result `failure`.
- if one is `loading`, the result is a `loading`.
- if one is `notAsked`, the result is `notAsked`.

`Apply` is a very interesting tool from wich you can implement many usefull function.
Append
```javascript
const append = (remoteData1, remoteData2) => 
    remoteData1.map(value1 => value2 => [value1, value2]).ap(remoteData2);
append(success('abc'), success('def'));
// => success(['abc', 'def'])
append(success('abc'), failure('xyz'));
// => failure('xyz')
```
Map2
```javascript
const f = s1 => s2 => `${s1}${s2}`;
const map2 = (f, remoteData1, remoteData2) =>
    ap(remoteData1.map(f), remoteData2);

map2(f, success('abc'), success('def'));
// => success('abcdef')
map2(f, success('abc'), failure('xyz'));
// => failure('xyz')
```



