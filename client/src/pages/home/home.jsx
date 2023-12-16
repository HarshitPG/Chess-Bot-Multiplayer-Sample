import React, { useEffect, useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import axios from "axios";

function Home() {
  const [data, setData] = useState({});

  useEffect(() => {
    axios
      .get("http://127.0.0.1:5000/api/data")
      .then((response) => {
        setData(response.data);
      })
      .catch((error) => {
        console.error(error);
      });
  }, []);

  return (
    <div className="App">
      <h1>React App</h1>
      <p>Message from Flask: {data.message}</p>
      <NavLink to="/PlayWithAI" className="">
        <button className="">Play vs AI</button>
      </NavLink>
      <NavLink to="/MultiPlayer" className="">
        <button className="">Play vs Friend</button>
      </NavLink>
    </div>
  );
}

export default Home;
