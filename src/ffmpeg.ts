const FFmpeg = require('@ffmpeg/ffmpeg')

interface FFmpegWorkerInterface {
  writeText(path: string, data: string | ArrayBufferView): Promise<void>
  read(path: string): Promise<{ data: Uint8Array }>
  run(command: string): Promise<void>
}

FFmpeg.setLogging(true)

export async function createWorker (): Promise<FFmpegWorkerInterface> {
  const worker = FFmpeg.createWorker({
    corePath: 'ffmpeg-core.js',
    logger: (m: any) => console.log('message', m),
    progress: (p: any) => console.log('progress', p)
  })
  await worker.load()
  return worker
}
