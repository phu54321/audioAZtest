import axios from 'axios'

export interface TestEntry {
  label: string
  audio: HTMLAudioElement
}

export interface TestSet {
  label: string
  entries: TestEntry[]
  comparisonPerPair: number
}

export interface TestJsonEntry {
  label: string
  url: string
  volume: number
}

export interface TestJson {
  label: string
  entries: TestJsonEntry[]
  comparisonPerPair: number | undefined
}

export type AudioLoadProgressCallback = (url: string, percent: number) => void

export async function loadTestSet (
  spec: TestJson,
  cb: AudioLoadProgressCallback | null = null
): Promise<TestSet> {
  return {
    label: spec.label,
    entries: await Promise.all(spec.entries.map(async (entry): Promise<TestEntry> => {
      const label = entry.label
      const url = entry.url

      const response = await axios.get(url, {
        onDownloadProgress (ev) {
          if (cb) cb(url, ev.loaded * 100 / ev.total)
        },
        responseType: 'blob'
      })
      const blobURL = URL.createObjectURL(response.data)
      const audio = new Audio(blobURL)
      if (entry.volume) audio.volume = entry.volume
      return { label, audio }
    })),
    comparisonPerPair: spec.comparisonPerPair || 1
  }
}
