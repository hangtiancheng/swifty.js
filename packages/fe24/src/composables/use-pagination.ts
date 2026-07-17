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

import { onMounted, reactive } from "vue";

export function usePagination(
  loadData: () => Promise<void>,
  initialPageSize: number = 10,
) {
  onMounted(loadData);

  const pageInfo = reactive({
    pageNum: 1,
    pageSize: initialPageSize,
    total: 0,
  });

  const handleSizeChange = (newPageSize: number) => {
    pageInfo.pageSize = newPageSize;
    loadData();
  };

  const handleCurrentChange = (newPageNum: number) => {
    pageInfo.pageNum = newPageNum;
    loadData();
  };

  const resetPagination = () => {
    pageInfo.pageNum = 1;
    pageInfo.pageSize = initialPageSize;
  };

  const setTotal = (total: number) => {
    pageInfo.total = total;
  };

  const setPageInfo = (info: Partial<typeof pageInfo>) => {
    Object.assign(pageInfo, info);
  };

  return {
    handleSizeChange,
    handleCurrentChange,
    resetPagination,
    pageInfo,
    setTotal,
    setPageInfo,
  };
}
