import React from 'react';
import ReactDOM from 'react-dom/client';
import { Auth0Provider } from '@auth0/auth0-react';
import './index.css';
import App, { AuthorizeState } from './App';
import reportWebVitals from './reportWebVitals';
import AutoLogin from './comoponents/AutoLogin';
import { Route, BrowserRouter, Routes } from 'react-router-dom'

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);

export interface AuthorizingState extends AuthorizeState {
  search: string
}

const parseAuthorizingState = (item: string | null) => {
  return item ? JSON.parse(item) as AuthorizingState : null
}

const authorizingState: AuthorizingState | null = parseAuthorizingState(sessionStorage.getItem("authorizingState"))

root.render(
  <React.StrictMode>
    <BrowserRouter>
      {
        (authorizingState) ? (
          <Auth0Provider
            domain={authorizingState.domain}
            clientId={authorizingState.clientId}
            redirectUri={authorizingState.redirect_uri}
          >
            <Routes>
              <Route path="/authorizing" element={<AutoLogin search={authorizingState.search} />} />
              <Route path="/" element={<App search={authorizingState.search} inAuth0Provider={true} />} />
            </Routes>
          </Auth0Provider>
        ) : <App search={window.location.search} inAuth0Provider={false} />
      }
    </BrowserRouter>
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
