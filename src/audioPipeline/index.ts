import { createWorker } from '@/ffmpeg'

export interface FFmpegAudioPipeline {
  name: string
  commands: string[]
}

/**
 * Convert audio. command should be a series of 'ffmpeg' or 'cp', in a sequence
 * converting input.wav to output.wav
 */
export async function applyAudioPipeline (
  audioPipeline: FFmpegAudioPipeline,
  inputWaveData: Uint8Array
): Promise<Uint8Array> {
  const worker = await createWorker()
  try {
    await worker.writeText('input.wav', inputWaveData)
    for (const command of audioPipeline.commands) {
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
