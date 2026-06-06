'use client'

import { useState, useEffect, useRef, useCallback } from 'react'

const SENTENCES = [
  'The quick brown fox jumps over the lazy dog',
  'Practice makes perfect in every skill you learn',
  'Technology is best when it brings people together',
  'Every great journey begins with a single step',
  'Success is the sum of small efforts repeated day in and day out',
  'The only way to do great work is to love what you do',
  'In the middle of difficulty lies opportunity',
  'Life is what happens when you are busy making other plans',
  'Keep it simple and focus on what truly matters',
  'Hard work beats talent when talent does not work hard',
]

type GameState = 'idle' | 'playing' | 'finished'

export default function TypingGame() {
  const [sentence, setSentence] = useState('')
  const [input, setInput] = useState('')
  const [gameState, setGameState] = useState<GameState>('idle')
  const [startTime, setStartTime] = useState<number | null>(null)
  const [wpm, setWpm] = useState(0)
  const [accuracy, setAccuracy] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)

  const pickSentence = useCallback(() => {
    const index = Math.floor(Math.random() * SENTENCES.length)
    setSentence(SENTENCES[index])
  }, [])

  useEffect(() => {
    pickSentence()
  }, [pickSentence])

  const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value

    if (gameState === 'idle') {
      setGameState('playing')
      setStartTime(Date.now())
    }

    setInput(value)

    if (value === sentence) {
      const elapsed = (Date.now() - (startTime ?? Date.now())) / 1000 / 60
      const words = sentence.trim().split(' ').length
      const calculatedWpm = Math.round(words / elapsed)

      let correct = 0
      for (let i = 0; i < value.length; i++) {
        if (value[i] === sentence[i]) correct++
      }
      const calculatedAccuracy = Math.round((correct / value.length) * 100)

      setWpm(calculatedWpm)
      setAccuracy(calculatedAccuracy)
      setGameState('finished')

      fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/scores`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ wpm: calculatedWpm, accuracy: calculatedAccuracy }),
      })
    }
  }

  const restart = () => {
    pickSentence()
    setInput('')
    setGameState('idle')
    setStartTime(null)
    setWpm(0)
    setAccuracy(0)
    setTimeout(() => inputRef.current?.focus(), 0)
  }

  const renderText = () => {
    return sentence.split('').map((char, index) => {
      let className = 'text-gray-400'
      if (index < input.length) {
        className =
          input[index] === char
            ? 'text-green-600'
            : 'text-red-500 bg-red-100 rounded'
      } else if (index === input.length) {
        className = 'border-b-2 border-blue-500 text-gray-800'
      }
      return (
        <span key={index} className={className}>
          {char}
        </span>
      )
    })
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-lg p-8 w-full max-w-2xl">
        <h1 className="text-3xl font-bold text-center text-gray-800 mb-1">
          Typing Practice
        </h1>
        <p className="text-center text-gray-400 mb-8">
          Improve your typing speed and accuracy
        </p>

        {gameState !== 'finished' ? (
          <>
            <div className="bg-gray-50 rounded-xl p-6 mb-6 text-xl leading-relaxed font-mono tracking-wide min-h-[80px]">
              {renderText()}
            </div>

            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={handleInput}
              placeholder="Start typing here..."
              className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 text-lg font-mono focus:outline-none focus:border-blue-400 transition-colors"
              autoFocus
              autoComplete="off"
              autoCorrect="off"
              autoCapitalize="off"
              spellCheck={false}
            />

            {gameState === 'idle' && (
              <p className="text-center text-gray-400 text-sm mt-3">
                Start typing to begin the timer
              </p>
            )}
          </>
        ) : (
          <div className="text-center py-8">
            <div className="text-7xl font-bold text-blue-500 mb-1">{wpm}</div>
            <div className="text-gray-400 text-lg mb-8">words per minute</div>
            <div className="flex justify-center gap-12 mb-10">
              <div>
                <div className="text-3xl font-semibold text-gray-700">
                  {accuracy}%
                </div>
                <div className="text-gray-400 text-sm mt-1">Accuracy</div>
              </div>
            </div>
            <button
              onClick={restart}
              className="bg-blue-500 hover:bg-blue-600 text-white font-semibold px-10 py-3 rounded-xl transition-colors text-lg"
            >
              Try Again
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
