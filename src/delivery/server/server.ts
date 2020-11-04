import { Socket } from "net";
import http from "http";
import express from 'express';
import * as bodyParser from 'body-parser';
import { AppRouter } from '../routers/app.router';

export class Server {
    private app = express();
    private port = 3003;
    private connections: Socket[] = [];
    private server: http.Server;

    start(): void {
        this.app.use(express.json({ limit: '10mb', extended: true } as bodyParser.OptionsJson));
        this.app.use(bodyParser.urlencoded({ extended: true }));

        this.app.get('/', (_, res: express.Response) => res.send('Hi! This is delivery service!'));

        this.app.use('', AppRouter);

        this.server = this.app.listen(this.port, '0.0.0.0', () => console.log(`app listening on port ${this.port}!`));

        process.on('SIGTERM', this.shutDown.bind(this));
        process.on('SIGINT', this.shutDown.bind(this));

        this.server.on('connection', (connection: Socket) => {
            this.connections.push(connection);
            connection.on('close', () => this.connections = this.connections.filter(curr => curr !== connection));
        });

        // Solve 'possible EventEmitter memory leak detected'
        process.setMaxListeners(0);
    }

    private async shutDown(): Promise<void> {
        this.server.close(() => {
            console.log('Closed out remaining connections');
            process.exit(0);
        });

        setTimeout(() => {
            console.error('Could not close connections in time, forcefully shutting down');
            process.exit(1);
        }, 10000);

        this.connections.forEach(curr => curr.end());
        setTimeout(() => this.connections.forEach(curr => curr.destroy()), 5000);
    }
}
