import React, { useEffect } from 'react';
import './App.css';
import CssBaseline from '@mui/material/CssBaseline';
import Container from '@mui/material/Container';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { styled } from '@mui/material/styles';
import Paper from '@mui/material/Paper';
import Grid from '@mui/material/Unstable_Grid2';
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Toolbar from '@mui/material/Toolbar';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import Fab from '@mui/material/Fab';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import RedirectParams from './comoponents/RedirectParams';
import ContinueParams from './comoponents/ContinueParams';
import { decodeToken } from "react-jwt"
import { KJUR } from "jsrsasign"
import ScrollTop from './comoponents/ScrollTop';
import AuthorizeParams from './comoponents/AuthorizeParams';
import AuthorizeResult from './comoponents/AuthorizeResult';

const Item = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(1),
  color: theme.palette.text.secondary,
  boxShadow: "none",
}));

const darkTheme = createTheme({
  palette: {
    mode: "dark"
  },
  typography: {
    fontFamily: 'fakt-web,"Helvetica Neue",Helvetica,Arial,sans-serif',
  },
});

interface JwtStandardClaims {
  sub: string
  iat: number
  exp: number
  iss: string
}
interface Jwt extends JwtStandardClaims {
  [key: string]: any
}

export type SendDataFormat = 'none' | 'jwt' | 'form'

export enum Page {
  Main = 0,
  Authorize = 1
}

export interface AppState {
  currentPage: Page
}

export interface RedirectState {
  tokenKey: string
  tokenSecret: string
  token?: Jwt
  tokenKeyError: boolean,
  tokenSecretError: boolean
}
export interface ContinueState {
  dataFormat: SendDataFormat
  rawData: string
  rawDataError: boolean
  rawJwt: string
  rawJwtError: boolean
  data?: Jwt
  signingKey: string
  tokenParamKey: string
  sToken: string
  continueUrl: string,
}

export interface AuthorizeState {
  domain: string
  clientId: string
  redirect_uri: string
  scope: string
  audience: string
  authorizeResult: object
  error?: Error
}

export interface AppProps {
  search: string
  inAuth0Provider: boolean
}

const parseAuthorizeState = (item: string | null) => {
  return item ? JSON.parse(item) as AuthorizeState : null
}

