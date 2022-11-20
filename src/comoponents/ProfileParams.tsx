import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import CodeAsJson from './CodeAsJson';
import React from 'react';
import { ProfileState } from '../App';
import CodeTextField from './CodeTextField';
import { Auth0Provider } from "@auth0/auth0-react";
import Authorize from './Authorize';

interface ProfileProps extends ProfileState {
  onInputUpdated: (clientId: string) => void
}

const ProfileParams = (props: ProfileProps) => {
  const { clientId, domain, onInputUpdated } = props
  console.log(domain, clientId)

  const handleClientIdChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    onInputUpdated(
      event.target.value
    )
  }

  return (
    <Box sx={{ width: '100%' }}>
      <Stack spacing={2}>
        <Typography variant="h4" color="text.secondary" gutterBottom>
          User Profile
        </Typography>
        <CodeTextField id="clientId" label="Client ID" variant="outlined" fullWidth value={clientId} onChange={handleClientIdChange} />
        <CodeAsJson title="Token" value={JSON.stringify({}, null, 4)} />
        <Auth0Provider clientId={clientId} domain={domain}>
          <Authorize />
        </Auth0Provider>
      </Stack>
    </Box>
  )
}

export default ProfileParams
