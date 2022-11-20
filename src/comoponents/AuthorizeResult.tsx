import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { AuthorizeState } from '../App';
import CodeAsJson from './CodeAsJson';
import { useAuth0 } from "@auth0/auth0-react";
import { useEffect } from 'react';

interface Props extends AuthorizeState {
  onInputUpdated: (authorizedResult: object, error?: Error) => void
}

export default function AuthorizeResult(props: Props) {

  const { authorizeResult, error, onInputUpdated } = props
  const { getAccessTokenSilently } = useAuth0();

  useEffect(() => {
    getAccessTokenSilently({
      detailedResponse: true
    }).then(result => {
      onInputUpdated(result, undefined)
    }).catch(error => {
      onInputUpdated({}, error)
    })
  }, [])

  return (
    <Box sx={{ width: '100%' }}>
      <Stack spacing={2}>
        <Typography variant="h4" color="text.secondary" >
          Result
        </Typography>
        <CodeAsJson title="Response" error={!!error}
          value={error ? JSON.stringify(error, null, 2) : authorizeResult ? JSON.stringify(authorizeResult, null, 2) : "No result"} />
      </Stack>
    </Box>
  )
}
