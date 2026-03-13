import { Job } from 'bullmq';

export async function handleTransactionJob(job: Job) {
  const payload = job.data as { transaction_id: string; account_id: string };
  job.log(`Processing transaction ${payload.transaction_id} for account ${payload.account_id}`);
  return { processed: true };
}
