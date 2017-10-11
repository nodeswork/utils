import * as _           from 'underscore';
import { MetricsValue } from './def';
import { operator }     from './operators';

export const SUM = 'sum';

export function Sum(val: number): MetricsValue<number> {
  return { operand: SUM, value: val };
}

operator.registerAggregator(SUM, (v1: number, v2: number) => v1 + v2);

export const COUNT = 'count';

export function Count(val: number): MetricsValue<number> {
  return { operand: COUNT, value: val };
}

operator.registerAggregator(COUNT, (v1: number, v2: number) => v1 + v2);

export const AVERAGE = 'avg';

export function Average(
  val: any, weight: number = 1,
): MetricsValue<AverageValue> {
  return { operand: AVERAGE, value: { v: val, w: weight }};
}

export interface AverageValue {
  v: any;
  w: number;
}

operator.registerAggregator(
  AVERAGE,
  (v1: AverageValue, v2: AverageValue) => {
    return {
      v: v1.v * v1.w + v2.v * v2.w,
      w: v1.w + v2.w,
    };
  },
);

export const MAX = 'max';

export function Max(val: number): MetricsValue<number> {
  return { operand: MAX, value: val };
}

operator.registerAggregator(
  MAX,
  (v1: number, v2: number) => Math.max(v1, v2),
);

export const MIN = 'min';

export function Min(val: number): MetricsValue<number> {
  return { operand: MIN, value: val };
}

operator.registerAggregator(
  MIN,
  (v1: number, v2: number) => Math.min(v1, v2),
);

export const LAST = 'last';

export function Last(val: any): MetricsValue<any> {
  return { operand: LAST, value: val };
}

operator.registerAggregator(LAST, (v1: any, v2: any) => v2);

export const FIRST = 'first';

export function First(val: any): MetricsValue<any> {
  return { operand: FIRST, value: val };
}

operator.registerAggregator(FIRST, (v1: any, v2: any) => v1);

export const COLLECT = 'collect';

export function Collect(val: any): MetricsValue<any[]> {
  return { operand: COLLECT, value: [val] };
}

operator.registerAggregator(COLLECT, (v1: any[], v2: any[]) => v1.concat(v2));

export const UNION = 'union';

export function Union(val: any): MetricsValue<any[]> {
  return { operand: UNION, value: [val] };
}

operator.registerAggregator(UNION, (v1: any[], v2: any[]) => _.union(v1, v2));
