export interface MetricsValue<V> {
  oper:    string;
  val:      V;
}

export interface Operator<T> {
  (val1: T, val2: T): T;
}

export interface Metrics {
  [name: string]: MetricsSet;
}

export interface MetricsSet {
  [dhash: string]: MetricsValue<any>;
}

export interface MetricsDimensions {
  [name: string]: number|string|boolean;
}

export interface Dimensions {
  [dhash: string]: MetricsDimensions;
}

export interface MetricsData {
  dimensions: Dimensions;
  metrics:    Metrics;
}
