# Dataway

## Installation

`npm install dataway`

`yarn add dataway`

## Introduction

`Dataway` is an Algebra meant to represent any fetched data,
as such it streamline interaction with a fetched data in any of the following state, `NotAsked`, `Loading`, `Failure`, `Success`.

This allow you to interact safely with all those state without having to write multiple conditionnal branch tourought your code.

## Example

Imagine that our application rely on a webservice that provide us with a list of elements, and that our job is to both store the number of element in the application state for future usage, and display it.

```javascript
import { dataway } from 'dataway';

// setup you initial state
let asyncValue = dataway.notAsked();

function loadBlogPosts() {
  asyncValue = dataway.loading();
  fetch('/blogposts')
    .then(function(response) {
      if (response.ok) {
        try {
          return response.json();
        } catch (error) {
          throw new Error('Response format was not ok.');
        }
        asyncValue = dataway.success(response);
      } else {
        throw new Error('Network response was not ok.');
      }
    })
    .then(function(values) {
      asyncValue = dataway.success(values);
    })
    .catch(function(error) {
      asyncvalue = dataway.failure(error);
    });
}

asyncvalue
  // when working with the value you can safely ignore the real status of the value
  .map(function(blogposts) {
    return blogposts.length;
  })
  // when releasing the value you must handle all four cases
  .fold(
    'Number of blog posts not loaded',
    'Number of blog posts loading',
    function(error) {
      `Number of blog posts can't be shown because : ${error}`;
    },
    function(value) {
      return `There is ${value} blogposts`;
    },
  );
```

## How to use

The different algebras used can be used in the following fashion:
Using the instance method

```javascript
const stringLength = string => string.length;
success('abc').map(stringLength);
// => Success(3)
```

The provided map implementation

```javascript
dataway.map(success('abc'), stringLength);
// => Success(3)
```

Or any fantasyland complient library

```javascript
import map from 'ramda/map';
map(success('abc'), stringLength);
// => Success(3)
```

# API

## Fold

At some point you will want to pull the trigger and use the values tucked inside,
but since we want you to have a safe code, you will have to provide handler for each case.

The following example could be used with react.

```javascript
dataway
  .map(success('abc'), stringLength)
  .fold(
    () => <NoData />,
    () => <Pending />,
    error => <Failure error={error} />,
    data => <span>{data}</span>,
  );
```

## Functor

The functor interface allow you to map over the `Success` value of `Dataway`.

```javascript
const stringLength = string => string.length;
dataway.map(success('abc'), stringLength);
// => Success(3)
dataway.map(failure('xyz'), stringLength);
// => Failure('xyz')
dataway.map(loading(), stringLength);
// => Loading()
dataway.map(notAsked(), stringLength);
// => NotAsked()
```

## Apply

The apply interface allow you to safely apply Dataway value to another one

```javascript
const f = (s1: string, s2: string) => `${s1}${s2}`;
success('abc')
  .map(f)
  .ap(success('def'));
// => success('abcdef')
success('abc')
  .map(f)
  .ap(failure('xyz'));
// => failure('xyz');
success('abc')
  .map(f)
  .ap(loading());
// => loading();
success('abc')
  .map(f)
  .ap(notAsked());
// => notAsked();
```

You can note a pattern here that will apply to many function down this documentation.
when composing with multiple `Dataway` the following rules apply in order:

- only if all are `success`, the result is a `success`.
- if one is in `failure`, the result is a `failure`.
- the first `failure` will be used to generate the end result `failure`.
- if one is `loading`, the result is a `loading`.
- if one is `notAsked`, the result is `notAsked`.

`Apply` is a very interesting tool from wich you can implement many usefull function.
Append

```javascript
const append = (dataway1, dataway2) =>
  dataway1.map(value1 => value2 => [value1, value2]).ap(dataway2);
append(success('abc'), success('def'));
// => success(['abc', 'def'])
append(success('abc'), failure('xyz'));
// => failure('xyz')
```

Map2

```javascript
const f = s1 => s2 => `${s1}${s2}`;
const map2 = (f, dataway1, dataway2) => ap(dataway1.map(f), dataway2);

map2(f, success('abc'), success('def'));
// => success('abcdef')
map2(f, success('abc'), failure('xyz'));
// => failure('xyz')
```

## Chain

The chain function is usefull for applying one or many computation that may fail.
A good example of that is validating the content of `Dataway`
```javascript
const data = success([{}, {}, {}]);
data
  .chain(value =>
    Array.isArray(value) ? success(value) : failure('should be an array'),
  )
  .chain(value =>
    value[0] !== undefined ? success(value) : failure('should not be empty'),
  );
// => success([{}, {}, {}])
```

# FAQ
