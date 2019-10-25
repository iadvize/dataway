import React, { useState, useEffect } from 'react';
import { notAsked, loading, failure, success, fold, map } from 'dataway';

const displayPost = clickHandle => post => {
  return (
    <tr key={post.id}>
      <td>{post.id}</td>
      <td>{post.userId}</td>
      <td>{post.title}</td>
      <td>
        <button onClick={() => clickHandle(post.id)}>reload</button>
      </td>
    </tr>
  );
};

const display = clickHandle => data => {
  return (
    <table>
      <thead>
        <tr>
          <td>ID</td>
          <td>USERID</td>
          <td>TITLE</td>
        </tr>
      </thead>
      <tbody>
        {Object.entries(data).map(([_, post]) =>
          fold(
            () => <tr>'not asked'</tr>,
            () => <tr>'loading'</tr>,
            error => <tr>{error}</tr>,
            displayPost(clickHandle),
          )(post),
        )}
      </tbody>
    </table>
  );
};

const NestedData = () => {
  const [posts, setPosts] = useState(notAsked);
  const [load, setload] = useState(undefined);
  useEffect(() => {
    setPosts(loading);
    setTimeout(
      () =>
        fetch('https://jsonplaceholder.typicode.com/posts')
          .then(response => {
            if (response.ok) {
              return response.json();
            } else {
              return Promise.reject(
                `Request rejected with status ${response.status}`,
              );
            }
          })
          .then(json => {
            setPosts(
              success(
                json.reduce(function(map, obj) {
                  map[obj.id] = success(obj);
                  return map;
                }, {}),
              ),
            );
          })
          .catch(error => setPosts(failure(error))),
      1000,
    );
  }, []);
  useEffect(() => {
    if (load) {
      setload(undefined);
      setPosts(map(data => ({ ...data, ...{ [load]: loading } }))(posts));
      setTimeout(
        () =>
          fetch(`https://jsonplaceholder.typicode.com/posts/${load}`)
            .then(response => {
              if (response.ok) {
                return response.json();
              } else {
                return Promise.reject(
                  `Request rejected with status ${response.status}`,
                );
              }
            })
            .then(json => {
              setPosts(
                map(data => ({ ...data, ...{ [load]: success(json) } }))(posts),
              );
            })
            .catch(error =>
              setPosts(
                map(data => ({ ...data, ...{ [load]: failure(error) } }))(
                  posts,
                ),
              ),
            ),
        1000,
      );
    }
  }, [posts, load]);
  return fold(
    () => <span>Not loaded</span>,
    () => <span>Loading</span>,
    error => <span>{error}</span>,
    display(setload),
  )(posts);
};

export default NestedData;
