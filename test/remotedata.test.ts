import {
  dataway,
  notAsked,
  loading,
  failure,
  success,
  map2,
  map3,
  append,
} from '../src/main';

describe('Dataway', () => {
  it('map', () => {
    const f = (s: string): number => s.length;
    expect(notAsked<string, string>().map(f)).toEqual(notAsked());
    expect(loading<string, string>().map(f)).toEqual(loading());
    expect(failure<string, string>('xyz').map(f)).toEqual(failure('xyz'));
    expect(success('abc').map(f)).toEqual(success(3));

    expect(dataway.map(notAsked<string, string>(), f)).toEqual(notAsked());
    expect(dataway.map(loading<string, string>(), f)).toEqual(loading());
    expect(dataway.map(failure<string, string>('xyz'), f)).toEqual(
      failure('xyz'),
    );
    expect(dataway.map(success('abc'), f)).toEqual(success(3));
  });

  describe('ap', () => {
    const f = (s: string): number => s.length;
    it('return failure if any of the Dataway fail', () => {
      expect(
        notAsked<string, string>().ap(
          failure<string, (s: string) => number>('xyz'),
        ),
      ).toEqual(failure('xyz'));
      expect(
        loading<string, string>().ap(
          failure<string, (s: string) => number>('xyz'),
        ),
      ).toEqual(failure('xyz'));
      expect(success('abc').ap(failure('xyz'))).toEqual(failure('xyz'));
      expect(
        failure<string, string>('xyz').ap(
          notAsked<string, (s: string) => number>(),
        ),
      ).toEqual(failure('xyz'));
      expect(
        failure<string, string>('xyz').ap(
          loading<string, (s: string) => number>(),
        ),
      ).toEqual(failure('xyz'));
      expect(
        failure<string, string>('xyz').ap(
          success<string, (s: string) => number>(f),
        ),
      ).toEqual(failure('xyz'));
    });

    it('return left failure if two Dataway are failed', () => {
      expect(
        failure<string, string>('xyz').ap(
          failure<string, (s: string) => number>('stu'),
        ),
      ).toEqual(failure('stu'));
    });

    it('return Loading if both Dataway are loading or one is a success', () => {
      expect(
        loading<string, string>().ap(loading<string, (s: string) => number>()),
      ).toEqual(loading());
      expect(
        loading<string, string>().ap(success<string, (s: string) => number>(f)),
      ).toEqual(loading());
      expect(success('abc').ap(loading())).toEqual(loading());
    });

    it('return NotAsked if one of the Dataway is NotAsked and the other is not Failed', () => {
      expect(
        notAsked<string, string>().ap(
          notAsked<string, (s: string) => number>(),
        ),
      ).toEqual(notAsked());
      expect(
        notAsked<string, string>().ap(loading<string, (s: string) => number>()),
      ).toEqual(notAsked());
      expect(
        notAsked<string, string>().ap(
          success<string, (s: string) => number>(f),
        ),
      ).toEqual(notAsked());
      expect(
        loading<string, string>().ap(notAsked<string, (s: string) => number>()),
      ).toEqual(notAsked());
      expect(success('abc').ap(notAsked())).toEqual(notAsked());
      expect(notAsked<string, string>().ap(success(f))).toEqual(notAsked());
    });

    it('return a Dataway with an object of values from two succesfull Dataway', () => {
      expect(success('abc').ap(success(f))).toEqual(success(3));
    });

    describe('map2', () => {
      const f = (s1: string) => (s2: string) => `${s1}${s2}`;
      it('return success if both Dataway are success', () => {
        expect(map2(f, success('abc'), success('def'))).toEqual(
          success('abcdef'),
        );
      });
      it('return failure if one Dataway is a failure', () => {
        expect(map2(f, success('abc'), failure('xyz'))).toEqual(failure('xyz'));
      });
    });

    describe('map3', () => {
      const f = (s1: string) => (s2: string) => (s3: string) =>
        `${s1}${s2}${s3}`;
      it('return success if all Dataway are success', () => {
        expect(map3(f, success('abc'), success('def'), success('ghi'))).toEqual(
          success('abcdefghi'),
        );
      });
      it('return failure if one Dataway is a failure', () => {
        expect(map3(f, success('abc'), failure('xyz'), success('ghi'))).toEqual(
          failure('xyz'),
        );
      });
    });

    describe('append', () => {
      it('return success if both Dataway are success', () => {
        expect(append(success('abc'), success('def'))).toEqual(
          success(['abc', 'def']),
        );
      });
      it('return failure if one Dataway is a failure', () => {
        expect(append(success('abc'), failure('xyz'))).toEqual(failure('xyz'));
      });
    });
  });

  describe('Applicative', () => {
    it('follow Identity law', () => {
      expect(
        dataway.ap(
          dataway.of<string, (a: string) => string>(a => a),
          success('abc'),
        ),
      ).toEqual(success('abc'));
    });
    it('follow Homomorphism law', () => {
      expect(dataway.ap(dataway.of(success), dataway.of('abc'))).toEqual(
        dataway.of(success('abc')),
      );
    });
    it('follow Interchange law', () => {
      const f = (s: string): number => s.length;
      expect(dataway.ap(success(f), dataway.of('abc'))).toEqual(
        dataway.ap(
          dataway.of<string, (a: (b: string) => number) => number>(ab =>
            ab('abc'),
          ),
          success(f),
        ),
      );
    });
  });
});
