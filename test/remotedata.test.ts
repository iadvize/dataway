import { left, right } from 'fp-ts/lib/Either';

import {
  Dataway,
  dataway,
  notAsked,
  loading,
  failure,
  success,
  map,
  map2,
  map3,
  append,
  fold,
  fromEither,
  fromNullable,
  isFailure,
  isSuccess,
} from '../src/main';

describe('Dataway', () => {
  describe('Functor', () => {
    it('map', () => {
      const f = (s: string): number => s.length;
      expect(map(f)(notAsked)).toEqual(notAsked);
      expect(map(f)(loading)).toEqual(loading);
      expect(map(f)(failure('xyz'))).toEqual(failure('xyz'));
      expect(map(f)(success('abc'))).toEqual(success(3));

      expect(dataway.map(notAsked, f)).toEqual(notAsked);
      expect(dataway.map(loading, f)).toEqual(loading);
      expect(dataway.map(failure('xyz'), f)).toEqual(failure('xyz'));
      expect(dataway.map(success('abc'), f)).toEqual(success(3));
    });
  });

  describe('Apply', () => {
    const f = (s: string): number => s.length;
    it('return failure if any of the Dataway fail', () => {
      expect(dataway.ap(notAsked, failure('xyz'))).toEqual(failure('xyz'));
      expect(dataway.ap(loading, failure('xyz'))).toEqual(failure('xyz'));
      expect(dataway.ap(success(a => a), failure('xyz'))).toEqual(
        failure('xyz'),
      );
      expect(dataway.ap(failure('xyz'), notAsked)).toEqual(failure('xyz'));
      expect(dataway.ap(failure('xyz'), loading)).toEqual(failure('xyz'));
    });

    it('return left failure if two Dataway are failed', () => {
      expect(dataway.ap(failure('xyz'), failure('stu'))).toEqual(
        failure('xyz'),
      );
    });

    it('return Loading if both Dataway are loading or one is a success', () => {
      expect(dataway.ap(loading, loading)).toEqual(loading);
      expect(dataway.ap(loading, success(f))).toEqual(loading);
      expect(dataway.ap(success(a => a), loading)).toEqual(loading);
    });

    it('return NotAsked if one of the Dataway is NotAsked and the other is not Failed', () => {
      expect(dataway.ap(notAsked, notAsked)).toEqual(notAsked);
      expect(dataway.ap(notAsked, loading)).toEqual(notAsked);
      expect(dataway.ap(notAsked, success(f))).toEqual(notAsked);
      expect(dataway.ap(loading, notAsked)).toEqual(notAsked);
      expect(dataway.ap(success(a => a), notAsked)).toEqual(notAsked);
      expect(dataway.ap(notAsked, success(f))).toEqual(notAsked);
    });

    it('return a Dataway with an object of values from two succesfull Dataway', () => {
      expect(dataway.ap(success(f), success('abc'))).toEqual(success(3));
    });

    describe('map2', () => {
      const f = (s1: string) => (s2: string) => `${s1}${s2}`;
      it('return success if both Dataway are success', () => {
        expect(map2(f)(success('abc'), success('def'))).toEqual(
          success('abcdef'),
        );
      });
      it('return failure if one Dataway is a failure', () => {
        expect(map2(f)(success('abc'), failure('xyz'))).toEqual(failure('xyz'));
      });
    });

    describe('map3', () => {
      const f = (s1: string) => (s2: string) => (s3: string) =>
        `${s1}${s2}${s3}`;
      it('return success if all Dataway are success', () => {
        expect(map3(f)(success('abc'), success('def'), success('ghi'))).toEqual(
          success('abcdefghi'),
        );
      });
      it('return failure if one Dataway is a failure', () => {
        expect(map3(f)(success('abc'), failure('xyz'), success('ghi'))).toEqual(
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
    // test  deactivated with Typescript 3.6.2
    // TS dont like the identity function to be given to a `(a: A) -> B` parameter
    // xit('follow Identity law', () => {
    //   const identity = <I>(i: I): I => i;
    //   expect(dataway.ap(dataway.of(identity), success('abc'))).toEqual(
    //     success('abc'),
    //   );
    // });
    it('follow Homomorphism law', () => {
      expect(
        dataway.ap(
          dataway.of<unknown, (s: string) => Dataway<unknown, string>>(success),
          dataway.of('abc'),
        ),
      ).toEqual(dataway.of(success('abc')));
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

  describe('Chain', () => {
    it('follow Identity law', () => {
      const f = <A, B>(s: A): Dataway<string, B> => failure('error');
      expect(dataway.chain(dataway.of('abc'), f)).toEqual(f('abc'));
      expect(dataway.chain(success('abc'), dataway.of)).toEqual(success('abc'));
    });
  });

  it('fold', () => {
    const notaskedvalue = () => 'notAsked';
    const loadingvalue = () => 'loading';
    const onError = (error: string): string => error;
    const onSuccess = (value: string): string => value.length.toString();
    expect(
      fold(notaskedvalue, loadingvalue, onError, onSuccess)(notAsked),
    ).toEqual('notAsked');
    expect(
      fold(notaskedvalue, loadingvalue, onError, onSuccess)(loading),
    ).toEqual('loading');
    expect(
      fold(
        notaskedvalue,
        loadingvalue,
        onError,
        onSuccess,
      )(
        failure('error loading resource'),
      ),
    ).toEqual('error loading resource');
    expect(
      fold(notaskedvalue, loadingvalue, onError, onSuccess)(success('axel')),
    ).toEqual('4');
  });

  describe('fromEither', () => {
    it('create failure from Left', () => {
      const myError = 'my error';
      const eitherLeft = left(myError);

      const data = fromEither(eitherLeft);
      const content = fold(
        () => 'not asked',
        () => 'loading',
        error => error,
        value => value,
      )(data);

      expect(isFailure(data)).toEqual(true);
      expect(content).toEqual(myError);
    });

    it('create success from Right', () => {
      const myValue = 'my value';
      const eitherRight = right(myValue);

      const data = fromEither(eitherRight);
      const content = fold(
        () => 'not asked',
        () => 'loading',
        error => error,
        value => value,
      )(data);

      expect(isSuccess(data)).toEqual(true);
      expect(content).toEqual(myValue);
    });
  });

  describe('fromNullable', () => {
    it('create NotAsked from null', () => {
      expect(fromNullable(null)).toEqual(notAsked);
    });
    it('create NotAsked from undefined', () => {
      expect(fromNullable(undefined)).toEqual(notAsked);
    });
    it('create Success<E, A> from any value different from null and undefined', () => {
      expect(fromNullable('')).toEqual(success(''));
      expect(fromNullable('test')).toEqual(success('test'));
      expect(fromNullable([])).toEqual(success([]));
      expect(fromNullable({})).toEqual(success({}));
    });
  });
});
