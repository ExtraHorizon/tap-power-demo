import { OAuth2Client } from '@extrahorizon/javascript-sdk';
import { Transition } from '@headlessui/react';
import { CheckIcon, CogIcon, RefreshIcon, XIcon } from '@heroicons/react/outline';
import { useContext, useEffect, useState } from 'react';
import { MAX_TICKS } from '../constants';
import { AuthContext } from '../context';

function Orb(props: {children: any; className?: string; onClick?: () => void;}) {
  const [touched, setTouched] = useState(false);

  const gradient = touched ? 'bg-primary-dark' : 'bg-gradient-to-br from-primary-main to-secondary-dark';
  return (
    <div className={`select-none grow w-[250px] h-[250px] border-2 rounded-full grid grid-col-1 justify-center items-center drop-shadow-xl font-bold text-4xl text-gray-300 border-primary-main ${gradient}`}
      onClick={props.onClick}
      onTouchStart={() => setTouched(true)}
      onTouchEnd={() => setTouched(false)}>
      <div className="flex flex-col justify-center items-center">
        <div className={props.className}>{ props.children }</div>
      </div>
    </div>
  );
}

function Screen(props: {text: string; onClick?: () => void; className?:any; children?: any;}) {
  return (
    <div className="flex flex-col items-center justify-center">
      <div className="flex flex-col items-center justify-center h-[250px]">
        { props.children }
      </div>
      <Orb className={props.className} onClick={props.onClick} >
        { props.text }
      </Orb>
    </div>
  );
}

function Action(props: {done: (data:any) => void;}) {
  const [tapCount, setTapCount] = useState(0);
  const [timeTick, setTimeTick] = useState(0);
  const [data, setData] = useState([] as number[]);
  const [startTs] = useState((new Date()).getTime());

  useEffect(() => {
    const hdl = setInterval(() => {
      setTimeTick(t => t + 1);
    }, 1000);
    return () => { clearInterval(hdl); };
  }, []);

  useEffect(() => {
    if (MAX_TICKS - timeTick <= 0) {
      props.done({ start: startTs, data });
    }
  }, [props, data, timeTick, startTs]);

  const ticksLeft = MAX_TICKS - timeTick;

  return (
    <Screen text={tapCount.toString()} onClick={() => { setData([...data, new Date().getTime()]); setTapCount(tapCount + 1); }}>
      <div className="text-8xl font-bold mb-6">{ `${Math.floor(ticksLeft / 60)}:${(ticksLeft % 60).toLocaleString('en-US', { minimumIntegerDigits: 2 })}` }</div>
    </Screen>
  );
}

const prepareText = ['3', '2', '1', 'Go!'];
function Prepare(props: {onStart: () => void;}) {
  const [currentText, setCurrentText] = useState(0);

  useEffect(() => {
    const hdl = setInterval(() => {
      setCurrentText(ct => (ct < prepareText.length * 2 ? ct + 1 : 0));
    }, 700);
    return () => { clearInterval(hdl); };
  }, []);

  useEffect(() => {
    if (currentText === 7) {
      props.onStart();
    }
  }, [props, currentText]);

  return (
    <Screen className={`${currentText % 2 === 0 ? 'opacity-100' : 'opacity-0'} transition duration-700`}
      text={prepareText[Math.floor(currentText / 2)]} >
      <div className="text-4xl font-bold mb-6 text-center">Tap the circle as much as possible within 30 seconds!</div>
    </Screen>
  );
}

const startText = ['TAP ME', 'TO', 'START'];

function Start(props: {onStart: () => void;}) {
  const [currentText, setCurrentText] = useState(0);

  useEffect(() => {
    const hdl = setInterval(() => {
      setCurrentText(ct => (ct < startText.length * 2 ? ct + 1 : 0));
    }, 700);
    return () => { clearInterval(hdl); };
  }, []);

  return (
    <Screen className={`${currentText % 2 === 0 ? 'opacity-100' : 'opacity-0'} transition duration-700`}
      text={startText[Math.floor(currentText / 2)]} onClick={props.onStart}>
      <div id="central-section" className="flex flex-col items-start self-start mb-12">
        <div className="text-primary-main font-bold text-8xl" >TAP</div>
        <div className="-mt-2 pl-10 font-medium text-4xl">POWER!</div>
      </div>
    </Screen>

  );
}

function Done(props:{data: any; reset: () => void;}) {
  const { sdk } = useContext(AuthContext) as {sdk: OAuth2Client;};
  const [saveState, setSavingState] = useState('init');

  useEffect(() => {
    if (saveState === 'init') {
      setSavingState('saving');
    } else {
      return;
    }

    (async () => {
      const schema = await sdk.data.schemas.findByName('tapPowerMeasurements');
      if (!schema) {
        // console.log('Failed to get schema');
        return;
      }
      await sdk.data.documents.create(schema.id as string, { start: props.data.start, measurements: props.data.data });
      setSavingState('done');
    })().catch(err => {
      // console.log(err);
      // console.log('Failed to upload data');
      setSavingState('error');
    });
  }, [setSavingState, sdk, props.data, saveState]);

  return (
    <div className="flex flex-col items-center h-full" >
      <div className="font-extrabold text-4xl mt-8">{ props.data.data.length } taps!</div>
      <div className="flex flex-row items-center my-10">
        <div className="text-2xl mr-4">
          { saveState === 'saving' ? 'Uploading result ...' : '' }
          { saveState === 'done' ? 'Result uploaded' : '' }
          { saveState === 'error' ? 'Result upload failed' : '' }
        </div>
        { saveState === 'saving' ? <CogIcon className="h-8 animate-spin"/> : null }
        { saveState === 'done' ? <CheckIcon className="h-8 text-green-800"/> : null }
        { saveState === 'error' ? <XIcon className="h-8 text-red-800"/> : null }
      </div>
      <div className="grow" />
      <a href="#" className={
        `text-gray-200 text-4xl font-semibold border-2 border-primary-light
        p-4 rounded-3xl bg-primary-light drop-shadow-lg text-center`
      } onClick={props.reset}><div className="text-2xl">Try</div><div className="text-4xl">Again!</div></a>
    </div>
  );
}

function Measure() {
  const [data, setData] = useState([]);
  const [state, setState] = useState('start');

  let render = null;
  switch (state) {
    case 'start':
      render = <Start onStart={() => setState('prepare')}/>;
      break;
    case 'prepare':
      render = <Prepare onStart={() => setState('started')}/>;
      break;
    case 'started':
      render = <Action done={d => { setData(d); setState('done'); }}/>;
      break;
    case 'done':
      render = <Done data={data} reset={() => setState('start')}/>;
      break;
    default:
  }
  return (
    <div className="p-6 flex flex-col justify-center items-center w-full h-full">
      { render }
    </div>
  );
}

export default Measure;
