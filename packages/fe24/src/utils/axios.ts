/**
 * Copyright 2026 hangtiancheng
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import axios, { type AxiosInstance } from "axios";
import { ElNotification } from "element-plus";
import { h } from "vue";
import bus from "./bus";
import type { ITimeLineItem } from "@/types/dashboard";

// const appInstance = getCurrentInstance()
// const proxy = appInstance?.proxy

// axios 实例
const httpClient: AxiosInstance = axios.create({
  timeout: 10000, // 请求超时时间
});

// axios 请求拦截器
httpClient.interceptors.request.use(
  (config) => {
    // 等价于 return config
    return Promise.resolve(config);
  },
  (reqErr) => {
    ElNotification({
      title: "请求失败",
      message: h("p", { class: "text-red-500" }, reqErr.message),
      type: "error",
    });
    // 等价于 throw reqErr
    return Promise.reject(reqErr);
  },
);

// axios 响应拦截器
httpClient.interceptors.response.use(
  (res) => {
    const { code, message: msg } = res.data;
    bus.publish("http-response", {
      timestamp: Date.now(),
      message: msg,
    } as ITimeLineItem);
    if (code != 200) {
      ElNotification({
        title: "请求失败",
        message: h("p", { class: "text-red-500" }, msg),
        type: "error",
      });
      throw msg;
    }
    // proxy?.$toast.success(msg)
    return res.data;
  },
  (resErr) => {
    ElNotification({
      title: "HTTP 响应错误",
      message: h("p", { class: "text-red-500" }, resErr.message),
      type: "error",
    });
    throw resErr.message;
  },
);

export default httpClient;
