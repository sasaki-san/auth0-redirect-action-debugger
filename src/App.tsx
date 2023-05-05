import { useReducer } from 'react';
import './App.css';
import CssBaseline from '@mui/material/CssBaseline';
import Container from '@mui/material/Container';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { styled } from '@mui/material/styles';
import Paper from '@mui/material/Paper';
import Grid from '@mui/material/Unstable_Grid2';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import Fab from '@mui/material/Fab';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import RedirectParams from './comoponents/RedirectParams';
import ContinueParams from './comoponents/ContinueParams';
import ScrollTop from './comoponents/ScrollTop';
import { ContinueDataSubmissionMethod, ReducerState, reducer, reducerInit, Page } from './reducer';
import Box from '@mui/material/Box';

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

export interface AppState {
  currentPage: Page
}

export interface AppProps {
  search: string
}

export default function App(props: AppProps) {

  const { search } = props

  const reducerInitialState: ReducerState = {
    searchParam: new URLSearchParams(search),

    redirectStateParam: "",
    redirectSessionTokenParamCandidates: [],
    redirectSessionTokenParamSelected: "",
    redirectSessionTokenStr: "",
    redirectSessionTokenJson: undefined,
    redirectSigningSecret: "my_secret_password",
    redirectSigningSecretMatches: false,

    continueDataSubmissionMethod: ContinueDataSubmissionMethod.JWT,
    continueJsonDataStr: "",
    continueJsonDataJson: undefined,
    continueJsonDataValid: true,
    continueJsonSessionTokenParamSelected: "session_token",
    continueJsonSigningSecret: "my_secret_password",
    continueFormData: `FIRST_NAME=John
FAMILY_NAME=Smith`,
    continueFormDataValid: true,
    continueUrl: ""
  }

  const [reducerState, dispatch] = useReducer(reducer, reducerInitialState, reducerInit)

  return (
    <ThemeProvider theme={darkTheme}>
      <CssBaseline />
      <AppBar>
        <Toolbar>
          <Button
            sx={{ color: 'white' }}
          >
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
          </Button>
          <Box sx={{ flexGrow: 1, display: { xs: 'none', md: 'flex' } }}>
            <Button
              sx={{ my: 2, color: 'white', display: 'block' }}
              onClick={() => window.location.href = "https://github.com/sasaki-san/auth0-redirect-action-debugger#auth0-redirect-action-tester"}
            >
              How to Use
            </Button>
          </Box>
        </Toolbar>
      </AppBar>
      <Toolbar id="back-to-top-anchor" />
      <Container maxWidth="xl">
        <Grid container spacing={2} marginTop={6}>
          {
            (<>
              <Grid xs={12} lg={6} xl={6}>
                <Item>
                  <RedirectParams reducerState={reducerState} dispatch={dispatch} />
                </Item>
              </Grid>
              <Grid xs={12} lg={6} xl={6}>
                <Item>
                  <ContinueParams reducerState={reducerState} dispatch={dispatch} />
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

