interface Messages {
  errors: Message[]
  warnings: Message[]
}

interface Message {
  line: number
  missingFields: []
}

type EntryHeaders<EntryType> = Extract<keyof EntryType, string> | 'locale'

export function sanitizeImportJSON<EntryType>({
  data,
  entryHeaders,
  requiredHeaders,
}: {
  data: Array<{}>
  entryHeaders: Array<EntryHeaders<EntryType>>
  requiredHeaders: string[]
}): [Array<Record<EntryHeaders<EntryType>, string>>, Messages] {
  const warningList = []
  const errorList = []
  const entryList = []

  for (let i = 0; i < data.length; i++) {
    const entry = data[i]
    const { warnings, errors } = validateEntry<EntryType>(entry, {
      entryHeaders,
      requiredHeaders,
    })

    if (errors.length) {
      errorList.push({
        line: i + 2,
        missingFields: errors,
      } as Message)
    } else {
      const entrySanitize = createEntry<EntryType>(entry, entryHeaders)
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

function validateEntry<EntryType>(
  entry: {},
  {
    entryHeaders,
    requiredHeaders,
  }: {
    entryHeaders: Array<EntryHeaders<EntryType>>
    requiredHeaders: string[]
  }
) {
  const warnings: string[] = []
  const errors: string[] = []

  const optinalFields = entryHeaders.filter(
    (header) => !requiredHeaders.includes(header as string)
  )

  const entryFields = Object.keys(entry)
  requiredHeaders.forEach((field) => {
    if (entryFields.indexOf(field) === -1) {
      errors.push(field)
    }
  })

  optinalFields.forEach((field) => {
    if (entryFields.indexOf(field) === -1) {
      warnings.push(field)
    }
  })

  return { warnings, errors }
}

function createEntry<EntryType>(
  entry: Record<string, string>,
  entryHeaders: Array<EntryHeaders<EntryType>>
) {
  const entrySanitized = {} as Record<EntryHeaders<EntryType>, string>
  entryHeaders.forEach((header) => {
    if (entry[header]) {
      entrySanitized[header] = entry[header]
    }
  })

  return entrySanitized
}
