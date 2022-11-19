import React, { useEffect } from 'react';
import './App.css';
import CssBaseline from '@mui/material/CssBaseline';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { styled } from '@mui/material/styles';
import Paper from '@mui/material/Paper';
import Grid from '@mui/material/Unstable_Grid2';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import useScrollTrigger from '@mui/material/useScrollTrigger';
import Fab from '@mui/material/Fab';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import Fade from '@mui/material/Fade';
import RedirectParams from './comoponents/RedirectParams';
import ContinueParams from './comoponents/ContinueParams';
import { decodeToken } from "react-jwt"
import { KJUR } from "jsrsasign"
import { Auth0Provider } from "@auth0/auth0-react";
import Profile from './comoponents/Profile';
import { green, purple } from '@mui/material/colors';


interface Props {
  /**
   * Injected by the documentation to work in an iframe.
   * You won't need it on your project.
   */
  window?: () => Window;
  children: React.ReactElement;
}

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

function ScrollTop(props: Props) {
  const { children } = props;
  // Note that you normally won't need to set the window ref as useScrollTrigger
  // will default to window.
  // This is only being set here because the demo is in an iframe.
  const trigger = useScrollTrigger({
    target: undefined,
    disableHysteresis: true,
    threshold: 100,
  });

  const handleClick = (event: React.MouseEvent<HTMLDivElement>) => {
    const anchor = (
      (event.target as HTMLDivElement).ownerDocument || document
    ).querySelector('#back-to-top-anchor');

    if (anchor) {
      anchor.scrollIntoView({
        block: 'center',
      });
    }
  };

  return (
    <Fade in={trigger}>
      <Box
        onClick={handleClick}
        role="presentation"
        sx={{ position: 'fixed', bottom: 16, right: 16 }}
      >
        {children}
      </Box>
    </Fade>
  );
}

interface JwtStandardClaims {
  sub: string
  iat: number
  exp: number
}
interface Jwt extends JwtStandardClaims {
  [key: string]: any
}

export type SendDataFormat = 'none' | 'jwt' | 'form'

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

function App() {

  const searchParams = new URLSearchParams(window.location.search);
  const state = searchParams.get("state")
  const queryParams = Array.from(searchParams.keys()).filter(key => key !== "state")

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
    } as Jwt
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
    const continueUrlHost = redirectState && redirectState.token && (redirectState.token as any).iss ? (redirectState.token as any).iss : "INVALID_ISS_IN_TOKEN"
    const tokenParamQueryPart = sToken ? `&${tokenParamKey}=${sToken}` : ""
    const value = `https://${continueUrlHost}/continue?state=${state}${tokenParamQueryPart}`
    return value
  }

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

  useEffect(() => {
    handleContinueInputUpdated(continueState.dataFormat, continueState.rawJwt, continueState.rawData, continueState.signingKey, continueState.tokenParamKey)
  }, [redirectState])

  // const providerConfig = {
  //   domain: "yusasaki.jp.auth0.com",
  //   clientId: "ECVqsZoy7gm85FxudfFETO2rolbjJNz5",
  //   redirectUri: window.location.origin
  // };

  return (
    <ThemeProvider theme={darkTheme}>
      <CssBaseline />
      <AppBar>
        <Toolbar>
          <Typography
            variant="h6"
            noWrap
            component="a"
            href="/"
            sx={{
              mr: 2,
              fontWeight: 700,
              color: 'inherit',
              textDecoration: 'none',
            }}
          >
            Auth0 Redirect Action Tester
          </Typography>
        </Toolbar>
      </AppBar>
      <Toolbar id="back-to-top-anchor" />
      <Container maxWidth="xl">
        <Grid container spacing={2} marginTop={6}>
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
          {/* <Grid xs={12} lg={12} xl={4}>
            <Item>
              <Auth0Provider {...providerConfig}>
                <Profile />
              </Auth0Provider>
            </Item>
          </Grid> */}
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

export default App;
