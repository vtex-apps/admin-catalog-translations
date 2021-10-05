import XLSX from 'xlsx'

/**
 * Parse json to XLS and prompt a download window for user
 *
 * @param {object} data JSON to be parsed to xls
 * @param {object} options
 * @param {options.fileName} string
 * @param {options.sheetName} string
 */

export function parseJSONToXLS(
  data: unknown[],
  { fileName, sheetName }: { fileName: string; sheetName: string }
) {
  const workSheet = XLSX.utils.json_to_sheet(data)
  const workBook = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(workBook, workSheet, sheetName)
  const exportFileName = `${fileName}.xlsx`
  XLSX.writeFile(workBook, exportFileName)
}

export function parseXLSToJSON(
  file: Blob,
  { sheetName }: { sheetName: string }
): Promise<Array<{}>> {
  const promise = new Promise<Array<{}>>((resolve, reject) => {
    const fileReader = new FileReader()
    fileReader.onload = (e: ProgressEvent<FileReader>) => {
      const data = e.target?.result
      const workbook = XLSX.read(data, { type: 'binary' })
      const [fileSheetName] = workbook.SheetNames

      if (fileSheetName !== sheetName) {
        reject(`Sheet name - ${fileSheetName} - doesn't match ${sheetName}`)
        return
      }

      const json = XLSX.utils.sheet_to_json<{}>(workbook.Sheets[sheetName])
      resolve(json)
    }
    fileReader.onerror = () => {
      reject('Error parsing file')
    }
    fileReader.readAsBinaryString(file)
  })
  return promise
}
