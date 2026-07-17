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

import { Connect } from "vite";
import { adminMenu, userMenu } from "../constants";
import { ILoginResData, IResData } from "../types";
import url from "node:url";

const loginFn: Connect.NextHandleFunction = (req, res) => {
  res.setHeader("Content-Type", "application/json");
  const parseUrl = url.parse(
    req.originalUrl!,
    true /* parseQueryString */,
  ).query;
  const { username, password } = parseUrl;
  let resData: ILoginResData & IResData;
  if (username === "admin" && password === "1111") {
    resData = {
      code: 200,
      message: "登录成功",
      data: {
        token: "token",
        auth: "admin",
        menuList: adminMenu,
      },
    };
  } else if (username === "user" && password === "1111") {
    resData = {
      code: 200,
      message: "登录成功",
      data: {
        token: "token",
        auth: "user",
        menuList: userMenu,
      },
    };
  } else {
    resData = {
      code: 400,
      message: "账号或密码错误",
    };
  }
  res.end(JSON.stringify(resData));
};

export default loginFn;
