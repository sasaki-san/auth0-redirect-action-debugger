import { useAuth0 } from "@auth0/auth0-react";
import { useEffect } from "react";

export default function AutoLogin({ search }: { search: string }) {

  const { loginWithRedirect } = useAuth0();

  useEffect(() => {
    loginWithRedirect({
      appState: {
        returnTo: `${window.location.origin}/${search}`
      }
    });
  }, []);
  return null
}
