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
    private interval: NodeJS.Timer;

    async update(req: express.Request, res: express.Response): Promise<void> {
        console.log('got request wit body', JSON.stringify(req.body, null, 4));
        const { event, payload } = req.body;
        const order = { id: payload } as Order;

        res.status(200).send({ event: EventType.SUPPLY_STARTED });

        if (event === EventType.ORDER_STARTED) {
            await this.createSupply(order);
        }

        if (event === EventType.DELIVERY_REJECTED) {
            await this.updateSupply(payload, StatusType.REJECTED);
        }

        if (event === EventType.DELIVERY_RESOLVED) {
            await this.updateSupply(payload, StatusType.RESOLVED);
        }
    }

    private async createSupply(order: Order): Promise<void> {
        order.supplyStatus = StatusType.STARTED;
        await this.storageAppService.update<Order>(order, this.params);
        if (this.hasError()) {
            console.error('Error in supply');
            order.supplyStatus = StatusType.REJECTED;
            await this.storageAppService.update<Order>(order, this.params);
            await this.request(EventType.SUPPLY_REJECTED, order.id!, 3001);
            return;
        }

        this.interval = setInterval(async () => {
            await this.proceedSupply(order).catch(() => console.log('Delivery service is down'));
        }, 1000 * 5);
    }

    private async updateSupply(orderId: string, status: StatusType): Promise<void> {
        console.log('supplyStatus', status);
        const order = { id: orderId, supplyStatus: status } as Order;
        await this.storageAppService.update<Order>(order, this.params);

        const event = status === StatusType.REJECTED ? EventType.SUPPLY_REJECTED : EventType.SUPPLY_RESOLVED;
        await this.request(event, order.id!, 3001);
    }

    private async proceedSupply(order: Order): Promise<void> {
        console.log('request to delivery');
        await this.request(EventType.SUPPLY_STARTED, order.id!, 3003);

        console.log('cleared interval');
        clearInterval(this.interval);
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
