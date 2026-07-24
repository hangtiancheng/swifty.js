import RegistryBase from "./registry-base";
import {InterceptionOptions} from "./types";
import {
  PostResolutionInterceptorCallback,
  PreResolutionInterceptorCallback
} from "./types/dependency-container";

export interface PreResolutionInterceptor {
  callback: PreResolutionInterceptorCallback;
  options: InterceptionOptions;
}

export interface PostResolutionInterceptor {
  callback: PostResolutionInterceptorCallback;
  options: InterceptionOptions;
}

export class PreResolutionInterceptors extends RegistryBase<PreResolutionInterceptor> {}

export class PostResolutionInterceptors extends RegistryBase<PostResolutionInterceptor> {}

export default class Interceptors {
  public preResolution: PreResolutionInterceptors =
    new PreResolutionInterceptors();
  public postResolution: PostResolutionInterceptors =
    new PostResolutionInterceptors();
}
