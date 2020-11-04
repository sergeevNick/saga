import { SelectorOperatorType } from '../../enums/selector-operator.enum';
import { Query } from '../../../../../entities/query/query';
import { Selector, SelectorOptions } from '../selector/selector';

type ValueType = string | number;

export interface SimpleSelectorOptions extends SelectorOptions<ValueType> {
    value: ValueType;
}

export class SimpleSelector extends Selector<ValueType> {
    operator: SelectorOperatorType;
    value: ValueType;

    constructor(options: SimpleSelectorOptions) {
        super(options);

        this.operator = options.operator || SelectorOperatorType.EQUAL;
    }

    getQueryCondition(): Query {
        const template = `${this.field} ${this.operator} $${this.field}`;
        return new Query(template, { [this.field]: this.value });
    };
}