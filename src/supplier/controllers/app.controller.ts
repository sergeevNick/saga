import * as express from 'express';
import { StorageAppService } from '../../common/services/app/storage/storage.app.service';
import { EventType } from '../../common/enums/event.enum';
import { Order } from '../../common/types/order';
import { StatusType } from '../../common/enums/status.enum';
import { BaseDataService } from '../../common/services/data/base/base.data.service';

export class AppController {
    private dataService = new BaseDataService();
    private storageAppService = new StorageAppService();
    private params = { table: 'order' };
    private errorProbability = 0.2;

    async update(req: express.Request, res: express.Response): Promise<void> {
        console.log('got request with body', JSON.stringify(req.body, null, 4));
        const { event, payload } = req.body;
        const order = { id: payload } as Order;

        if (event === EventType.ORDER_STARTED) {
            try {
                await this.createSupply(order);
                res.status(200).send({ event: EventType.SUPPLY_RESOLVED });
            } catch (err) {
                // await this.updateSupply(payload, StatusType.UNKNOWN_ERROR);
                res.status(500).send({ event: EventType.SUPPLY_UNKNOWN_ERROR });
            }
        }

        if (event === EventType.DELIVERY_UNKNOWN_ERROR) {
            await this.updateSupply(payload, StatusType.UNKNOWN_ERROR);
            await this.request(event, order.id!, 3001);
        }

        if (event === EventType.DELIVERY_RESOLVED) {
            await this.updateSupply(payload, StatusType.RESOLVED);
            await this.request(event, order.id!, 3001);
        }
    }

    async createSupply(order: Order): Promise<void> {
        order.supplyStatus = StatusType.STARTED;
        await this.storageAppService.update<Order>(order, this.params);
        if (this.hasError()) {
            order.supplyStatus = StatusType.UNKNOWN_ERROR;
            await this.storageAppService.update<Order>(order, this.params);

            console.log('Error in supply');
            throw new Error('Error in supply');
        }

        console.log('request to delivery');
        await this.request(EventType.SUPPLY_STARTED, order.id!, 3003);
        await this.updateSupply(order.id!, StatusType.RESOLVED);
    }

    async updateSupply(orderId: string, status: StatusType): Promise<void> {
        console.log('supplyStatus', status);
        const order = { id: orderId, supplyStatus: status } as Order;
        await this.storageAppService.update<Order>(order, this.params);
    }

    private async request(event: EventType, id: string, port: number): Promise<any> {
        return this.dataService.post(`http://localhost:${port}`, {
            data: {
                event: event, payload: id
            }
        });
    }

    private hasError(): boolean {
        return Math.random() < this.errorProbability;
    }
}
