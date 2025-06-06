import { motion } from 'framer-motion'
import { useEffect, useRef } from 'react'

const PriceHistoryChart = ({ data, size }) => {
  const canvasRef = useRef(null)

  useEffect(() => {
    if (!data || data.length === 0) return

    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    const { width, height } = canvas

    // Clear canvas
    ctx.clearRect(0, 0, width, height)

    // Chart settings
    const padding = 40
    const chartWidth = width - padding * 2
    const chartHeight = height - padding * 2

    // Data preparation
    const prices = data.map(d => d.price)
    const minPrice = Math.min(...prices)
    const maxPrice = Math.max(...prices)
    const priceRange = maxPrice - minPrice || 1

    // Helper functions
    const getX = (index) => padding + (index / (data.length - 1)) * chartWidth
    const getY = (price) => padding + (1 - (price - minPrice) / priceRange) * chartHeight

    // Draw grid lines
    ctx.strokeStyle = '#f3f4f6'
    ctx.lineWidth = 1
    
    // Horizontal grid lines
    for (let i = 0; i <= 4; i++) {
      const y = padding + (i / 4) * chartHeight
      ctx.beginPath()
      ctx.moveTo(padding, y)
      ctx.lineTo(width - padding, y)
      ctx.stroke()
    }

    // Vertical grid lines
    for (let i = 0; i < data.length; i++) {
      const x = getX(i)
      ctx.beginPath()
      ctx.moveTo(x, padding)
      ctx.lineTo(x, height - padding)
      ctx.stroke()
    }

    // Draw area under the line
    ctx.beginPath()
    ctx.moveTo(getX(0), height - padding)
    
    data.forEach((point, index) => {
      const x = getX(index)
      const y = getY(point.price)
      if (index === 0) {
        ctx.lineTo(x, y)
      } else {
        ctx.lineTo(x, y)
      }
    })
    
    ctx.lineTo(getX(data.length - 1), height - padding)
    ctx.closePath()
    
    // Create gradient
    const gradient = ctx.createLinearGradient(0, padding, 0, height - padding)
    gradient.addColorStop(0, 'rgba(52, 152, 219, 0.3)')
    gradient.addColorStop(1, 'rgba(52, 152, 219, 0.05)')
    
    ctx.fillStyle = gradient
    ctx.fill()

    // Draw the line
    ctx.beginPath()
    ctx.strokeStyle = '#3498db'
    ctx.lineWidth = 3
    ctx.lineJoin = 'round'
    ctx.lineCap = 'round'
    
    data.forEach((point, index) => {
      const x = getX(index)
      const y = getY(point.price)
      if (index === 0) {
        ctx.moveTo(x, y)
      } else {
        ctx.lineTo(x, y)
      }
    })
    ctx.stroke()

    // Draw points
    data.forEach((point, index) => {
      const x = getX(index)
      const y = getY(point.price)
      
      // Point circle
      ctx.beginPath()
      ctx.arc(x, y, 6, 0, Math.PI * 2)
      ctx.fillStyle = '#3498db'
      ctx.fill()
      
      // Point border
      ctx.beginPath()
      ctx.arc(x, y, 6, 0, Math.PI * 2)
      ctx.strokeStyle = '#ffffff'
      ctx.lineWidth = 2
      ctx.stroke()
    })

    // Draw labels
    ctx.fillStyle = '#6b7280'
    ctx.font = '11px system-ui'
    ctx.textAlign = 'center'

    // X-axis labels (dates)
    data.forEach((point, index) => {
      if (index % Math.ceil(data.length / 4) === 0 || index === data.length - 1) {
        const x = getX(index)
        const label = new Date(point.date).toLocaleDateString('th-TH', {
          month: 'short',
          day: 'numeric'
        })
        ctx.fillText(label, x, height - 15)
      }
    })

    // Y-axis labels (prices)
    ctx.textAlign = 'right'
    for (let i = 0; i <= 4; i++) {
      const price = minPrice + (maxPrice - minPrice) * (1 - i / 4)
      const y = padding + (i / 4) * chartHeight
      ctx.fillText(`฿${Math.round(price)}`, padding - 10, y + 4)
    }

  }, [data])

  // Generate mock data if no data provided
  const chartData = data && data.length > 0 ? data : [
    { date: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000), price: 180 },
    { date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), price: 175 },
    { date: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000), price: 185 },
    { date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), price: 190 },
    { date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), price: 188 },
    { date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), price: 195 },
    { date: new Date(), price: 200 }
  ]

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
      className="w-full h-48 relative"
    >
      <canvas
        ref={canvasRef}
        width={300}
        height={192}
        className="w-full h-full"
        style={{ width: '100%', height: '100%' }}
      />
      
      {/* Chart Info */}
      <div className="absolute top-2 left-2 bg-white/90 backdrop-blur-sm rounded-lg px-3 py-1 text-xs">
        <div className="font-semibold text-shrimp-600">ไซต์ {size}</div>
        <div className="text-gray-500">7 วันย้อนหลัง</div>
      </div>
    </motion.div>
  )
}

export default PriceHistoryChart