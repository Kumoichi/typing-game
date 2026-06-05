'use client'

import React, { useState, useEffect, useRef, useCallback } from 'react'

const SENTENCES = [
  'The quick brown fox jumps over the lazy dog',
  'Practice makes perfect in every skill you learn',
  'Technology is best when it brings people together',
  'Every great journey begins with a single step',
  'Success is the sum of small efforts repeated',
  'The only way to do great work is to love what you do',
  'In the middle of difficulty lies opportunity',
  'Life is what happens when you are busy',
  'Keep it simple and focus on what truly matters',
  'Hard work beats talent when talent does not work hard',
]

interface PlayerStats {
  level: number
  combo: number
  score: number
  status: 'ready' | 'playing'
}

const ROWS = 12
const COLS = 8

export default function VsGameScreen() {
  const [timeLeft, setTimeLeft] = useState(180)
  const [gameStarted, setGameStarted] = useState(false)
  const [gameOver, setGameOver] = useState(false)

  const [player1, setPlayer1] = useState<PlayerStats>({
    level: 1,
    combo: 0,
    score: 0,
    status: 'ready',
  })
  const [player2, setPlayer2] = useState<PlayerStats>({
    level: 1,
    combo: 0,
    score: 0,
    status: 'ready',
  })

  const pickSentence = useCallback(
    () => SENTENCES[Math.floor(Math.random() * SENTENCES.length)],
    []
  )

  const [p1Sentence, setP1Sentence] = useState(() => SENTENCES[0])
  const [p2Sentence, setP2Sentence] = useState(() => SENTENCES[1])
  const [p1Input, setP1Input] = useState('')
  const [p2Input, setP2Input] = useState('')

  const p1Ref = useRef<HTMLInputElement>(null)
  const p2Ref = useRef<HTMLInputElement>(null)

  useEffect(() => {
    setP1Sentence(pickSentence())
    setP2Sentence(pickSentence())
  }, [pickSentence])

  useEffect(() => {
    if (!gameStarted || gameOver) return
    if (timeLeft <= 0) {
      setGameOver(true)
      return
    }
    const timer = setInterval(() => setTimeLeft((prev) => prev - 1), 1000)
    return () => clearInterval(timer)
  }, [timeLeft, gameStarted, gameOver])

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const startGame = () => {
    if (!gameStarted) {
      setGameStarted(true)
      setPlayer1((prev) => ({ ...prev, status: 'playing' }))
      setPlayer2((prev) => ({ ...prev, status: 'playing' }))
    }
  }

  const handleP1Input = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    startGame()
    setP1Input(value)
    if (value === p1Sentence) {
      setPlayer1((prev) => ({
        ...prev,
        combo: prev.combo + 1,
        score: prev.score + 100 + prev.combo * 10,
      }))
      setP1Input('')
      setP1Sentence(pickSentence())
    }
  }

  const handleP2Input = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    startGame()
    setP2Input(value)
    if (value === p2Sentence) {
      setPlayer2((prev) => ({
        ...prev,
        combo: prev.combo + 1,
        score: prev.score + 100 + prev.combo * 10,
      }))
      setP2Input('')
      setP2Sentence(pickSentence())
    }
  }

  const renderTypingText = (sentence: string, input: string) => {
    return sentence.split('').map((char, index) => {
      let className = 'text-gray-500'
      if (index < input.length) {
        className =
          input[index] === char ? 'text-green-600' : 'text-red-500 bg-red-100 rounded'
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

  const renderGrid = (isPlayer2 = false) => {
    return Array.from({ length: ROWS }).map((_, rowIndex) => (
      <div key={rowIndex} className="flex">
        {Array.from({ length: COLS }).map((_, colIndex) => (
          <div
            key={colIndex}
            className={`w-8 h-8 md:w-10 md:h-10 border border-black/80 flex-shrink-0 transition-colors
              ${
                isPlayer2
                  ? 'bg-gradient-to-b from-[#ffccd2] to-white/90'
                  : 'bg-gradient-to-b from-[#e0f2fe] to-white/90'
              }`}
          />
        ))}
      </div>
    ))
  }

  const restart = () => {
    setTimeLeft(180)
    setGameStarted(false)
    setGameOver(false)
    setPlayer1({ level: 1, combo: 0, score: 0, status: 'ready' })
    setPlayer2({ level: 1, combo: 0, score: 0, status: 'ready' })
    setP1Input('')
    setP2Input('')
    setP1Sentence(pickSentence())
    setP2Sentence(pickSentence())
  }

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
      <div className="relative w-full max-w-5xl aspect-[16/9] bg-gradient-to-b from-[#a3c2f9] via-[#c2ccf9] to-[#d6c7f9] p-6 flex flex-col justify-between overflow-hidden font-mono tracking-wider border-4 border-black rounded-lg shadow-2xl">
        {/* 背景装飾 */}
        <div className="absolute top-10 left-10 text-white text-xl animate-pulse pointer-events-none">
          ✦
        </div>
        <div className="absolute bottom-12 right-12 text-white text-2xl animate-pulse delay-700 pointer-events-none">
          ✦
        </div>
        <div className="absolute bottom-8 left-16 text-white text-lg animate-ping pointer-events-none">
          ✧
        </div>

        {/* --- TOP SECTION: タイマー & ステータス & タイピングエリア --- */}
        <div className="relative w-full flex justify-between items-start gap-4 z-10">
          {/* プレイヤー1 */}
          <div className="flex-1">
            <div className="border-4 border-black rounded-xl bg-[#cce3f5] p-3 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] ring-4 ring-[#6ba4e8]">
              <h2 className="text-base md:text-lg font-bold text-gray-800 text-center mb-1">
                {player1.status === 'ready' ? 'プレイヤー1、準備完了！' : 'プレイヤー1、挑戦中！'}
              </h2>
              <p className="text-xs text-gray-700 text-center font-semibold mb-2">
                Lv.{player1.level} | コンボ {player1.combo} | スコア {player1.score}
              </p>
              {/* タイピングテキスト表示 */}
              <div className="bg-white/80 rounded-lg px-2 py-1 mb-1 text-[10px] font-mono min-h-[24px] leading-relaxed break-all">
                {renderTypingText(p1Sentence, p1Input)}
              </div>
              {/* タイピング入力 */}
              <input
                ref={p1Ref}
                type="text"
                value={p1Input}
                onChange={handleP1Input}
                disabled={gameOver}
                placeholder="ここに入力…"
                className="w-full border-2 border-[#6ba4e8] rounded-lg px-2 py-1 text-xs font-mono focus:outline-none focus:border-blue-600 bg-white/90 disabled:opacity-50"
                autoComplete="off"
                autoCorrect="off"
                autoCapitalize="off"
                spellCheck={false}
              />
            </div>
          </div>

          {/* 中央タイマー */}
          <div className="absolute top-[-12px] left-1/2 transform -translate-x-1/2 border-4 border-black bg-[#e29578] px-4 py-1 rounded-md shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] text-center min-w-[80px] z-20">
            <span className="text-xl font-bold text-black font-mono">
              {formatTime(timeLeft)}
            </span>
            {gameOver && (
              <div className="text-[10px] font-bold text-red-900 leading-none mt-0.5">
                GAME OVER
              </div>
            )}
          </div>

          {/* プレイヤー2 */}
          <div className="flex-1">
            <div
              className={`border-4 border-black rounded-xl bg-[#fcd4d4] p-3 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] ring-4 ring-[#ef4444] ${
                player2.status === 'playing' ? 'animate-pulse' : ''
              }`}
            >
              <h2 className="text-base md:text-lg font-bold text-gray-800 text-center mb-1">
                {player2.status === 'ready' ? 'プレイヤー2、準備完了！' : 'プレイヤー2、挑戦中！'}
              </h2>
              <p className="text-xs text-gray-700 text-center font-semibold mb-2">
                Lv.{player2.level} | コンボ {player2.combo} | スコア {player2.score}
              </p>
              {/* タイピングテキスト表示 */}
              <div className="bg-white/80 rounded-lg px-2 py-1 mb-1 text-[10px] font-mono min-h-[24px] leading-relaxed break-all">
                {renderTypingText(p2Sentence, p2Input)}
              </div>
              {/* タイピング入力 */}
              <input
                ref={p2Ref}
                type="text"
                value={p2Input}
                onChange={handleP2Input}
                disabled={gameOver}
                placeholder="ここに入力…"
                className="w-full border-2 border-[#ef4444] rounded-lg px-2 py-1 text-xs font-mono focus:outline-none focus:border-red-600 bg-white/90 disabled:opacity-50"
                autoComplete="off"
                autoCorrect="off"
                autoCapitalize="off"
                spellCheck={false}
              />
            </div>
          </div>
        </div>

        {/* --- MAIN SECTION: パズルグリッド & VSロゴ --- */}
        <div className="flex-1 flex justify-between items-end mt-4 relative z-10">
          {/* P1 パズルボード */}
          <div className="border-[5px] border-black rounded-sm bg-black/5 shadow-[0_0_15px_rgba(107,164,232,0.5)] overflow-hidden">
            <div className="border-t-[6px] border-black">{renderGrid(false)}</div>
          </div>

          {/* 中央下部: VSエリア */}
          <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-48 flex flex-col items-center">
            {gameOver && (
              <button
                onClick={restart}
                className="mb-2 border-2 border-black bg-yellow-300 hover:bg-yellow-400 text-black text-xs font-bold px-3 py-1 rounded-lg shadow transition-colors"
              >
                もう一度
              </button>
            )}
            <div className="w-full h-12 bg-black flex items-center justify-center rounded-t-xl border-t-4 border-x-4 border-white/20">
              <div className="flex gap-1 items-center justify-center font-black text-2xl tracking-widest italic">
                <span className="text-yellow-400 drop-shadow-[2px_2px_0px_rgba(220,38,38,1)] animate-bounce">
                  V
                </span>
                <span className="text-cyan-400 drop-shadow-[2px_2px_0px_rgba(29,78,216,1)] animate-bounce delay-100">
                  S
                </span>
              </div>
              <div className="absolute left-2 text-cyan-400 text-xs opacity-80">✦</div>
              <div className="absolute right-2 text-red-400 text-xs opacity-80">✦</div>
            </div>
          </div>

          {/* P2 パズルボード */}
          <div className="border-[5px] border-black rounded-sm bg-black/5 shadow-[0_0_15px_rgba(239,68,68,0.5)] overflow-hidden">
            <div className="border-t-[6px] border-black">{renderGrid(true)}</div>
          </div>
        </div>
      </div>
    </div>
  )
}
