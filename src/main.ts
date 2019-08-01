import { Either, isLeft } from 'fp-ts/lib/Either';
import { Option, isNone } from 'fp-ts/lib/Option';
import { Monad2 } from 'fp-ts/lib/Monad';
import { pipeable } from 'fp-ts/lib/pipeable';

declare module 'fp-ts/lib/HKT' {
  interface URItoKind2<E, A> {
    Dataway: Dataway<E, A>;
  }
}

export const URI = 'Dataway';

export type URI = typeof URI;

export interface NotAsked {
  readonly _tag: 'NotAsked';
}

export interface Loading {
  readonly _tag: 'Loading';
}

export interface Failure<E> {
  readonly _tag: 'Failure';
  readonly failure: E;
}

export interface Success<A> {
  readonly _tag: 'Success';
  readonly success: A;
}

export type Dataway<E, A> = NotAsked | Loading | Failure<E> | Success<A>;

export const notAsked: Dataway<never, never> = { _tag: 'NotAsked' };

export const loading: Dataway<never, never> = { _tag: 'Loading' };

export function failure<E = never, A = never>(f: E): Dataway<E, A> {
  return { _tag: 'Failure', failure: f };
}

export function success<E = never, A = never>(s: A): Dataway<E, A> {
  return { _tag: 'Success', success: s };
}

export function isNotAsked<L, A>(ma: Dataway<L, A>): ma is NotAsked {
  return ma._tag === 'NotAsked';
}
export function isLoading<L, A>(ma: Dataway<L, A>): ma is Loading {
  return ma._tag === 'Loading';
}
export function isFailure<L, A>(ma: Dataway<L, A>): ma is Failure<L> {
  return ma._tag === 'Failure';
}
export function isSuccess<L, A>(ma: Dataway<L, A>): ma is Success<A> {
  return ma._tag === 'Success';
}

export const fromEither = <L, A>(e: Either<L, A>) => {
  if (isLeft(e)) {
    return failure<L, A>(e.left);
  }

  return success<L, A>(e.right);
};

export const fromOption = <L>(e: L) => <A>(o: Option<A>) => {
  if (isNone(o)) {
    return failure(e);
  }
  return success(o.value);
};
export const map2 = <L, A, B, C>(
  f: (a: A) => (b: B) => C,
  fa: Dataway<L, A>,
  fb: Dataway<L, B>,
): Dataway<L, C> => dataway.ap(dataway.map(fa, f), fb);

export const map3 = <L, A, B, C, D>(
  f: (a: A) => (b: B) => (c: C) => D,
  fa: Dataway<L, A>,
  fb: Dataway<L, B>,
  fc: Dataway<L, C>,
): Dataway<L, D> => dataway.ap(dataway.ap(dataway.map(fa, f), fb), fc);

export const append = <L, A, B>(
  fa: Dataway<L, A>,
  fb: Dataway<L, B>,
): Dataway<L, [A, B]> => {
  return dataway.ap(dataway.map(fa, (a: A) => (b: B): [A, B] => [a, b]), fb);
};

export const fold = <L, A, B>(
  onNotAsked: () => B,
  onLoading: () => B,
  onFailure: (e: L) => B,
  onSuccess: (a: A) => B,
  ma: Dataway<L, A>,
): B => {
  switch (ma._tag) {
    case 'NotAsked':
      return onNotAsked();

    case 'Loading':
      return onLoading();

    case 'Failure':
      return onFailure(ma.failure);

    case 'Success':
      return onSuccess(ma.success);
  }
};

export const dataway: Monad2<URI> = {
  URI,
  of: success,
  ap: (mab, ma) => {
    switch (ma._tag) {
      case 'NotAsked':
        if (isFailure(mab)) {
          return mab;
        }
        return isNotAsked(mab) ? mab : ma;

      case 'Loading':
        if (isNotAsked(mab) || isFailure(mab)) {
          return mab;
        }
        return isLoading(mab) ? mab : ma;

      case 'Failure':
        return isFailure(mab) ? mab : ma;

      case 'Success':
        if (isSuccess(mab)) {
          return success(mab.success(ma.success));
        }
        return mab;
    }
  },
  map: (ma, f) => (isSuccess(ma) ? success(f(ma.success)) : ma),
  chain: (ma, f) => (isSuccess(ma) ? f(ma.success) : ma),
};

const { ap, map, chain } = pipeable(dataway);

export { ap, map, chain };
