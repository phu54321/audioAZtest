const FFmpeg = require('./ffmpeg.min')

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
    workerPath: 'worker.min.js',
    // eslint-disable-next-line
    logger: (m: any) => console.log('message', m.message)
  })
  await worker.load()
  return worker
}
