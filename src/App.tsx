import React, {useEffect, useState} from 'react';
import axios from "axios";
import './App.css';

const CLIENT_ID = process.env.REACT_APP_CLIENT_ID;
const REDIRECT_URI = process.env.REACT_APP_REDIRECT;
const SCOPE = process.env.REACT_APP_SCOPE;

const App: React.FC = () => {

  const [rerender, setRerender] = useState<boolean>(false);
  const [user, setUser] = useState<any>({});

  useEffect(() => {
    const queryString = window.location.search;
    const urlParams = new URLSearchParams(queryString);
    const code = urlParams.get("code");
    
    if (code && (localStorage.getItem("accessToken") === null)) {
      getAccessToken(code);
    } else if (localStorage.getItem("accessToken")) {
      getUserData();
    }

  }, []);

  const handleGitHubLogin = () => {
    window.location.href = `https://github.com/login/oauth/authorize?client_id=${CLIENT_ID}&redirect_uri=${REDIRECT_URI}&scope=${SCOPE}`;
  };

  const getAccessToken = async (code: string) => {
    try {
      const response = await axios.get(`http://localhost:4000/getAccessToken?code=${code}`);
      console.log("access_token:", response);
      if (response.data.access_token) {
        localStorage.setItem("accessToken", response.data.access_token);
        await getUserData();
        setRerender(!rerender);
      }
    } catch (error) {
      console.log("Error:", error);
    }
  }

  const getUserData = async () => {
    try {
      const response = await axios.get("http://localhost:4000/getUserData", {
        headers: {
          "Authorization": `Bearer ${localStorage.getItem("accessToken")}`
        }
      });
      console.log("user data:", response)
      setUser(response.data);
    } catch (error) {
      console.log("Error:", error);
    }
  }

  const getUserRepositories = async () => {
    try {
      const response = await axios.get("https://api.github.com/user/repos", {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
            Accept: "application/vnd.github.v3+json",
          },
        });
      console.log("User repos:", response.data)
    } catch (error) {
      console.log("Error:", error);
    }
  }

  const handleGitHubLogout = () => {
    localStorage.removeItem("accessToken");
    setRerender(!rerender);
    setUser({});
  } 

  return (
    <div className="App">
      <header className="App-header">
        {localStorage.getItem("accessToken") 
          ? <>
            <h3>Bienvenido {user.login}</h3>
            <button onClick={getUserRepositories}>
              Get Repositories
            </button>
            <button onClick={handleGitHubLogout}>
              Log Out
            </button>
            </>
          : <>
            <h3>Login</h3>
            <button onClick={handleGitHubLogin}>
              Login with GitHub
            </button>
            </>
        }   
      </header>
    </div>
  );
}

export default App;
