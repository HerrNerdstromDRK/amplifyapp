import React from "react";
import { withAuthenticator } from "@aws-amplify/ui-react";
import { Route, useNavigate } from "react-router-dom";

/**
 * Use a separate function, encapsulated in a separate page, with the
 * Authenticator HOC to facilitate logging in.
 * Had to put this in a separate navigation area because the Auth HOC
 * as part of the Home page required login, but the requirement is to
 * allow unauthenticated users to view the blog posts.
 * TODO: Find a way to avoid needing the intermediary page here once the
 * user authenticates.
 */
function Login({ user }) {
  const navigate = useNavigate();
  console.log("Login");
  return (
    <React.Fragment>
      <h1>Welcome {user.username}!</h1>
      <button onClick={() => navigate("/")}>Go to blog page</button>
    </React.Fragment>
  );
}

export default withAuthenticator(Login);
