import { SelectorOperatorType } from '../../enums/selector-operator.enum';
import { Query } from '../../../../../entities/query/query';

export interface SelectorOptions<T> {
    field: string;
    operator?: SelectorOperatorType;
    value?: T;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export abstract class Selector<T = any> {
    field: string;
    operator?: SelectorOperatorType;
    value?: T;

    protected constructor(options: SelectorOptions<T>) {
        this.field = options.field;
        this.operator = options.operator;
        this.value = options.value;
    }

    abstract getQueryCondition(): Query;
}