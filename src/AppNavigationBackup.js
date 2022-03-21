import { Amplify } from "aws-amplify";
import React, { Component } from "react";
import {
  Link,
  BrowserRouter as Router,
  Route,
  Routes,
  Redirect,
} from "react-router-dom";

import { Authenticator, useAuthenticator } from "@aws-amplify/ui-react";
import "@aws-amplify/ui-react/styles.css";

import awsExports from "./aws-exports";
import Home from "./Home";

Amplify.configure(awsExports);

const Login = () => <Authenticator />;

const HeaderLinks = (props) => (
  <ul>
    <li>
      <Link to="/">Home</Link>
    </li>
    <li>
      <Link to="/auth">Create Account/Login</Link>
    </li>
  </ul>
);

function AuthFunction() {
  return (
    <Authenticator>
      {({ signOut, user }) => (
        <main>
          <h1>Hello {user.username}</h1>
          <button onClick={signOut}>Sign out</button>
        </main>
      )}
    </Authenticator>
  );
}

const MyRoutes = ({ authState }) => {
  <Routes authState={this.state.isLoggedIn}>
    <Route exact path="/Home" element={<Home />} props={authState} />
    <Route exact path="/auth" element={<AuthFunction />} />
  </Routes>;
};

class App extends Component {
  state = {
    authState: {
      isLoggedIn: false,
    },
  };
  render() {
    return (
      <div className="App">
        <h1> Amplify Routes Example</h1>
        <HeaderLinks />
        <MyRoutes />
      </div>
    );
  }
}

const AppNavigation = () => (
  <Authenticator.Provider>
    <Router>
      <App />
    </Router>
  </Authenticator.Provider>
);

export default AppNavigation;

/*
function App() {
  const { route } = useAuthenticator((context) => [context.route]);
  return <Home />;
  //  return route === "authenticated" ? <Home /> : <Login />;
}

export default function AppNavigation() {
  return (
    <Authenticator.Provider>
      <App></App>
    </Authenticator.Provider>
  );
}
*/
