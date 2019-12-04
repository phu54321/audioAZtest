import { FFmpegAudioPipeline } from '.'

function mkCommand (extraOptions: string, intermediateExt: string) {
  return [
    `ffmpeg -i input.wav ${extraOptions.trim()} temp.${intermediateExt}`,
    `ffmpeg -i temp.${intermediateExt} output.wav`
  ]
}
export default [
  {
    name: '원본',
    commands: [
      'cp input.wav output.wav'
    ]
  },
  {
    name: 'AAC 128k (ffmpeg aac)',
    commands: mkCommand('-c:a aac -b:a 128k', 'm4a')
  },
  {
    name: 'AAC 320k (ffmpeg aac)',
    commands: mkCommand('-c:a aac -b:a 320k', 'm4a')
  },
  {
    name: 'aptX',
    commands: mkCommand('-c:a aptx', 'aptx')
  },
  {
    name: 'aptX HD',
    commands: mkCommand('-c:a aptx_hd', 'aptx')
  }
] as FFmpegAudioPipeline[]
