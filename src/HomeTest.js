import React from "react";
import { Authenticator, useAuthenticator } from "@aws-amplify/ui-react";
import userEvent from "@testing-library/user-event";

function IsAuthenticated() {
  const { route } = useAuthenticator((context) => [context.route]);
  return route === "authenticated";
}

function HomeTest() {
  console.log("HomeTest> IsAuthenticated: " + IsAuthenticated());
  const { user, signOut } = useAuthenticator((context) => [context.user]);

  if (IsAuthenticated()) {
    return (
      <React.Fragment>
        Welcome authenticated user {user.username}!
        <button onClick={signOut}>Sign Out</button>
      </React.Fragment>
    );
  }

  return <div>This is the HomeTest page</div>;
}

export default HomeTest;
