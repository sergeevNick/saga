import { SelectorOperatorType } from '../../enums/selector-operator.enum';
import { Query } from '../../../../../entities/query/query';
import { Selector, SelectorOptions } from '../selector/selector';
import { Dictionary } from '@eigenspace/common-types';

type ValueType = string | number;
type CollectionType = ValueType[];

export interface CollectionSelectorOptions extends SelectorOptions<CollectionType> {
    value: CollectionType;
}

export class CollectionSelector extends Selector<CollectionType> {
    operator: SelectorOperatorType;
    value: CollectionType;

    constructor(options: CollectionSelectorOptions) {
        super(options);

        this.operator = options.operator || SelectorOperatorType.IN;
    }

    getQueryCondition(): Query {
        const fields = this.value.map((_, i) => `${this.field}${i}`);
        const filter = this.value.map((_, i) => {
            const field = `$${fields[i]}`;
            return this.getValueTransformer(field);
        });

        const template = `${this.getFieldTransformer()} ${this.operator} (${filter.toString()})`;

        const values = {} as Dictionary<ValueType>;
        fields.forEach((f, i) => values[f] = this.value[i]);

        return new Query(template, values);
    };

    protected getFieldTransformer(): string {
        return this.isStringCollection() ? `lower(${this.field})` : this.field;
    }

    protected getValueTransformer(value: ValueType): string {
        return this.isStringCollection() ? `lower(${value})` : `${value}`;
    }

    protected isStringCollection(): boolean {
        return typeof this.value[0] === 'string';
    }
}