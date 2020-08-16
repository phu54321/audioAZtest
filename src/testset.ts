export interface TestEntry {
  label: string
  audio: HTMLAudioElement
}

export interface TestSet {
  label: string
  entries: TestEntry[]
}

export interface TestJsonEntry {
  label: string
  url: string
  volume: number
}

export interface TestJson {
  label: string
  entries: TestJsonEntry[]
}

export async function loadTestSet (spec: TestJson): Promise<TestSet> {
  return {
    label: spec.label,
    entries: await Promise.all(spec.entries.map(async (entry): Promise<TestEntry> => {
      const label = entry.label
      const url = entry.url

      const blob = await (await fetch(url)).blob()
      const blobURL = URL.createObjectURL(blob)
      const audio = new Audio(blobURL)
      if (entry.volume) audio.volume = entry.volume
      return { label, audio }
    }))
  }
}
