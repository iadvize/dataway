# Dataway

## Installation

```
npm install dataway
```

```
yarn add dataway
```

[API documentation](https://iadvize.github.io/dataway/)

## Introduction

`Dataway` is a datastructure representing the four possible states of a remote datasource fetching result.
* The remote datasource was NotAsked but eventually will be
* The remote datasource is Loading
* The remote datasource fetching has been a Success and a value was retrieved
* The remote datasource fetching ended up in a Failure and some error information was collected

This aims to solve a classic data management issue often handled either through booleans or complex, unwanted and polluted states. With one entry point and only 4 strongly-typed states, remote data handling becomes much cleaner.

Dataway also provides a great api to manipulate, transform and aggregate Dataway values in a safe and optimistic way. This reduces bug and crash occurence while making your code simpler to read.

## Example

Imagine that our application relies on a webservice that provides us with a list of elements, and that our job is to both store the number of elements in the application state for future usage and to display it.

[Open in codesandbox.io](https://codesandbox.io/embed/dataway-basic-example-5eeh8?fontsize=14&module=%2Fsrc%2Findex.js)
```typescript
import { fold, notAsked, loading, failure, success } from "dataway";
import stateManager from "./statemanager";

const appElement = document.getElementById("list");
const loadButton = document.getElementById("load-button");

const view = state => {
  appElement.innerHTML = fold(
    () => "<p>Click on the load button</p>",
    () => "<p>Loading</p>",
    error => `<p>something wrong did happen : ${error}</p>`,
    success => `<ul>${success.map(post => `<li>${post.title}</li>`)}</ul>`
  )(state);
};

const setState = stateManager(view, notAsked);

loadButton.onclick = event => {
  setState(loading);
  setTimeout(
    () =>
      fetch("https://jsonplaceholder.typicode.com/posts")
        .then(response => {
          if (response.ok) {
            return response.json();
          } else {
            return Promise.reject(
              `Request rejected with status ${response.status}`
            );
          }
        })
        .then(json => setState(success(json)))
        .catch(error => setState(failure(error))),
    2000
  );
};

```

## How to use

First you have to create some `Dataway` values using `notAsked`, `loading`, `failure(error)`, `success(value)`

```javascript
import { notAsked, failure, success } from 'dataway'

const foo = success('Mr Wilson');

const bar = failure('any suited error value');

const baz = notAsked;
```
[test on runkit](https://runkit.com/cateland/how-to-use-1)

Then we can use the provided `map` api to apply a function on any `Success` variance of `Dataway`, wrapping automatically the result in a new `Success`.

If the provided variance of `Dataway` is not a `Success`, it will be returned without change, and without executing the function.

As a developper it means you do not have to check for `Dataway` variance before applying a function to its `Success` value.

```javascript
const { notAsked, failure, success, map } = require('dataway');

map(value => value.toUpperCase())(success('Mr Wilson'));
// => Success "MR WILSON"

map(value => value.toUpperCase())(failure('any suited error value'));
// => Failure "any suited error value"

map(value => value.toUpperCase())(notAsked);
// => NotAsked
```
[test on runkit](https://runkit.com/cateland/how-to-use-2)

Rewrapping the transformed value in a `Success` or returning the other variance untouched, allows to transform a `Dataway` value in multiple distinct step wihout risking runtime error due to unexistant values (`null | undefined`) while keeping the variance of `Dataway` intact.

```javascript
const { notAsked, success, map } = require('dataway');

const upperCasedSuccess = map(value => value.toUpperCase())(success('Mr Wilson'));
map(value => value.split(' '))(upperCasedSuccess);
// => Success ['MR', 'WILSON']

const foo = map(value => value.toUpperCase())(notAsked);
map(value => value.split(' '))(foo);
// => NotAsked
```
[test on runkit](https://runkit.com/cateland/how-to-use-3)

To extract and use the `Success` value you must use the `fold` API.
The following example illustrates how this forces you to consider the four different UIs each state implies.

```javascript
const { success, failure, notAsked, loading, map, fold } = require('dataway');

// => Success ['MR', 'WILSON']
const render = dataway => fold(
  () => "<p>Click on the load button</p>",
  () => "<p>Loading</p>",
  error => `<p>something wrong did happen : ${error}</p>`,
  success => `<p>${success}</p>`
)(dataway);

render(success('Mr Wilson'));
// => <p>Mr Wilson</p>
render(failure('Ooops failed to fetch Mr Wilson data'));
// => <p>something wrong did happen : Ooops failed to fetch Mr Wilson data</p>
render(notAsked);
// => '<p>Click on the load button</p>'
render(loading);
// => '<p>Loading</p>'
```
[test on runkit](https://runkit.com/cateland/how-to-use-4)

This is really great to easily create consistent UIs.

## TL;DR
`Dataway` offers a rich API to aggregate multiple "dataways" or to handle computation failure on your dataway values.

`Dataway` is written in typescript with thoughtful type description, enabling you to use it in a typescript environnement without hassle while keeping great type safety.

`Dataway` also offers compatibility with great libraries such as [Ramda](https://ramdajs.com), and [fp-ts](https://gcanti.github.io/fp-ts/)

You can check and play with several examples
* [Basic example](https://codesandbox.io/embed/dataway-basic-example-5eeh8?fontsize=14&module=%2Fsrc%2Findex.js)
* [Map example](https://codesandbox.io/embed/dataway-basic-transformation-zj1th?fontsize=14&module=%2Fsrc%2Findex.js)
* [Aggregation example](https://codesandbox.io/embed/dataway-two-remote-source-yopzb?fontsize=14&module=%2Fsrc%2Findex.js)
* [Validation Example](https://codesandbox.io/embed/dataway-validation-and-transformation-dhftw?fontsize=14&module=%2Fsrc%2Findex.js)

[API docs](https://iadvize.github.io/dataway/docs)
