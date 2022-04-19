import { createOAuth2Client } from '@extrahorizon/javascript-sdk';
import { useEffect, useState } from 'react';
import { useRecoilState } from 'recoil';
import { CLIENT_ID, HOST } from './constants';
import { ConfigStorage } from './configStorage';
import { AuthContext } from './context';
import { loginState as globalLoginState } from './AppState';

function Busy() {
  return (
    <div className="flex flex-col items-center justify-center h-screen">
      <div className="flex-grow"/>
      <svg className="w-1/6 text-white animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
      </svg>
      <div className="grow"/>
    </div>
  );
}

function Auth(props: { configStorage: ConfigStorage; children: JSX.Element[] | JSX.Element;}) {
  const [loggedInState, setLoggedInState] = useRecoilState(globalLoginState);
  const [loginState, setLoginState] = useState('init');
  const [context, setContext] = useState({} as any);

  useEffect(() => {
    const tmp = (async () => {
      const token = props.configStorage.getToken();
      if (!token) {
        // console.log('Auth useeffect: setting login state to false');
        setLoggedInState(false);
        return;
      }

      const newSdk = createOAuth2Client({
        host: HOST,
        clientId: CLIENT_ID,
        freshTokensCallback: t => props.configStorage.updateToken(t.refreshToken),
      });
      await newSdk.auth.authenticate({
        refreshToken: token,
      });
      const me = await newSdk.users.me();
      if (me) {
        setContext({ sdk: newSdk, user: me, configStorage: props.configStorage });
        setLoginState('authenticated');
        if (!loggedInState) {
          // console.log('Auth useeffect: Setting loggedInState to true');
          setLoggedInState(true);
        }
      } else {
        // console.log('Auth useeffect: setting login state to false');
        setLoggedInState(false);
      }
    })();
    tmp.catch(err => {
      // console.log(err);
      setLoginState('error');
      // console.log('Auth useeffect catch: setting login state to false');
      setLoggedInState(false);
    });
  }, [props.configStorage, loggedInState, setLoggedInState]);

  let result: JSX.Element | JSX.Element[] | null = null;
  switch (loginState) {
    case 'init':
      result = <Busy/>;
      break;
    case 'authenticated':
      result = (
        <AuthContext.Provider value={context}>
          { props.children }
        </AuthContext.Provider>
      );
      break;
    default:
      result = null;
  }

  return (
    <>
      { result }
    </>
  );
}

function withAuth(configStorage: ConfigStorage) {
  return (Element: (props:any) => JSX.Element) => function WrappedAuthComponent(props:any) {
    return (<Auth configStorage={configStorage}><Element {...props} /></Auth>);
  };
}

export { Auth, withAuth };
