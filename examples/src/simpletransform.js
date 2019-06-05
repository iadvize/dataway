import React, { useState, useEffect } from "react";
import { notAsked, loading, failure, success } from "dataway";

const display = data => <span>{data}</span>;

const SimpleTransform = () => {
  const [data, setData] = useState(notAsked());
  useEffect(() => {
    setData(loading());
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
  return data
    .map(val => val.length)
    .fold(
      <span>Not loaded</span>,
      <span>Loading</span>,
      error => <span>{error}</span>,
      display
    );
};

export default SimpleTransform;
