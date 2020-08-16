export interface TestEntry {
  label: string;
  audio: HTMLAudioElement;
}

export interface TestSet {
  label: string;
  entries: TestEntry[];
}

export async function loadTestSet (jsonURL: string): Promise<TestSet> {
  const response = await (await fetch(jsonURL)).json()
  return {
    label: response.label,
    entries: await Promise.all(response.entries.map(async (entry: any): Promise<TestEntry> => {
      const label: string = entry.label
      const url: string = entry.url

      const blob = await (await fetch(url)).blob()
      const blobURL = URL.createObjectURL(blob)
      const audio = new Audio(blobURL)
      if (entry.volume) audio.volume = entry.volume
      return { label, audio }
    }))
  }
}
