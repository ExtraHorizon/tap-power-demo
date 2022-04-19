import { OAuth2Client } from '@extrahorizon/javascript-sdk';
import { useContext, useEffect, useState } from 'react';
import { AuthContext } from '../context';
import EButton from './EButton';

function Me() {
  const { sdk, configStorage } = useContext(AuthContext) as {sdk: OAuth2Client; configStorage:any;};
  const [user, setUser] = useState(null as any);

  const label = 'text-lg font-bold';

  const logout = () => {
    configStorage.clearToken();
    window.location.reload();
  };

  useEffect(() => {
    (async () => {
      setUser(await sdk.users.me());
    })().catch(() => {});
  }, [sdk]);
  return (
    user !== null ? (
      <>
        <div className="text-2xl font-bold p-6">{ `${user?.firstName} ${user?.lastName}` }</div>
        <div className="p-4 w-full flex flex-col">
          <div className="exh-panel flex flex-col items-start p-10">
            <div className={label}>First name</div>
            <div>{ user?.firstName }</div>
            <div className={label}>Last name</div>
            <div>{ user?.lastName }</div>
            <div className={label}>Email</div>
            <div>{ user?.email }</div>
            <div className={label}>Phone number</div>
            <div>{ user?.phoneNumber }</div>
            <div className={label}>Language</div>
            <div>{ user?.language }</div>
          </div>
          <EButton className="mt-6" onClick={() => logout()}>Logout</EButton>
        </div>
      </>
    ) :
      null
  );
}

export default Me;
