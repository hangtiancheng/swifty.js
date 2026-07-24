/**
 * Copyright (c) 2026 hangtiancheng
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */

import { InjectionToken } from ".";

export default abstract class RegistryBase<T> {
  protected _registryMap = new Map<InjectionToken<any>, T[]>();

  public entries(): IterableIterator<[InjectionToken<any>, T[]]> {
    return this._registryMap.entries();
  }

  public getAll(key: InjectionToken<any>): T[] {
    this.ensure(key);
    return this._registryMap.get(key)!;
  }

  public get(key: InjectionToken<any>): T | null {
    this.ensure(key);
    const value = this._registryMap.get(key)!;
    return value[value.length - 1] || null;
  }

  public set(key: InjectionToken<any>, value: T): void {
    this.ensure(key);
    this._registryMap.get(key)!.push(value);
  }

  public setAll(key: InjectionToken<any>, value: T[]): void {
    this._registryMap.set(key, value);
  }

  public has(key: InjectionToken<any>): boolean {
    this.ensure(key);
    return this._registryMap.get(key)!.length > 0;
  }

  public clear(): void {
    this._registryMap.clear();
  }

  private ensure(key: InjectionToken<any>): void {
    if (!this._registryMap.has(key)) {
      this._registryMap.set(key, []);
    }
  }
}
