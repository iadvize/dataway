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
