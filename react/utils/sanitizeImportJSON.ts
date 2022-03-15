export function sanitizeImportJSON({
  data,
  entryHeaders,
  requiredHeaders,
}: {
  data: Array<{}>
  entryHeaders: EntryHeaders[]
  requiredHeaders: string[]
}): [Array<Record<EntryHeaders, string>>, Messages] {
  const warningList = []
  const errorList = []
  const entryList: Array<Record<EntryHeaders, string>> = []

  for (let i = 0; i < data.length; i++) {
    const entry = data[i]
    const { warnings, errors } = validateEntry(entry, {
      entryHeaders,
      requiredHeaders,
    })

    if (errors.length) {
      errorList.push({
        line: i + 2,
        missingFields: errors,
      } as Message)
    } else {
      const entrySanitize = createEntry(entry, entryHeaders)
      entryList.push(entrySanitize)

      if (warnings.length) {
        warningList.push({
          line: i + 2,
          missingFields: warnings,
        } as Message)
      }
    }
  }

  return [entryList, { warnings: warningList, errors: errorList }]
}

function validateEntry(
  entry: {},
  {
    entryHeaders,
    requiredHeaders,
  }: {
    entryHeaders: EntryHeaders[]
    requiredHeaders: string[]
  }
) {
  const warnings: string[] = []
  const errors: string[] = []

  const optionalFields = entryHeaders.filter(
    (header) => !requiredHeaders.includes(header as string)
  )

  const entryFields = Object.keys(entry)
  requiredHeaders.forEach((field) => {
    if (entryFields.indexOf(field) === -1) {
      errors.push(field)
    }
  })

  optionalFields.forEach((field) => {
    if (entryFields.indexOf(field) === -1) {
      warnings.push(field)
    }
  })

  return { warnings, errors }
}

function createEntry(
  entry: Record<string, string>,
  entryHeaders: EntryHeaders[]
) {
  const entrySanitized = {} as Record<EntryHeaders, string>
  entryHeaders.forEach((header) => {
    if (entry[header]) {
      entrySanitized[header] = entry[header]
    }
  })

  return entrySanitized
}
