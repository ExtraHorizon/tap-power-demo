import { OAuth2Client, rqlBuilder } from '@extrahorizon/javascript-sdk';
import { ChevronLeftIcon } from '@heroicons/react/outline';
import format from 'date-fns/format';
import { useContext, useEffect, useState } from 'react';
import { CartesianGrid, Line, LineChart, ResponsiveContainer, XAxis, YAxis } from 'recharts';
import { MAX_TICKS } from '../constants';
import { AuthContext } from '../context';

function AnalyseDetail({ document, onBack } : {document: string; onBack: () => void;}) {
  const { sdk } = useContext(AuthContext) as {sdk: OAuth2Client;};
  const [chartData, setChartData] = useState([] as any);

  useEffect(() => {
    (async () => {
      const schema = await sdk.data.schemas.findByName('tapPowerAnalysis');
      if (!schema) {
        onBack();
        return;
      }
      const { data: docs } = await sdk.data.documents.find(schema.id as string, { rql: rqlBuilder().eq('data.document', document).build() });
      if (!docs.length) {
        onBack();
      }
      const doc: any = docs[0];
      const result = doc.data.tps.map((e:any, i:number) => ({ index: i, rate: e.value }));
      setChartData(result);
    })().catch(() => {});
  }, [document, sdk, onBack]);
  return (
    <div className="flex flex-col p-4 items-start justify-center">
      <div className="flex flex-row text-blue-500 mb-10" onClick={onBack}>
        <ChevronLeftIcon className="h-6"/>
        <span>Back</span>
      </div>
      {
        chartData.length ? (
          <>
            <h1 className="font-bold text-2xl mb-2">Tapping rate</h1>
            <ResponsiveContainer width="90%" height={200}>
              <LineChart data={chartData}>
                <Line type="monotone" dataKey="rate" stroke="#8884d8" strokeWidth={2}/>
                <CartesianGrid stroke="#ccc" />
                <XAxis dataKey="index" />
                <YAxis />
              </LineChart>
            </ResponsiveContainer>
          </>
        ) :
          null
      }
    </div>
  );
}

function AnalyseList({ onSelect }: {onSelect: (id:string) => void;}) {
  const { sdk } = useContext(AuthContext) as {sdk: OAuth2Client;};
  const [documents, setDocuments] = useState([] as any);

  useEffect(() => {
    (async () => {
      const schema = await sdk.data.schemas.findByName('tapPowerMeasurements');
      if (!schema) {
        return;
      }
      const docs = await sdk.data.documents.findAll(schema.id as string, { rql: rqlBuilder().sort(['-creationTimestamp']).build() });
      setDocuments(docs);
    })().catch(() => {});
  }, [sdk]);
  return (
    <div className="flex flex-col items-center p-4 h-full">
      <div className="text-4xl font-bold bg-[#EAF5F9]">Analyse results</div>
      <div className="w-full overflow-auto h-full mt-6 bg-[#EAF5F9]">
        <table className="w-full">
          <thead className="sticky top-0 bg-[#EAF5F9]">
            <tr>
              <th>Taps</th>
              <th>Rate (tps)</th>
              <th>Time</th>
            </tr>
          </thead>
          <tbody className="rounded-lg">
            {
              documents.map((d:any) => (
                <tr key={d.id} className="bg-gray-100 border-b-2" onClick={() => { onSelect(d.id); }}>
                  <td className="text-center align-top">{ d.data.measurements.length }</td>
                  <td className="text-center align-top">{ Math.round((d.data.measurements.length / MAX_TICKS) * 10) / 10 }</td>
                  <td>
                    <div className="flex flex-col items-center">
                      <div>{ format(d.creationTimestamp, 'HH:mm:ss') }</div>
                      <div className="font-light italic">{ format(d.creationTimestamp, 'PP') }</div>
                    </div>
                  </td>
                </tr>
              ))
            }
          </tbody>
        </table>
      </div>
    </div>
  );
}
function Analyse() {
  const [documentId, setDocumentId] = useState(null as any);
  const select = (id:string) => {
    setDocumentId(id);
  };
  return documentId ? <AnalyseDetail document={documentId} onBack={() => setDocumentId(null)}/> : <AnalyseList onSelect={select}/>;
}

export default Analyse;
