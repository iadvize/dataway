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

export function failure<E = never, A = never>(failure: E): Dataway<E, A> {
  return { _tag: 'Failure', failure };
}

export function success<E = never, A = never>(success: A): Dataway<E, A> {
  return { _tag: 'Success', success };
}

export function fromNullable<E = never, A = never>(
  successValue: A | null | undefined,
): Dataway<E, A> {
  return successValue == null ? notAsked : success(successValue);
}

export function isNotAsked<L, A>(monadA: Dataway<L, A>): monadA is NotAsked {
  return monadA._tag === 'NotAsked';
}
export function isLoading<L, A>(monadA: Dataway<L, A>): monadA is Loading {
  return monadA._tag === 'Loading';
}
export function isFailure<L, A>(monadA: Dataway<L, A>): monadA is Failure<L> {
  return monadA._tag === 'Failure';
}
export function isSuccess<L, A>(monadA: Dataway<L, A>): monadA is Success<A> {
  return monadA._tag === 'Success';
}

export const fromEither = <L, A>(either: Either<L, A>) => {
  if (isLeft(either)) {
    return failure<L, A>(either.left);
  }

  return success<L, A>(either.right);
};

export const fromOption = <L>(defaultFailure: L) => <A>(option: Option<A>) => {
  if (isNone(option)) {
    return failure(defaultFailure);
  }
  return success(option.value);
};
export const map2 = <L, A, B, C>(
  f: (a: A) => (b: B) => C,
  functorA: Dataway<L, A>,
  functorB: Dataway<L, B>,
): Dataway<L, C> => dataway.ap(dataway.map(functorA, f), functorB);

export const map3 = <L, A, B, C, D>(
  f: (a: A) => (b: B) => (c: C) => D,
  functorA: Dataway<L, A>,
  functorB: Dataway<L, B>,
  functorC: Dataway<L, C>,
): Dataway<L, D> =>
  dataway.ap(dataway.ap(dataway.map(functorA, f), functorB), functorC);

export const append = <L, A, B>(
  functorA: Dataway<L, A>,
  functorB: Dataway<L, B>,
): Dataway<L, [A, B]> => {
  return dataway.ap(
    dataway.map(functorA, (a: A) => (b: B): [A, B] => [a, b]),
    functorB,
  );
};

export const fold = <L, A, B>(
  onNotAsked: () => B,
  onLoading: () => B,
  onFailure: (failure: L) => B,
  onSuccess: (success: A) => B,
  monadA: Dataway<L, A>,
): B => {
  switch (monadA._tag) {
    case 'NotAsked':
      return onNotAsked();

    case 'Loading':
      return onLoading();

    case 'Failure':
      return onFailure(monadA.failure);

    case 'Success':
      return onSuccess(monadA.success);
  }
};

export const dataway: Monad2<URI> = {
  URI,
  of: success,
  ap: (monadAtoB, monadA) => {
    switch (monadA._tag) {
      case 'NotAsked':
        if (isFailure(monadAtoB)) {
          return monadAtoB;
        }
        return isNotAsked(monadAtoB) ? monadAtoB : monadA;

      case 'Loading':
        if (isNotAsked(monadAtoB) || isFailure(monadAtoB)) {
          return monadAtoB;
        }
        return isLoading(monadAtoB) ? monadAtoB : monadA;

      case 'Failure':
        return isFailure(monadAtoB) ? monadAtoB : monadA;

      case 'Success':
        if (isSuccess(monadAtoB)) {
          return success(monadAtoB.success(monadA.success));
        }
        return monadAtoB;
    }
  },
  map: (monadA, func) =>
    isSuccess(monadA) ? success(func(monadA.success)) : monadA,
  chain: (monadA, func) => (isSuccess(monadA) ? func(monadA.success) : monadA),
};

const { ap, map, chain } = pipeable(dataway);

export { ap, map, chain };
