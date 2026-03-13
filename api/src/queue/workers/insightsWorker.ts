import { Job } from 'bullmq';

export async function handleInsightJob(job: Job) {
  const payload = job.data as { user_id: string; kind: string };
  job.log(`Running insight job ${payload.kind} for user ${payload.user_id}`);
  return { processed: true };
}
