import { Queue, Worker } from 'bullmq';
import { config } from '../config';
import { handleTransactionJob } from './workers/transactionWorker';
import { handleInsightJob } from './workers/insightsWorker';

const connection = {
  host: 'redis',
  port: 6379
};

export const transactionQueue = new Queue('vero-transactions', { connection });
export const insightsQueue = new Queue('vero-insights', { connection });

export function startWorkers() {
  new Worker('vero-transactions', handleTransactionJob, { connection });
  new Worker('vero-insights', handleInsightJob, { connection });
}