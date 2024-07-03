import express, {RequestHandler} from 'express';
import {createBullBoard} from '@bull-board/api';
import {BullMQAdapter} from '@bull-board/api/bullMQAdapter';
import {ExpressAdapter} from '@bull-board/express';
import {Queue, QueueOptions} from 'bullmq';

const REDIS_HOST: string = process.env.REDIS_HOST || 'localhost';
const REDIS_PORT: number = Number(process.env.REDIS_PORT) || 6379;
const REDIS_PASSWORD: string = process.env.REDIS_PASSWORD || '';

const BULLMQ_REDIS_CONFIG: QueueOptions['connection'] = {
    host: REDIS_HOST,
    port: REDIS_PORT,
    password: REDIS_PASSWORD,
};

// Define queues here
const {QUEUES} = process.env;
console.log({QUEUES});
if (!QUEUES) {
    throw new Error('QUEUES env variable is required');
}
const queueNames = QUEUES.split(',') as Array<string>;
console.log({queueNames});
const queues: Array<Queue> = queueNames.map(queueName => {
    console.log({queueName},"registering..")
    return new Queue(queueName, {connection: BULLMQ_REDIS_CONFIG})
})

const serverAdapter = new ExpressAdapter();
const app = express();

createBullBoard({
    queues: queues.map(queue => new BullMQAdapter(queue)),
    serverAdapter,
});

serverAdapter.setBasePath('/bull-board');
app.use('/bull-board', serverAdapter.getRouter() as RequestHandler);

const PORT: number = 80;
app.listen(PORT, () => {
    console.log(`BullBoard is running on http://localhost:${PORT}/bull-board`);
});