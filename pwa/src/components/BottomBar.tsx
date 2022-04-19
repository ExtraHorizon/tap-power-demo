import { useEffect, useState } from 'react';

interface BottomBarItem {
  label: string;
  icon: (props: any) => JSX.Element;
}

function BottomBar(props: {items: BottomBarItem[]; onSelect:(label: string) => void; }) {
  const [selected, setSelected] = useState(props.items[0].label);

  useEffect(() => {
    props.onSelect(selected);
  }, [props, selected]);
  return (
    <div className="absolute bottom-0 w-screen h-[110px] bg-slate-100 border-t-slate-200 border-t-2">
      <div className="flex flex-row items-center justify-between px-10 py-4 ">
        {
          props.items.map(i => (
            <div key={i.label} className="flex flex-col items-center p-2 cursor-pointer" onClick={() => { setSelected(i.label); }}>
              { selected === i.label ? (<i.icon className="h-10 text-primary-main drop-shadow-lg"/>) : (<i.icon className="h-10 drop-shadow-lg" />) }
              <div className={selected === i.label ? 'text-blue-500' : ''}>{ i.label }</div>
            </div>
          ))
        }
      </div>
    </div>
  );
}

export default BottomBar;
