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

export { Value, Store, StoreOptions, defaultStoreOptions } from "./store.js";
export { LruStore, hashBKRD, maskOfNextPowOf2 } from "./lru.js";
export { ByteView, cloneBytes } from "./byte-view.js";
export {
  Cache,
  CacheOptions,
  CacheStats,
  defaultCacheOptions,
} from "./cache.js";
export {
  Group,
  Getter,
  GroupOption,
  GroupStats,
  newGroup,
  getGroup,
  listGroups,
  destroyGroup,
  destroyAllGroups,
  withExpiration,
  withPeers,
  withCacheOptions,
} from "./group.js";
export { SingleFlightGroup } from "./single-flight.js";
export { ConHashConfig, defaultConHashConfig } from "./config.js";
export {
  ConHashMap,
  ConHashOption,
  withConHashConfig,
} from "./consistent-hash.js";
export { crc32, HashFunc } from "./crc32.js";
export { Peer, PeerPicker } from "./peers.js";
export { Client, ClientOptions } from "./client.js";
export { ClientPicker, PickerOption } from "./client-picker.js";
export { Server, ServerOptions } from "./server.js";
export {
  register,
  RegisterConfig,
  defaultRegisterConfig,
  ServiceDiscovery,
} from "./register.js";
export { validPeerAddr, getLocalIP } from "./utils.js";
export { Logger, log, setLogger } from "./logger.js";
