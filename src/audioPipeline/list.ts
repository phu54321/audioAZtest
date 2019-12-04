import { FFmpegAudioPipeline } from '.'

function mkCommand (extraOptions: string, intermediateExt: string) {
  return [
    `ffmpeg -i input.wav ${extraOptions.trim()} temp.${intermediateExt}`,
    `ffmpeg -i temp.${intermediateExt} output.wav`
  ]
}
export default [
  {
    name: 'Original',
    commands: [
      'cp input.wav output.wav'
    ]
  },
  {
    name: 'AAC 96k (ffmpeg aac)',
    commands: mkCommand('-c:a aac -b:a 96k', 'm4a')
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
    name: 'MP3 128k (LAME encoder)',
    commands: mkCommand('-c:a libmp3lame -b:a 128k', 'mp3')
  },
  {
    name: 'MP3 192k (LAME encoder)',
    commands: mkCommand('-c:a libmp3lame -b:a 192k', 'mp3')
  },
  {
    name: 'MP3 320k (LAME encoder)',
    commands: mkCommand('-c:a libmp3lame -b:a 320k', 'mp3')
  },
  {
    name: 'SBC 128k (Bad connection)',
    commands: mkCommand('-c:a sbc -b:a 128k', 'sbc')
  },
  {
    name: 'SBC 229k (Joint stereo, 44.1kHz, Middle quality)',
    commands: mkCommand('-c:a sbc -b:a 229k', 'sbc')
  },
  {
    name: 'SBC 328k (Joint stereo, 44.1khz, Moderate Quality)',
    commands: mkCommand('-c:a sbc -b:a 328k', 'sbc')
  },
  {
    name: 'aptX 128k (Bad connection)',
    commands: mkCommand('-c:a aptx -b:a 128k', 'aptx')
  },
  {
    name: 'aptX 352k (Lower latency mode, Middle quality) ',
    commands: mkCommand('-c:a aptx -b:a 352k', 'aptx')
  },
  {
    name: 'aptX HD 576k',
    commands: mkCommand('-c:a aptx_hd -b:a 576k', 'aptx')
  }
] as FFmpegAudioPipeline[]
