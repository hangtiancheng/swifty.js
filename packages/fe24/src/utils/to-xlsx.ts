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

import * as XLSX from "xlsx";

export function tableData2xlsx<T>(tableData: T[], xlsxName: string) {
  if (!xlsxName.endsWith(".xlsx")) {
    xlsxName += ".xlsx";
  }
  const workSheet = XLSX.utils.json_to_sheet(tableData);
  const workBook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workBook, workSheet, "Sheet 1");
  const xlsxData = XLSX.write(workBook, {
    bookType: "xlsx",
    type: "array",
  });
  const blob = new Blob([xlsxData], { type: "application/octet-stream" });
  downloadBlob(blob, xlsxName);
}

export function element2xlsx(elem: HTMLElement, xlsxName: string) {
  if (!xlsxName.endsWith(".xlsx")) {
    xlsxName += ".xlsx";
  }
  const workBook = XLSX.utils.table_to_book(elem);
  XLSX.writeFile(workBook, `${xlsxName}.xlsx`);
}

function downloadBlob(blob: Blob, filename: string) {
  const anchor = document.createElement("a");
  const url = URL.createObjectURL(blob);
  anchor.href = url;
  // anchor.setAttribute('download', filename)
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
  URL.revokeObjectURL(url);
}
