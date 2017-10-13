import * as metrics from '../../src/metrics';

describe('metrics.operators', () => {

  describe('#updateMetricsData', () => {

    it('creates empty metrics data', () => {
      const val = metrics.operator.updateMetricsData(
        {}, 'a.counter', metrics.Count(1),
      );
      val.should.be.deepEqual({
        dimensions: {
          '323217f643c3e3f1fe7532e72ac01bb0748c97be': {},
        },
        metrics: {
          'a.counter': {
            '323217f643c3e3f1fe7532e72ac01bb0748c97be': {
              oper: 'count',
              val: 1,
            },
          },
        },
      });
    });

    it('updates existing metrics data', () => {
      const val = metrics.operator.updateMetricsData(
        {}, 'a.counter', metrics.Count(1),
      );
      metrics.operator.updateMetricsData({}, 'a.counter', metrics.Count(1), val);
      val.should.be.deepEqual({
        dimensions: {
          '323217f643c3e3f1fe7532e72ac01bb0748c97be': {},
        },
        metrics: {
          'a.counter': {
            '323217f643c3e3f1fe7532e72ac01bb0748c97be': {
              oper: 'count',
              val: 2,
            },
          },
        },
      });
    });
  });

  describe('#projectMetricsData', () => {

    it('projects for metrics', () => {
      const val = metrics.operator.updateMetricsData(
        {}, 'a.counter', metrics.Count(1),
      );
      metrics.operator.updateMetricsData(
        {}, 'b.counter', metrics.Count(1), val,
      );
      const v2 = metrics.operator.projectMetricsData(val, {
        metrics: ['a.counter'],
      });
      v2.should.be.deepEqual({
        dimensions: {
          '323217f643c3e3f1fe7532e72ac01bb0748c97be': {},
        },
        metrics: {
          'a.counter': {
            '323217f643c3e3f1fe7532e72ac01bb0748c97be': {
              oper: 'count',
              val: 1,
            },
          },
        },
      });

      val.should.be.deepEqual({
        dimensions: {
          '323217f643c3e3f1fe7532e72ac01bb0748c97be': {},
        },
        metrics: {
          'a.counter': {
            '323217f643c3e3f1fe7532e72ac01bb0748c97be': {
              oper: 'count',
              val: 1,
            },
          },
          'b.counter': {
            '323217f643c3e3f1fe7532e72ac01bb0748c97be': {
              oper: 'count',
              val: 1,
            },
          },
        },
      });
    });

    it('projects for dimensions', () => {
      const val = metrics.operator.updateMetricsData(
        { foo: 1, bar: 1 }, 'a.counter', metrics.Count(1),
      );
      metrics.operator.updateMetricsData(
        { foo: 1, bar: 2 }, 'a.counter', metrics.Count(1), val,
      );
      const v2 = metrics.operator.projectMetricsData(val, {
        dimensions: ['foo'],
      });
      v2.should.be.deepEqual({
        dimensions: {
          '398d5c982d815a5000ff5cee2fdbc114d24125e2': {
            foo: 1,
          },
        },
        metrics: {
          'a.counter': {
            '398d5c982d815a5000ff5cee2fdbc114d24125e2': {
              oper: 'count',
              val: 2,
            },
          },
        },
      });

      val.should.be.deepEqual({
        dimensions: {
          'b8a5e8d98676950b4bc57ab2f6087f6d1862b603': {
            foo: 1,
            bar: 2,
          },
          'd5d34c01b0186ef617703fced24b20163bec26b4': {
            foo: 1,
            bar: 1,
          },
        },
        metrics: {
          'a.counter': {
            'b8a5e8d98676950b4bc57ab2f6087f6d1862b603': {
              oper: 'count',
              val: 1,
            },
            'd5d34c01b0186ef617703fced24b20163bec26b4': {
              oper: 'count',
              val: 1,
            },
          },
        },
      });

    });
  });

  describe('#mergeMetricsData', () => {

    it('merges successfully', () => {
      const val1 = metrics.operator.updateMetricsData(
        { foo: 1, bar: 1 }, 'a.counter', metrics.Count(1),
      );
      const val2 = metrics.operator.updateMetricsData(
        { foo: 1, bar: 1 }, 'a.counter', metrics.Count(1),
      );

      const val = metrics.operator.mergeMetricsData(val1, val2);
      val.should.be.deepEqual({
        dimensions: {
          'd5d34c01b0186ef617703fced24b20163bec26b4': {
            foo: 1,
            bar: 1,
          },
        },
        metrics: {
          'a.counter': {
            'd5d34c01b0186ef617703fced24b20163bec26b4': {
              oper: 'count',
              val: 2,
            },
          },
        },
      });
    });
  });
});
