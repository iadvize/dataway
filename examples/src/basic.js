import React, { useState, useEffect } from "react";
import { notAsked, loading, failure, success, fold } from "dataway";

const display = data => (
  <table>
    <thead>
      <tr>
        <td>ID</td>
        <td>USERID</td>
        <td>TITLE</td>
      </tr>
    </thead>
    <tbody>
      {data.map(post => (
        <tr key={post.id}>
          <td>{post.id}</td>
          <td>{post.userId}</td>
          <td>{post.title}</td>
        </tr>
      ))}
    </tbody>
  </table>
);

const Basic = () => {
  const [data, setData] = useState(notAsked);
  useEffect(() => {
    setData(loading);
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
          .then(json => setData(success(json)))
          .catch(error => setData(failure(error))),
      2000
    );
  }, []);
  return fold(
    () => <span>Not loaded</span>,
    () => <span>Loading</span>,
    error => <span>{error}</span>,
    display,
  )(data);
};

export default Basic;
