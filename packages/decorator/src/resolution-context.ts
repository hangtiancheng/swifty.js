import {Registration} from "./dependency-container";

export default class ResolutionContext {
  scopedResolutions = new Map<Registration, any>();
}
