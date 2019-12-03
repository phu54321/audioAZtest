const FFmpeg = require('@ffmpeg/ffmpeg')

interface FFmpegWorkerInterface {
  writeText(path: string, data: string | ArrayBufferView): Promise<void>
  read(path: string): Promise<{ data: Uint8Array }>
  run(command: string): Promise<void>
  terminate(): Promise<void>

  worker: Worker
}

export async function createWorker (): Promise<FFmpegWorkerInterface> {
  const worker = FFmpeg.createWorker({
    corePath: 'ffmpeg-core.js',
    logger: (m: any) => console.log('message', m)
  })
  await worker.load()
  return worker
}

/**
 * Convert audio. command should be a series of 'ffmpeg' or 'cp', in a sequence
 * converting input.wav to output.wav
 */
export async function convertAudio (
  inputWaveData: Uint8Array,
  commands: string[]
): Promise<Uint8Array> {
  const worker = await createWorker()
  try {
    await worker.writeText('input.wav', inputWaveData)
    for (const command of commands) {
      // ffmpeg command
      if (command.startsWith('ffmpeg ')) {
        await worker.run(command.substr(7))
      } else if (command.startsWith('cp ')) {
        const args = command.trim().split(' ')
        if (args.length !== 3) throw new Error('Invalid cp')
        const { data } = await worker.read(args[1])
        await worker.writeText(args[2], data)
      }
    }
    const { data } = await worker.read('output.wav')
    return data
  } finally {
    worker.worker.terminate()
  }
}
