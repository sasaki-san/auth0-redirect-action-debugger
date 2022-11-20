import Button from '@mui/material/Button';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { AuthorizeState } from '../App';
import CodeTextField from './CodeTextField';
import { AuthorizingState } from '..';

interface Props extends AuthorizeState {
  onInputUpdated: (clientId: string, redirect_uri: string, scope: string, audience: string, authorizedResult: object, error: any) => void
}

export default function Authorize(props: Props) {

  const { domain, clientId, redirect_uri, scope, audience, onInputUpdated } = props

  const handleAuthorize = async () => {
    sessionStorage.setItem("authorizingState", JSON.stringify({ ...props, search: window.location.search } as AuthorizingState))
    window.location.replace(`${window.location.origin}/authorizing`)
  }

  const handleParamClientIdChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    onInputUpdated(
      event.target.value,
      redirect_uri,
      scope,
      audience,
      {},
      undefined
    )
  };

  const handleParamScopeChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    onInputUpdated(
      clientId,
      redirect_uri,
      event.target.value,
      audience,
      {},
      undefined
    )
  };

  const handleParamRedirectUriChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    onInputUpdated(
      clientId,
      event.target.value,
      scope,
      audience,
      {},
      undefined
    )
  };

  const handleParamAudienceChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    onInputUpdated(
      clientId,
      redirect_uri,
      scope,
      event.target.value,
      {},
      undefined
    )
  };

  return (
    <Box sx={{ width: '100%' }}>
      <Stack spacing={2}>
        <Typography variant="h4" color="text.secondary" >
          Authorize Parameters
        </Typography>
        <CodeTextField autoFocus id="domainParamKey" label="Domain" variant="outlined" fullWidth value={domain} />
        <CodeTextField autoFocus id="clientIDParamKey" label="Client ID" variant="outlined" fullWidth value={clientId} onChange={handleParamClientIdChange} />
        <CodeTextField autoFocus id="scopeParamKey" label="Scope" variant="outlined" fullWidth value={scope} onChange={handleParamScopeChange} />
        <CodeTextField autoFocus id="audienceParamKey" label="Audience" variant="outlined" fullWidth value={audience} onChange={handleParamAudienceChange} />
        <CodeTextField autoFocus id="redirectUriParamKey" label="Redirect URI" variant="outlined" fullWidth value={redirect_uri} onChange={handleParamRedirectUriChange} />
        <Button variant="contained" color='secondary' fullWidth onClick={handleAuthorize}>Authorize</Button>
      </Stack>
    </Box>
  )
}
