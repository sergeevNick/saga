import { StatusType } from '../enums/status.enum';
import { BaseModel } from './base.model';

export interface Order extends BaseModel {
    name: string;
    quantity?: number;
    shippedQuantity?: number;
    deliveredQuantity?: number;
    orderStatus?: StatusType;
    supplyStatus?: StatusType;
    deliveryStatus?: StatusType;
}
