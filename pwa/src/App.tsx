import { Suspense, useCallback, useState } from 'react';
import { useRecoilState } from 'recoil';
import { Transition } from '@headlessui/react';
import { CalculatorIcon, ChartSquareBarIcon, UserIcon } from '@heroicons/react/outline';
import Login from './Login';
import configStorage from './configStorage';
import './i18n';
import { Auth } from './Auth';
import { loginState } from './AppState';
import BottomBar from './components/BottomBar';
import Measure from './components/Measure';
import Analyse from './components/Analyse';
import Me from './components/Me';

const menu = [
  { label: 'Measure!', icon: CalculatorIcon },
  { label: 'Analyse!', icon: ChartSquareBarIcon },
  { label: 'Me', icon: UserIcon }];

function App() {
  const [loggedInState] = useRecoilState(loginState);
  const [selected, setSelected] = useState(menu[0].label);

  const onSelect = useCallback((label:string) => {
    setSelected(label);
  }, []);

  const screenClass = 'absolute top-0 right-0 left-0 h-screen pb-[110px] bg-[#EAF5F9]';

  return (
    <Suspense fallback="Loading">
      <Transition show={loggedInState} enter="duration-300" enterFrom="opacity-0" enterTo="opacity-100">
        <Auth configStorage={configStorage}>
          <Transition className={screenClass} show={selected === 'Measure!'} enter="duration-300" enterFrom="opacity-0" enterTo="opacity-100" leave="duration-300" leaveFrom="opacity-100" leaveTo="opacity-0" >
            <Measure/>
          </Transition>
          <Transition className={screenClass} show={selected === 'Analyse!'} enter="duration-300" enterFrom="opacity-0" enterTo="opacity-100" leave="duration-300" leaveFrom="opacity-100" leaveTo="opacity-0">
            <Analyse/>
          </Transition>
          <Transition className={screenClass} show={selected === 'Me'} enter="duration-300" enterFrom="opacity-0" enterTo="opacity-100" leave="duration-300" leaveFrom="opacity-100" leaveTo="opacity-0">
            <Me/>
          </Transition>
          <BottomBar items={menu} onSelect={onSelect}/>
        </Auth>
      </Transition>
      <Transition show={!loggedInState} enter="duration-300" enterFrom="opacity-0" enterTo="opacity-100">
        <Login configStorage={configStorage}/>
      </Transition>
    </Suspense>
  );
}

export default App;
