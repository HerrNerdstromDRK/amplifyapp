import { Amplify } from "aws-amplify";

import { Authenticator, useAuthenticator } from "@aws-amplify/ui-react";
import "@aws-amplify/ui-react/styles.css";

import awsExports from "./aws-exports";
import Home from "./Home";

Amplify.configure(awsExports);

const Login = () => <Authenticator />;

function App() {
  const { route } = useAuthenticator((context) => [context.route]);
  return route === "authenticated" ? <Home /> : <Login />;
}

export default function AppNavigation() {
  return (
    <Authenticator.Provider>
      <App></App>
    </Authenticator.Provider>
  );
}
