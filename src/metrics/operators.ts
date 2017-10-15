import * as _             from 'underscore';

import { NodesworkError } from '../error';

import {
  Metrics,
  MetricsData,
  MetricsDimensions,
  MetricsValue,
  Operator,
}                         from './def';
import { hashDimensions } from './utils';

export class MetricsOperator {

  private operators: { [name: string]: Operator<any>; } = {};

  constructor() { }

  public registerAggregator<T>(operand: string, oper: Operator<T>) {
    this.operators[operand] = oper;
  }

  public operate<V>(values: MetricsValue<V>[]): MetricsValue<V> {
    if (values == null) {
      return null;
    }

    const filteredValues     = _.filter(values, (x) => x != null);
    let res: MetricsValue<V> = null;

    for (const value of filteredValues) {
      if (res == null) {
        res = value;
      } else {
        const oper = this.operators[value.oper];
        if (oper == null) {
          throw NodesworkError.internalServerError(
            `Unknown operator ${value.oper}`,
          );
        } else if (value.oper != res.oper) {
          throw NodesworkError.internalServerError(
            `Inconsistent operands ${value.oper} vs ${res.oper}`,
          );
        } else {
          res = {
            oper:  res.oper,
            val:   oper(res.val, value.val),
          };
        }
      }
    }

    return res;
  }

  public updateMetricsData<T>(
    options:    UpdateMetricsDataOptions<T>,
    target?:    MetricsData,
  ): MetricsData {
    const dimensions  = options.dimensions || {};
    const dhash       = hashDimensions(dimensions);

    if (target == null) {
      const ts = options.ts || Date.now(),
      target = {
        timerange:   {
            start:   ts,
          end:       ts,
        },
        dimensions:  { },
        metrics:     { },
      };
    }

    target.dimensions[dhash] = dimensions;

    if (target.metrics[options.name] == null) {
      target.metrics[options.name] = {};
    }

    const targetMetrics = target.metrics[options.name];

    if (targetMetrics[dhash] == null) {
      targetMetrics[dhash] = options.value;
    } else {
      targetMetrics[dhash] = this.operate(
        [targetMetrics[dhash], options.value],
      );
    }

    if (options.ts) {
      target.timerange.start  = Math.min(target.timerange.start, options.ts);
      target.timerange.end    = Math.max(target.timerange.end, options.ts);
    }

    return target;
  }

  public projectMetricsData(
    data: MetricsData, options: MetricsProjectOptions,
  ): MetricsData {
    let metricsNames      = options.metrics || [];
    const dimensionNames  = options.dimensions || [];

    if (metricsNames.length === 0) {
      metricsNames = Object.keys(data.metrics);
    }

    const dhashes = _
      .chain(metricsNames)
      .map((name) => Object.keys(data.metrics[name] || {}))
      .flatten()
      .value();

    const diff = _.difference(dhashes, dimensionNames);

    if (dimensionNames.length === 0 || diff.length === 0) {
      return {
        timerange:   data.timerange,
        dimensions:  _.pick(data.dimensions, dhashes),
        metrics:     _.pick(data.metrics, metricsNames),
      };
    }

    const result:  MetricsData = {
      timerange:   data.timerange,
      dimensions:  {},
      metrics:     {},
    };

    for (const mName of metricsNames) {
      _.each(data.metrics[mName], (metricsValue, dhash) => {
        const newDimensions = _.pick(data.dimensions[dhash], dimensionNames);
        this.updateMetricsData({
          dimensions:  newDimensions,
          name:        mName,
          value:       metricsValue,
        }, result);
      });
    }

    return result;
  }

  public mergeMetricsDataByTimeGranularity(
    datas: MetricsData[],
    granularityInSecond: number,
  ): MetricsData[] {
    const granularity = granularityInSecond * 1000;

    const func = (data: MetricsData) => {
      return (data.timerange.start / granularity).toString();
    };
    const result = this.mergeMetricsDataBy(datas, func);
    for (const data of result) {
      data.timerange.start  = Math.floor(
        data.timerange.start / granularity
      ) * granularity;
      data.timerange.end    = Math.floor(
        data.timerange.start / granularity
      ) * granularity + granularity;
    }
    return result;
  }

  public mergeMetricsDataBy(
    datas: MetricsData[],
    func: (data: MetricsData) => string,
  ): MetricsData[] {
    const grouped = _.groupBy(datas, func);
    const result  = _.map(grouped, (datas) => {
      return this.mergeMetricsData(datas);
    });
    return result;
  }

  public mergeMetricsData(
    ...datas: (MetricsData | MetricsData[])[],
  ): MetricsData {
    const flattenData: MetricsData[] = _.filter(
      _.flatten(datas), (x) => x != null,
    );
    return this.mergeMetricsDataInternal(flattenData, 0, flattenData.length);
  }

  private mergeMetricsDataInternal(
    data: MetricsData[], low: number, high: number,
  ): MetricsData {
    if (low >= high) {
      return null;
    }

    if (low + 1 === high) {
      return data[low];
    }

    const mid    = Math.floor((low + high) / 2);
    const left   = this.mergeMetricsDataInternal(data, low, mid);
    const right  = this.mergeMetricsDataInternal(data, mid, high);

    const metricsNames = _.union(
      Object.keys(left.metrics), Object.keys(right.metrics),
    );
    const metrics: Metrics = {};

    for (const name of metricsNames) {
      metrics[name] = {};

      _.each(left.metrics[name], (val: MetricsValue<any>, dhash: string) => {
        metrics[name][dhash] = val;
      });
      _.each(right.metrics[name], (val: MetricsValue<any>, dhash: string) => {
        if (metrics[name][dhash] == null) {
          metrics[name][dhash] = val;
        } else {
          metrics[name][dhash] = this.operate([metrics[name][dhash], val]);
        }
      });
    }

    return {
      timerange:  {
        start:    Math.min(left.timerange.start, right.timerange.start),
        end:      Math.max(left.timerange.end, right.timerange.end),
      },
      dimensions: _.extend({}, left.dimensions, right.dimensions),
      metrics,
    };
  }
}

export interface UpdateMetricsDataOptions<T> {
  dimensions?:  MetricsDimensions,
  name:         string;
  value:        MetricsValue<T>;
  ts?:          number;
}

export interface MetricsProjectOptions {
  metrics?:     string[];
  dimensions?:  string[];
}

export const operator = new MetricsOperator();
