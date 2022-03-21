import React from "react";
import { withAuthenticator } from "@aws-amplify/ui-react";
import { Route, useNavigate } from "react-router-dom";

function LoginTest({ user }) {
  const navigate = useNavigate();
  console.log("LoginTest");
  return (
    <React.Fragment>
      <h1>Welcome {user.username}!</h1>
      <button onClick={() => navigate("/")}>Go to blog page</button>
    </React.Fragment>
  );
}

export default withAuthenticator(LoginTest);
