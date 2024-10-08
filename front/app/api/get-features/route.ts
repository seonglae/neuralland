import { NextRequest } from 'next/server'

// Mock API Routes in Next.js (app directory version)
export const GET = async (req: NextRequest) => {
  // Mock data for features
  const features = [
    {
      index: 0,
      description: "Improves clarity and conciseness of text",
      title: "Clarity Boost",
      emoji: "📝",
      usefulness: 4.5,
      confidence: 3.8,
      mean_activation: 2.7,
      value: false
    },
    {
      index: 1,
      description: "Adds more emotional tone to generated text",
      title: "Emotion Enhancer",
      emoji: "❤️",
      usefulness: 4.2,
      confidence: 4.0,
      mean_activation: 3.1,
      value: false
    },
    {
      index: 2,
      description: "Optimizes content for search engines",
      title: "SEO Optimizer",
      emoji: "🔍",
      usefulness: 4.8,
      confidence: 4.5,
      mean_activation: 3.9,
      value: false
    },
    {
      index: 0,
      description: "Improves clarity and conciseness of text",
      title: "Clarity Boost",
      emoji: "📝",
      usefulness: 4.5,
      confidence: 3.8,
      mean_activation: 2.7,
      value: false
    },
    {
      index: 1,
      description: "Adds more emotional tone to generated text",
      title: "Emotion Enhancer",
      emoji: "❤️",
      usefulness: 4.2,
      confidence: 4.0,
      mean_activation: 3.1,
      value: false
    },
    {
      index: 2,
      description: "Optimizes content for search engines",
      title: "SEO Optimizer",
      emoji: "🔍",
      usefulness: 4.8,
      confidence: 4.5,
      mean_activation: 3.9,
      value: false
    },
    {
      index: 0,
      description: "Improves clarity and conciseness of text",
      title: "Clarity Boost",
      emoji: "📝",
      usefulness: 4.5,
      confidence: 3.8,
      mean_activation: 2.7,
      value: false
    },
    {
      index: 1,
      description: "Adds more emotional tone to generated text",
      title: "Emotion Enhancer",
      emoji: "❤️",
      usefulness: 4.2,
      confidence: 4.0,
      mean_activation: 3.1,
      value: false
    },
    {
      index: 2,
      description: "Optimizes content for search engines",
      title: "SEO Optimizer",
      emoji: "🔍",
      usefulness: 4.8,
      confidence: 4.5,
      mean_activation: 3.9,
      value: false
    },
    {
      index: 0,
      description: "Improves clarity and conciseness of text",
      title: "Clarity Boost",
      emoji: "📝",
      usefulness: 4.5,
      confidence: 3.8,
      mean_activation: 2.7,
      value: false
    },
    {
      index: 1,
      description: "Adds more emotional tone to generated text",
      title: "Emotion Enhancer",
      emoji: "❤️",
      usefulness: 4.2,
      confidence: 4.0,
      mean_activation: 3.1,
      value: false
    },
    {
      index: 2,
      description: "Optimizes content for search engines",
      title: "SEO Optimizer",
      emoji: "🔍",
      usefulness: 4.8,
      confidence: 4.5,
      mean_activation: 3.9,
      value: false
    },
    {
      index: 0,
      description: "Improves clarity and conciseness of text",
      title: "Clarity Boost",
      emoji: "📝",
      usefulness: 4.5,
      confidence: 3.8,
      mean_activation: 2.7,
      value: false
    },
    {
      index: 1,
      description: "Adds more emotional tone to generated text",
      title: "Emotion Enhancer",
      emoji: "❤️",
      usefulness: 4.2,
      confidence: 4.0,
      mean_activation: 3.1,
      value: false
    },
    {
      index: 2,
      description: "Optimizes content for search engines",
      title: "SEO Optimizer",
      emoji: "🔍",
      usefulness: 4.8,
      confidence: 4.5,
      mean_activation: 3.9,
      value: false
    },
    {
      index: 0,
      description: "Improves clarity and conciseness of text",
      title: "Clarity Boost",
      emoji: "📝",
      usefulness: 4.5,
      confidence: 3.8,
      mean_activation: 2.7,
      value: false
    },
    {
      index: 1,
      description: "Adds more emotional tone to generated text",
      title: "Emotion Enhancer",
      emoji: "❤️",
      usefulness: 4.2,
      confidence: 4.0,
      mean_activation: 3.1,
      value: false
    },
    {
      index: 2,
      description: "Optimizes content for search engines",
      title: "SEO Optimizer",
      emoji: "🔍",
      usefulness: 4.8,
      confidence: 4.5,
      mean_activation: 3.9,
      value: false
    },
    {
      index: 0,
      description: "Improves clarity and conciseness of text",
      title: "Clarity Boost",
      emoji: "📝",
      usefulness: 4.5,
      confidence: 3.8,
      mean_activation: 2.7,
      value: false
    },
    {
      index: 1,
      description: "Adds more emotional tone to generated text",
      title: "Emotion Enhancer",
      emoji: "❤️",
      usefulness: 4.2,
      confidence: 4.0,
      mean_activation: 3.1,
      value: false
    },
    {
      index: 2,
      description: "Optimizes content for search engines",
      title: "SEO Optimizer",
      emoji: "🔍",
      usefulness: 4.8,
      confidence: 4.5,
      mean_activation: 3.9,
      value: false
    },
    {
      index: 0,
      description: "Improves clarity and conciseness of text",
      title: "Clarity Boost",
      emoji: "📝",
      usefulness: 4.5,
      confidence: 3.8,
      mean_activation: 2.7,
      value: false
    },
    {
      index: 1,
      description: "Adds more emotional tone to generated text",
      title: "Emotion Enhancer",
      emoji: "❤️",
      usefulness: 4.2,
      confidence: 4.0,
      mean_activation: 3.1,
      value: false
    },
    {
      index: 2,
      description: "Optimizes content for search engines",
      title: "SEO Optimizer",
      emoji: "🔍",
      usefulness: 4.8,
      confidence: 4.5,
      mean_activation: 3.9,
      value: false
    },
    {
      index: 0,
      description: "Improves clarity and conciseness of text",
      title: "Clarity Boost",
      emoji: "📝",
      usefulness: 4.5,
      confidence: 3.8,
      mean_activation: 2.7,
      value: false
    },
    {
      index: 1,
      description: "Adds more emotional tone to generated text",
      title: "Emotion Enhancer",
      emoji: "❤️",
      usefulness: 4.2,
      confidence: 4.0,
      mean_activation: 3.1,
      value: false
    },
    {
      index: 2,
      description: "Optimizes content for search engines",
      title: "SEO Optimizer",
      emoji: "🔍",
      usefulness: 4.8,
      confidence: 4.5,
      mean_activation: 3.9,
      value: false
    },
    {
      index: 0,
      description: "Improves clarity and conciseness of text",
      title: "Clarity Boost",
      emoji: "📝",
      usefulness: 4.5,
      confidence: 3.8,
      mean_activation: 2.7,
      value: false
    },
    {
      index: 1,
      description: "Adds more emotional tone to generated text",
      title: "Emotion Enhancer",
      emoji: "❤️",
      usefulness: 4.2,
      confidence: 4.0,
      mean_activation: 3.1,
      value: false
    },
    {
      index: 2,
      description: "Optimizes content for search engines",
      title: "SEO Optimizer",
      emoji: "🔍",
      usefulness: 4.8,
      confidence: 4.5,
      mean_activation: 3.9,
      value: false
    },
    {
      index: 0,
      description: "Improves clarity and conciseness of text",
      title: "Clarity Boost",
      emoji: "📝",
      usefulness: 4.5,
      confidence: 3.8,
      mean_activation: 2.7,
      value: false
    },
    {
      index: 1,
      description: "Adds more emotional tone to generated text",
      title: "Emotion Enhancer",
      emoji: "❤️",
      usefulness: 4.2,
      confidence: 4.0,
      mean_activation: 3.1,
      value: false
    },
    {
      index: 2,
      description: "Optimizes content for search engines",
      title: "SEO Optimizer",
      emoji: "🔍",
      usefulness: 4.8,
      confidence: 4.5,
      mean_activation: 3.9,
      value: false
    },
    {
      index: 0,
      description: "Improves clarity and conciseness of text",
      title: "Clarity Boost",
      emoji: "📝",
      usefulness: 4.5,
      confidence: 3.8,
      mean_activation: 2.7,
      value: false
    },
    {
      index: 1,
      description: "Adds more emotional tone to generated text",
      title: "Emotion Enhancer",
      emoji: "❤️",
      usefulness: 4.2,
      confidence: 4.0,
      mean_activation: 3.1,
      value: false
    },
    {
      index: 2,
      description: "Optimizes content for search engines",
      title: "SEO Optimizer",
      emoji: "🔍",
      usefulness: 4.8,
      confidence: 4.5,
      mean_activation: 3.9,
      value: false
    },
    {
      index: 0,
      description: "Improves clarity and conciseness of text",
      title: "Clarity Boost",
      emoji: "📝",
      usefulness: 4.5,
      confidence: 3.8,
      mean_activation: 2.7,
      value: false
    },
    {
      index: 1,
      description: "Adds more emotional tone to generated text",
      title: "Emotion Enhancer",
      emoji: "❤️",
      usefulness: 4.2,
      confidence: 4.0,
      mean_activation: 3.1,
      value: false
    },
    {
      index: 2,
      description: "Optimizes content for search engines",
      title: "SEO Optimizer",
      emoji: "🔍",
      usefulness: 4.8,
      confidence: 4.5,
      mean_activation: 3.9,
      value: false
    },
    {
      index: 0,
      description: "Improves clarity and conciseness of text",
      title: "Clarity Boost",
      emoji: "📝",
      usefulness: 4.5,
      confidence: 3.8,
      mean_activation: 2.7,
      value: false
    },
    {
      index: 1,
      description: "Adds more emotional tone to generated text",
      title: "Emotion Enhancer",
      emoji: "❤️",
      usefulness: 4.2,
      confidence: 4.0,
      mean_activation: 3.1,
      value: false
    },
    {
      index: 2,
      description: "Optimizes content for search engines",
      title: "SEO Optimizer",
      emoji: "🔍",
      usefulness: 4.8,
      confidence: 4.5,
      mean_activation: 3.9,
      value: false
    },
    {
      index: 0,
      description: "Improves clarity and conciseness of text",
      title: "Clarity Boost",
      emoji: "📝",
      usefulness: 4.5,
      confidence: 3.8,
      mean_activation: 2.7,
      value: false
    },
    {
      index: 1,
      description: "Adds more emotional tone to generated text",
      title: "Emotion Enhancer",
      emoji: "❤️",
      usefulness: 4.2,
      confidence: 4.0,
      mean_activation: 3.1,
      value: false
    },
    {
      index: 2,
      description: "Optimizes content for search engines",
      title: "SEO Optimizer",
      emoji: "🔍",
      usefulness: 4.8,
      confidence: 4.5,
      mean_activation: 3.9,
      value: false
    },
    {
      index: 0,
      description: "Improves clarity and conciseness of text",
      title: "Clarity Boost",
      emoji: "📝",
      usefulness: 4.5,
      confidence: 3.8,
      mean_activation: 2.7,
      value: false
    },
    {
      index: 1,
      description: "Adds more emotional tone to generated text",
      title: "Emotion Enhancer",
      emoji: "❤️",
      usefulness: 4.2,
      confidence: 4.0,
      mean_activation: 3.1,
      value: false
    },
    {
      index: 2,
      description: "Optimizes content for search engines",
      title: "SEO Optimizer",
      emoji: "🔍",
      usefulness: 4.8,
      confidence: 4.5,
      mean_activation: 3.9,
      value: false
    },
    {
      index: 0,
      description: "Improves clarity and conciseness of text",
      title: "Clarity Boost",
      emoji: "📝",
      usefulness: 4.5,
      confidence: 3.8,
      mean_activation: 2.7,
      value: false
    },
    {
      index: 1,
      description: "Adds more emotional tone to generated text",
      title: "Emotion Enhancer",
      emoji: "❤️",
      usefulness: 4.2,
      confidence: 4.0,
      mean_activation: 3.1,
      value: false
    },
    {
      index: 2,
      description: "Optimizes content for search engines",
      title: "SEO Optimizer",
      emoji: "🔍",
      usefulness: 4.8,
      confidence: 4.5,
      mean_activation: 3.9,
      value: false
    },
    {
      index: 0,
      description: "Improves clarity and conciseness of text",
      title: "Clarity Boost",
      emoji: "📝",
      usefulness: 4.5,
      confidence: 3.8,
      mean_activation: 2.7,
      value: false
    },
    {
      index: 1,
      description: "Adds more emotional tone to generated text",
      title: "Emotion Enhancer",
      emoji: "❤️",
      usefulness: 4.2,
      confidence: 4.0,
      mean_activation: 3.1,
      value: false
    },
    {
      index: 2,
      description: "Optimizes content for search engines",
      title: "SEO Optimizer",
      emoji: "🔍",
      usefulness: 4.8,
      confidence: 4.5,
      mean_activation: 3.9,
      value: false
    },
    {
      index: 0,
      description: "Improves clarity and conciseness of text",
      title: "Clarity Boost",
      emoji: "📝",
      usefulness: 4.5,
      confidence: 3.8,
      mean_activation: 2.7,
      value: false
    },
    {
      index: 1,
      description: "Adds more emotional tone to generated text",
      title: "Emotion Enhancer",
      emoji: "❤️",
      usefulness: 4.2,
      confidence: 4.0,
      mean_activation: 3.1,
      value: false
    },
    {
      index: 2,
      description: "Optimizes content for search engines",
      title: "SEO Optimizer",
      emoji: "🔍",
      usefulness: 4.8,
      confidence: 4.5,
      mean_activation: 3.9,
      value: false
    },
    {
      index: 0,
      description: "Improves clarity and conciseness of text",
      title: "Clarity Boost",
      emoji: "📝",
      usefulness: 4.5,
      confidence: 3.8,
      mean_activation: 2.7,
      value: false
    },
    {
      index: 1,
      description: "Adds more emotional tone to generated text",
      title: "Emotion Enhancer",
      emoji: "❤️",
      usefulness: 4.2,
      confidence: 4.0,
      mean_activation: 3.1,
      value: false
    },
    {
      index: 2,
      description: "Optimizes content for search engines",
      title: "SEO Optimizer",
      emoji: "🔍",
      usefulness: 4.8,
      confidence: 4.5,
      mean_activation: 3.9,
      value: false
    },
    {
      index: 0,
      description: "Improves clarity and conciseness of text",
      title: "Clarity Boost",
      emoji: "📝",
      usefulness: 4.5,
      confidence: 3.8,
      mean_activation: 2.7,
      value: false
    },
    {
      index: 1,
      description: "Adds more emotional tone to generated text",
      title: "Emotion Enhancer",
      emoji: "❤️",
      usefulness: 4.2,
      confidence: 4.0,
      mean_activation: 3.1,
      value: false
    },
    {
      index: 2,
      description: "Optimizes content for search engines",
      title: "SEO Optimizer",
      emoji: "🔍",
      usefulness: 4.8,
      confidence: 4.5,
      mean_activation: 3.9,
      value: false
    },
    {
      index: 0,
      description: "Improves clarity and conciseness of text",
      title: "Clarity Boost",
      emoji: "📝",
      usefulness: 4.5,
      confidence: 3.8,
      mean_activation: 2.7,
      value: false
    },
    {
      index: 1,
      description: "Adds more emotional tone to generated text",
      title: "Emotion Enhancer",
      emoji: "❤️",
      usefulness: 4.2,
      confidence: 4.0,
      mean_activation: 3.1,
      value: false
    },
    {
      index: 2,
      description: "Optimizes content for search engines",
      title: "SEO Optimizer",
      emoji: "🔍",
      usefulness: 4.8,
      confidence: 4.5,
      mean_activation: 3.9,
      value: false
    },
    {
      index: 0,
      description: "Improves clarity and conciseness of text",
      title: "Clarity Boost",
      emoji: "📝",
      usefulness: 4.5,
      confidence: 3.8,
      mean_activation: 2.7,
      value: false
    },
    {
      index: 1,
      description: "Adds more emotional tone to generated text",
      title: "Emotion Enhancer",
      emoji: "❤️",
      usefulness: 4.2,
      confidence: 4.0,
      mean_activation: 3.1,
      value: false
    },
    {
      index: 2,
      description: "Optimizes content for search engines",
      title: "SEO Optimizer",
      emoji: "🔍",
      usefulness: 4.8,
      confidence: 4.5,
      mean_activation: 3.9,
      value: false
    },
    {
      index: 0,
      description: "Improves clarity and conciseness of text",
      title: "Clarity Boost",
      emoji: "📝",
      usefulness: 4.5,
      confidence: 3.8,
      mean_activation: 2.7,
      value: false
    },
    {
      index: 1,
      description: "Adds more emotional tone to generated text",
      title: "Emotion Enhancer",
      emoji: "❤️",
      usefulness: 4.2,
      confidence: 4.0,
      mean_activation: 3.1,
      value: false
    },
    {
      index: 2,
      description: "Optimizes content for search engines",
      title: "SEO Optimizer",
      emoji: "🔍",
      usefulness: 4.8,
      confidence: 4.5,
      mean_activation: 3.9,
      value: false
    },
    {
      index: 0,
      description: "Improves clarity and conciseness of text",
      title: "Clarity Boost",
      emoji: "📝",
      usefulness: 4.5,
      confidence: 3.8,
      mean_activation: 2.7,
      value: false
    },
    {
      index: 1,
      description: "Adds more emotional tone to generated text",
      title: "Emotion Enhancer",
      emoji: "❤️",
      usefulness: 4.2,
      confidence: 4.0,
      mean_activation: 3.1,
      value: false
    },
    {
      index: 2,
      description: "Optimizes content for search engines",
      title: "SEO Optimizer",
      emoji: "🔍",
      usefulness: 4.8,
      confidence: 4.5,
      mean_activation: 3.9,
      value: false
    },
    {
      index: 0,
      description: "Improves clarity and conciseness of text",
      title: "Clarity Boost",
      emoji: "📝",
      usefulness: 4.5,
      confidence: 3.8,
      mean_activation: 2.7,
      value: false
    },
    {
      index: 1,
      description: "Adds more emotional tone to generated text",
      title: "Emotion Enhancer",
      emoji: "❤️",
      usefulness: 4.2,
      confidence: 4.0,
      mean_activation: 3.1,
      value: false
    },
    {
      index: 2,
      description: "Optimizes content for search engines",
      title: "SEO Optimizer",
      emoji: "🔍",
      usefulness: 4.8,
      confidence: 4.5,
      mean_activation: 3.9,
      value: false
    },
    {
      index: 0,
      description: "Improves clarity and conciseness of text",
      title: "Clarity Boost",
      emoji: "📝",
      usefulness: 4.5,
      confidence: 3.8,
      mean_activation: 2.7,
      value: false
    },
    {
      index: 1,
      description: "Adds more emotional tone to generated text",
      title: "Emotion Enhancer",
      emoji: "❤️",
      usefulness: 4.2,
      confidence: 4.0,
      mean_activation: 3.1,
      value: false
    },
    {
      index: 2,
      description: "Optimizes content for search engines",
      title: "SEO Optimizer",
      emoji: "🔍",
      usefulness: 4.8,
      confidence: 4.5,
      mean_activation: 3.9,
      value: false
    },
    {
      index: 0,
      description: "Improves clarity and conciseness of text",
      title: "Clarity Boost",
      emoji: "📝",
      usefulness: 4.5,
      confidence: 3.8,
      mean_activation: 2.7,
      value: false
    },
    {
      index: 1,
      description: "Adds more emotional tone to generated text",
      title: "Emotion Enhancer",
      emoji: "❤️",
      usefulness: 4.2,
      confidence: 4.0,
      mean_activation: 3.1,
      value: false
    },
    {
      index: 2,
      description: "Optimizes content for search engines",
      title: "SEO Optimizer",
      emoji: "🔍",
      usefulness: 4.8,
      confidence: 4.5,
      mean_activation: 3.9,
      value: false
    },
    {
      index: 0,
      description: "Improves clarity and conciseness of text",
      title: "Clarity Boost",
      emoji: "📝",
      usefulness: 4.5,
      confidence: 3.8,
      mean_activation: 2.7,
      value: false
    },
    {
      index: 1,
      description: "Adds more emotional tone to generated text",
      title: "Emotion Enhancer",
      emoji: "❤️",
      usefulness: 4.2,
      confidence: 4.0,
      mean_activation: 3.1,
      value: false
    },
    {
      index: 1,
      description: "Adds more emotional tone to generated text",
      title: "Emotion Enhancer",
      emoji: "❤️",
      usefulness: 4.2,
      confidence: 4.0,
      mean_activation: 3.1,
      value: false
    },
    {
      index: 2,
      description: "Optimizes content for search engines",
      title: "SEO Optimizer",
      emoji: "🔍",
      usefulness: 4.8,
      confidence: 4.5,
      mean_activation: 3.9,
      value: false
    },
    {
      index: 0,
      description: "Improves clarity and conciseness of text",
      title: "Clarity Boost",
      emoji: "📝",
      usefulness: 4.5,
      confidence: 3.8,
      mean_activation: 2.7,
      value: false
    },
    {
      index: 1,
      description: "Adds more emotional tone to generated text",
      title: "Emotion Enhancer",
      emoji: "❤️",
      usefulness: 4.2,
      confidence: 4.0,
      mean_activation: 3.1,
      value: false
    },
    {
      index: 1,
      description: "Adds more emotional tone to generated text",
      title: "Emotion Enhancer",
      emoji: "❤️",
      usefulness: 4.2,
      confidence: 4.0,
      mean_activation: 3.1,
      value: false
    },
    {
      index: 2,
      description: "Optimizes content for search engines",
      title: "SEO Optimizer",
      emoji: "🔍",
      usefulness: 4.8,
      confidence: 4.5,
      mean_activation: 3.9,
      value: false
    },
    {
      index: 0,
      description: "Improves clarity and conciseness of text",
      title: "Clarity Boost",
      emoji: "📝",
      usefulness: 4.5,
      confidence: 3.8,
      mean_activation: 2.7,
      value: false
    },
    {
      index: 1,
      description: "Adds more emotional tone to generated text",
      title: "Emotion Enhancer",
      emoji: "❤️",
      usefulness: 4.2,
      confidence: 4.0,
      mean_activation: 3.1,
      value: false
    },
    {
      index: 2,
      description: "Optimizes content for search engines",
      title: "SEO Optimizer",
      emoji: "🔍",
      usefulness: 4.8,
      confidence: 4.5,
      mean_activation: 3.9,
      value: false
    },
  ]

  return new Response(JSON.stringify({ features }), {
    status: 200,
    headers: {
      'Content-Type': 'application/json'
    }
  })
}