export default function App(props: AppProps) {

  const { search, inAuth0Provider } = props

  sessionStorage.removeItem("authorizingState")

  const searchParams = new URLSearchParams(search);
  const state = searchParams.get("state")
  const queryParams = Array.from(searchParams.keys()).filter(key => key !== "state")
  const preFilledAuthorizeState = parseAuthorizeState(localStorage.getItem("authorizeState"))

  const getTokenPartValue = (tokenKey: string) => {
    let value: string | null = null
    try {
      value = searchParams.get(tokenKey)
    } catch { }
    return value
  }

  const getTokenValue = (tokenPart: string | null) => {
    let value: Jwt | undefined = undefined
    if (tokenPart) {
      try {
        value = decodeToken(tokenPart) as Jwt;
      } catch { }
    }
    return value
  }

  const testSecret = (tokenPart: string | null, tokenSecret: string | null) => {
    let value = false
    if (tokenPart && tokenSecret) {
      try {
        value = KJUR.jws.JWS.verifyJWT(tokenPart, tokenSecret, { alg: ['HS256'] });
      } catch { }
    }
    return value
  }

  const getInitialRawData = (originalToken?: JwtStandardClaims) => {
    const value = {
      sub: originalToken ? originalToken.sub : "TOKEN IS NULL",
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + 60 * 60,
      state
    } as Pick<Jwt, "sub" | "iat" | "exp">
    return JSON.stringify(value, null, 4)
  }

  const getDataToken = (rawData: string) => {
    let value: Jwt | undefined = undefined
    try {
      value = JSON.parse(rawData)
    } catch { }
    return value
  }

  const getFormData = (rawData: string) => {
    try {
      const lines = rawData.split("\n")
      if (lines.length === 0) {
        return
      }
    } catch { }
    return rawData
  }

  const getSignedDataToken = (data: Jwt | undefined, signingKey: string | undefined) => {
    let value: string = ""
    if (data && signingKey) {
      try {
        const sHeader = JSON.stringify({ alg: 'HS256', typ: 'JWT' });
        const sPayload = JSON.stringify(data);
        value = KJUR.jws.JWS.sign("HS256", sHeader, sPayload, signingKey);
      } catch { }
    }
    return value
  }

  const getContinueUrl = (tokenParamKey: string, sToken: string) => {
    const continueUrlHost = redirectState.token && redirectState.token.iss ? redirectState.token.iss : "INVALID_ISS_IN_TOKEN"
    const tokenParamQueryPart = sToken ? `&${tokenParamKey}=${sToken}` : ""
    const value = `https://${continueUrlHost}/continue?state=${state}${tokenParamQueryPart}`
    return value
  }

  const [appState, setAppState] = React.useState<AppState>({
    currentPage: Page.Main
  })

  const initialTokenKey = queryParams.length > 0 ? queryParams[0] : ""
  const [redirectState, setRedirectState] = React.useState<RedirectState>({
    tokenKey: initialTokenKey,
    tokenSecret: "",
    token: getTokenValue(getTokenPartValue(initialTokenKey)),
    tokenKeyError: true,
    tokenSecretError: true
  })

  const [continueState, setContinueState] = React.useState<ContinueState>({
    dataFormat: 'jwt',
    rawJwt: getInitialRawData(redirectState.token),
    rawJwtError: false,
    rawData: `FIRST_NAME=John
FAMILY_NAME=Smith`,
    rawDataError: false,
    data: undefined,
    signingKey: "my_secret_password",
    tokenParamKey: "session_token",
    sToken: "",
    continueUrl: ""
  })

  const [authorizeState, setAuthorizeState] = React.useState<AuthorizeState>({
    domain: "",
    clientId: preFilledAuthorizeState?.clientId || "",
    scope: preFilledAuthorizeState?.scope || "openid profile",
    redirect_uri: preFilledAuthorizeState?.redirect_uri || window.location.origin,
    audience: preFilledAuthorizeState?.audience || "",
    authorizeResult: {},
    error: undefined
  })

  const handleRedirectInputUpdated = (tokenKey: string, tokenSecret: string) => {

    const tokenPart = getTokenPartValue(tokenKey)
    const token = getTokenValue(tokenPart)
    const tokenSecretError = !testSecret(tokenPart, tokenSecret)

    setRedirectState({
      ...redirectState,
      tokenKey,
      tokenSecret,
      token,
      tokenSecretError
    })
  }

  const handleContinueInputUpdated = (dataFormat: SendDataFormat, rawJwt: string, rawData: string, signingKey: string, tokenParamKey: string) => {

    const jwt = dataFormat === "jwt" ? getDataToken(rawJwt) : undefined
    const data = dataFormat === "form" ? getFormData(rawData) : undefined
    const rawDataError = !data
    const rawJwtError = (dataFormat !== "none") && !jwt
    const sToken = getSignedDataToken(jwt, signingKey)
    const continueUrl = getContinueUrl(tokenParamKey, sToken)

    setContinueState({
      ...continueState,
      dataFormat,
      rawJwt,
      rawJwtError,
      rawDataError,
      rawData,
      data: jwt,
      signingKey,
      tokenParamKey,
      sToken,
      continueUrl
    })
  }

  const handleAuthorizeInputUpdated = (clientId: string, redirect_uri: string, scope: string, audience: string, authorizeResult: object, error: any) => {
    const domain = redirectState.token && redirectState.token.iss ? redirectState.token.iss : "INVALID_ISS_IN_TOKEN"
    setAuthorizeState({
      ...authorizeState,
      domain,
      clientId,
      redirect_uri,
      scope,
      audience,
      authorizeResult,
      error
    })
  }

  const handleAuthorizeResultUpdated = (authorizeResult: object, error: any) => {
    handleAuthorizeInputUpdated(
      authorizeState.clientId,
      authorizeState.redirect_uri,
      authorizeState.scope,
      authorizeState.audience,
      authorizeResult,
      error
    )
  }

  useEffect(() => {
    handleContinueInputUpdated(continueState.dataFormat, continueState.rawJwt, continueState.rawData, continueState.signingKey, continueState.tokenParamKey)
    handleAuthorizeInputUpdated(
      authorizeState.clientId,
      authorizeState.redirect_uri,
      authorizeState.scope,
      authorizeState.audience,
      {},
      undefined
    )
  }, [redirectState])

  useEffect(() => {
    localStorage.setItem("authorizeState", JSON.stringify(authorizeState))
  }, [authorizeState])

  return (
    <ThemeProvider theme={darkTheme}>
      <CssBaseline />
      <AppBar>
        <Toolbar>
          <Typography
            variant="h6"
            noWrap
            sx={{
              mr: 2,
              fontWeight: 700,
              color: 'inherit',
              textDecoration: 'none',
            }}
          >
            Auth0 Redirect Action Tester
          </Typography>
          <Box sx={{ flexGrow: 1, display: { xs: 'none', md: 'flex' } }}>
            <Button
              sx={{ my: 2, color: 'white', display: 'block' }}
              onClick={() => setAppState({ ...appState, currentPage: Page.Main })}
            >
              Main
            </Button>
            <Button
              sx={{ my: 2, color: 'white', display: 'block' }}
              onClick={() => setAppState({ ...appState, currentPage: Page.Authorize })}
            >
              Authorize
            </Button>
          </Box>
        </Toolbar>
      </AppBar>
      <Toolbar id="back-to-top-anchor" />
      <Container maxWidth="xl">
        <Grid container spacing={2} marginTop={6}>
          {
            appState.currentPage === Page.Main &&
            (<>
              <Grid xs={12} lg={6} xl={6}>
                <Item>
                  <RedirectParams state={state} queryParams={queryParams} onInputUpdated={handleRedirectInputUpdated} {...redirectState} ></RedirectParams>
                </Item>
              </Grid>
              <Grid xs={12} lg={6} xl={6}>
                <Item>
                  <ContinueParams onInputUpdated={handleContinueInputUpdated} {...continueState}></ContinueParams>
                </Item>
              </Grid>
            </>)
          }
          {
            appState.currentPage === Page.Authorize &&
            (<>
              <Grid xs={12} lg={6} xl={6}>
                <Item>
                  <AuthorizeParams onInputUpdated={handleAuthorizeInputUpdated} {...authorizeState} />
                </Item>
              </Grid>
              <Grid xs={12} lg={6} xl={6}>
                <Item>
                  {
                    inAuth0Provider &&
                    <AuthorizeResult onInputUpdated={handleAuthorizeResultUpdated} {...authorizeState} />
                  }
                </Item>
              </Grid>
            </>)
          }
        </Grid>
      </Container>
      <ScrollTop>
        <Fab size="small" aria-label="scroll back to top">
          <KeyboardArrowUpIcon />
        </Fab>
      </ScrollTop>
    </ThemeProvider>
  );
}

