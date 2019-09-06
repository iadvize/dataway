import React, { useState, useEffect } from 'react';
import { notAsked, loading, failure, success, fold, map2 } from 'dataway';

const display = data => (
  <table>
    <thead>
      <tr>
        <td>ID</td>
        <td>USERNAME</td>
        <td>TITLE</td>
      </tr>
    </thead>
    <tbody>
      {data.map(post => (
        <tr key={post.id}>
          <td>{post.id}</td>
          <td>{post.username}</td>
          <td>{post.title}</td>
        </tr>
      ))}
    </tbody>
  </table>
);

const mergePostUsers = posts => users => {
  return posts.map(post => {
    return { ...users.find(user => user.id === post.userId), ...post };
  });
};

const CodependantData = () => {
  const [posts, setPosts] = useState(notAsked);
  const [users, setUsers] = useState(notAsked);
  useEffect(() => {
    setPosts(loading);
    setUsers(loading);
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
          .then(json => setPosts(success(json)))
          .catch(error => setPosts(failure(error))),
      1000,
    );
    setTimeout(
      () =>
        fetch('https://jsonplaceholder.typicode.com/users')
          .then(response => {
            if (response.ok) {
              return response.json();
            } else {
              return Promise.reject(
                `Request rejected with status ${response.status}`,
              );
            }
          })
          .then(json => setUsers(success(json)))
          .catch(error => setUsers(failure(error))),
      2000,
    );
  }, []);
  return fold(
    () => <span>Not loaded</span>,
    () => <span>Loading</span>,
    error => <span>{error}</span>,
    display,
  )(map2(mergePostUsers)(posts, users));
};

export default CodependantData;
