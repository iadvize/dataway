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

export function isNotAsked<E, A>(monadA: Dataway<E, A>): monadA is NotAsked {
  return monadA._tag === 'NotAsked';
}
export function isLoading<E, A>(monadA: Dataway<E, A>): monadA is Loading {
  return monadA._tag === 'Loading';
}
export function isFailure<E, A>(monadA: Dataway<E, A>): monadA is Failure<E> {
  return monadA._tag === 'Failure';
}
export function isSuccess<E, A>(monadA: Dataway<E, A>): monadA is Success<A> {
  return monadA._tag === 'Success';
}

export function fromNullable<E = never, A = never>(
  successValue: A | null | undefined,
): Dataway<E, A> {
  return successValue == null ? notAsked : success(successValue);
}

export const fromEither = <E, A>(either: Either<E, A>) => {
  if (isLeft(either)) {
    return failure<E, A>(either.left);
  }

  return success<E, A>(either.right);
};

export const fromOption = <E>(defaultFailure: E) => <A>(option: Option<A>) => {
  if (isNone(option)) {
    return failure(defaultFailure);
  }
  return success(option.value);
};

export const map2 = <E, A, B, C>(
  f: (a: A) => (b: B) => C,
  functorA: Dataway<E, A>,
  functorB: Dataway<E, B>,
): Dataway<E, C> => dataway.ap(dataway.map(functorA, f), functorB);

export const map3 = <E, A, B, C, D>(
  f: (a: A) => (b: B) => (c: C) => D,
  functorA: Dataway<E, A>,
  functorB: Dataway<E, B>,
  functorC: Dataway<E, C>,
): Dataway<E, D> =>
  dataway.ap(dataway.ap(dataway.map(functorA, f), functorB), functorC);

export const append = <E, A, B>(
  functorA: Dataway<E, A>,
  functorB: Dataway<E, B>,
): Dataway<E, [A, B]> => {
  return dataway.ap(
    dataway.map(functorA, (a: A) => (b: B): [A, B] => [a, b]),
    functorB,
  );
};

export const fold = <E, A, B>(
  onNotAsked: () => B,
  onLoading: () => B,
  onFailure: (failure: E) => B,
  onSuccess: (success: A) => B,
  monadA: Dataway<E, A>,
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
  /**
   * apply MonadA value to MonadAtoB function if both are Success
   * to procude a MonadB
   *
   * following table illustrate the dataway ap combinations
   *
   * | Monad(a -> b)      | Monad(a)     | Result            |
   * | ------------------ | ------------ | ----------------- |
   * | success(a -> b)    | succes(a)    | success(b)        |
   * | success(a -> b)    | notAsked     | notAsked          |
   * | success(a -> b)    | loading      | loading           |
   * | success(a -> b)    | failure(c)   | failure(c)        |
   * | notasked           | failure(c)   | failure(c)        |
   * | loading            | failure(c)   | failure(c)        |
   * | failure(d)         | failure(c)   | failure(d)        |
   */
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
  /**
   * Allow to turn function `a -> b` into a `Dataway a -> Dataway b`
   * Where `Dataway b` use the same constructor value as `Dataway a`
   *
   * | f(a -> b)          | Functor(a)   | Result            |
   * | ------------------ | ------------ | ----------------- |
   * | f(a -> b)          | success(a)   | success(b)        |
   * | f(a -> b)          | notAsked     | notAsked          |
   * | f(a -> b)          | loading      | loading           |
   * | f(a -> b)          | failure(c)   | failure(c)        |
   */
  map: (monadA, func) =>
    isSuccess(monadA) ? success(func(monadA.success)) : monadA,
  /**
   * Allow to turn function `a -> Dataway b` into a `Dataway a -> Dataway b`
   * Where `Dataway b` can use a different constructor than `Dataway a`
   * 
   * | f(a -> Dataway b)  | Monad(a)   | Result      |
   * | ------------------ | ------------ | ----------------- |
   * | f(a -> Success b)  | success(a)   | success(b)        |
   * | f(a -> Failure b)  | success(a)   | failure(b)        |
   * | f(a -> Dataway b)  | success(a)   | Dataway b         |
   * 
   * this allow us to chain function that can produce different variance of Dataway
   * ```
import { dataway, success, failure, loading } from "dataway";

const jsonParse = (json: string) => {
  try {
    return success(JSON.parse(json));
  } catch (error) {
    return failure(error);
  }
};

const checkPayload = payload => {
  if (payload.hasOwnProperty("failure")) {
    return failure(payload.failure);
  }
  return success(payload);
};

const validate = data =>
  dataway.chain(dataway.chain(data, jsonParse), checkPayload);

validate(success("{ \"articles\" : []}"));
// => Success Object
validate(success("{ : []}")));
// => Failure SyntaxError
validate(success("{ \"failure\" : \"server returned 403\"}")));
// => Failure "server returned 403"
validate(loading)
// => Loading;
   * ```
   */
  chain: (monadA, func) => (isSuccess(monadA) ? func(monadA.success) : monadA),
};

const { ap, map, chain } = pipeable(dataway);

export { ap, map, chain };
