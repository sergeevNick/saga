import { Server } from './server/server';
import { Fetcher } from './service/fetcher';

const server = new Server();
server.start();

const fetcher = new Fetcher();
fetcher.fetch();
