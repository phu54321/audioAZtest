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
