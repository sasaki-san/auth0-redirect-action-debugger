import { TextFieldProps } from '@mui/material/TextField';
import Button from '@mui/material/Button';
import { useAuth0 } from "@auth0/auth0-react";

export default function Authorize(props: TextFieldProps) {

  const { loginWithRedirect } = useAuth0();

  const handleAuthenticateClick = async () => {
    try {
      const result = await loginWithRedirect()
      console.log(result)
    } catch (e) {
      console.log(e)
    }
  }

  return (
    <Button variant="contained" color='secondary' fullWidth onClick={handleAuthenticateClick}>Authenticate</Button>
  )
}
