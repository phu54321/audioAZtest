const FFmpeg = require('@ffmpeg/ffmpeg')

interface FFmpegWorkerInterface {
  write(path: string, data: Uint8Array | string): Promise<void>
  read(path: string): Promise<{ data: Uint8Array }>
  run(command: string): Promise<void>
}

export async function createWorker (): Promise<FFmpegWorkerInterface> {
  const worker = FFmpeg.createWorker({
    corePath: 'ffmpeg-core.js',
    logger: (m: {message: string}) => console.log(m)
  })
  await worker.load()
  return worker
}
