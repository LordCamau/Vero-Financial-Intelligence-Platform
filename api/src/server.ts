import app from './app';
import { config } from './config';
import { startWorkers } from './queue';

app.listen(config.PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`Vero API running on port ${config.PORT}`);
});

startWorkers();
