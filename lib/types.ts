export type Feature = {
  index: number
  description: string
  title: string
  usefulness: number
  confidence: number
  mean_activation: number
  emoji: string
  value: boolean
}

export type Chat = {
  id: string
  title: string
  history: {
    query: string
    prompt_res: string
    act_res: string
  }[]
}
