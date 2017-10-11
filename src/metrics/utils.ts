import * as hash             from 'object-hash';

import { MetricsDimensions } from './def';

export function hashDimensions(dimensions: MetricsDimensions): string {
  return hash(dimensions);
}
