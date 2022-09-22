import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import CodeAsJson from './CodeAsJson';
import { useAuth0, withAuthenticationRequired } from "@auth0/auth0-react";
import CircularProgress from '@mui/material/CircularProgress';
import React, { useEffect } from 'react';

const ProfileComponent = () => {
  const { user, getAccessTokenSilently } = useAuth0();
  const [state, setState] = React.useState({
    user,
    errorMessage: ""
  })

  useEffect(() => {
    getAccessTokenSilently().then(result => {
      console.log(result)
    }).catch(e => {
      setState({
        user: undefined,
        errorMessage: `${e.error}: ${e.message}`
      })
    })
  }, [])

  return (
    <Box sx={{ width: '100%' }}>
      <Stack spacing={2}>
        <Typography variant="h4" color="text.secondary" gutterBottom>
          User Profile
        </Typography>
        <CodeAsJson title="Token" value={JSON.stringify(state.user || state.errorMessage, null, 4)} />
      </Stack>
    </Box>
  )
}

export default ProfileComponent

// export default withAuthenticationRequired(ProfileComponent, {
//   onRedirecting: () => <CircularProgress />,
// });
