import { Server } from './server/server';
import { Fetcher } from './service/fetcher';
import { Retrier } from './service/retrier';

const server = new Server();
server.start();

const fetcher = new Fetcher();
fetcher.fetch();

const retrier = new Retrier();
retrier.start();
