// production code here

import { authenticateSDK, sdk } from "./services/sdk";

interface Data {
  data: {
    schemaId: string;
    documentId: string;
    replan: boolean;
  };
};

interface TapMeasurement extends Document {
  measurements?: number[];
  start: number;
}

interface TPS {
  timestamp: number;
  value: number;
}

function getTsSecond(ts: number): number {
  return Math.floor(ts/1000);
}

function calculateTps(start:number, measurements: number[]): TPS[] {
   const tps:TPS[] = [];

  let currentSec = getTsSecond(start);
  let currentTps = 0;
  for (let m of measurements) {
    let measSec = getTsSecond(m);
    while(measSec > currentSec) {
      tps.push({timestamp:currentSec, value: currentTps});
      currentSec += 1;
      currentTps = 0;
    }
    currentTps += 1;
  }
  tps.push({timestamp:currentSec, value: currentTps});
  return tps;
}

export async function handler(data: Data) {
  await authenticateSDK();

  let document = await sdk.data.documents.findById<TapMeasurement>(data.data.schemaId, data.data.documentId);
  if (!document || document.data.measurements.length === 0) {
    return
  }

   // Link measurement document to user
  let result = await sdk.data.documents.linkUsers(data.data.schemaId, data.data.documentId, {userIds:[document.creatorId]})
  if(result.affectedRecords !== 1) {
    throw new Error("Failed to link measurement document to user")
  }
 
  // Calculate tps values
  const tps = calculateTps(document.data.start, document.data.measurements);
  
  // Store results in tapPowerAnalysis document
  let resultSchema = await sdk.data.schemas.findByName("tapPowerAnalysis");
  if(!resultSchema) {
    throw new Error("Result schema not found!")
  }
  const analysisDocument = await sdk.data.documents.create(resultSchema.id, { tps, document: document.id, averageTps: document.data.measurements.length/30 },);
  if(!analysisDocument) {
    throw new Error("Failed to store analysis document")
  }
  // Document needs to be linked to the same user as the measurement document
  result = await sdk.data.documents.linkUsers(resultSchema.id, analysisDocument.id, {userIds:[document.creatorId]})
  if(result.affectedRecords !== 1) {
    throw new Error("Failed to link analysis document to user")
  }
   
  // Transition measurement document to processed
  let schema = await sdk.data.schemas.findById(data.data.schemaId);
  if(!schema) {
    throw new Error("Schema not found")
  }
  const processTransitionId = schema.findTransitionIdByName("process");
  if(processTransitionId === undefined) {
    throw new Error("Transition ID undefined");
  }
  await sdk.data.documents.transition(data.data.schemaId, document.id, {id: processTransitionId})
}
