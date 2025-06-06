import { motion, AnimatePresence } from 'framer-motion'
import { XMarkIcon } from './SimpleIcons'
import PriceHistoryChart from './PriceHistoryChart'

const PriceDetailModal = ({ item, isOpen, onClose, priceHistory }) => {
  if (!item) return null

  // Generate trend indicator
  const getTrendInfo = (history) => {
    if (history.length < 2) return { trend: 'stable', change: 0, percentage: 0 }
    
    const current = history[history.length - 1].price
    const previous = history[history.length - 2].price
    const change = current - previous
    const percentage = ((change / previous) * 100).toFixed(2)
    
    return {
      trend: change > 0 ? 'up' : change < 0 ? 'down' : 'stable',
      change: Math.abs(change),
      percentage: Math.abs(percentage)
    }
  }

  const trendInfo = getTrendInfo(priceHistory)

  const overlayVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1 },
    exit: { opacity: 0 }
  }

  const modalVariants = {
    hidden: { 
      opacity: 0, 
      scale: 0.8,
      y: 50
    },
    visible: { 
      opacity: 1, 
      scale: 1,
      y: 0,
      transition: {
        type: "spring",
        damping: 25,
        stiffness: 300
      }
    },
    exit: { 
      opacity: 0, 
      scale: 0.8,
      y: 50,
      transition: {
        duration: 0.2
      }
    }
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          variants={overlayVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={onClose}
        >
          <motion.div
            variants={modalVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="bg-white rounded-2xl max-w-md w-full max-h-[90vh] overflow-hidden shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-shrimp-500 to-shrimp-600 text-white p-6 relative">
              {/* Close Button */}
              <button
                onClick={onClose}
                className="absolute top-4 right-4 w-8 h-8 bg-white/20 rounded-full flex items-center justify-center hover:bg-white/30 transition-colors"
              >
                <XMarkIcon className="w-5 h-5" />
              </button>

              {/* Size Badge */}
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                  <span className="text-xl font-bold">🦐</span>
                </div>
                <div>
                  <h2 className="text-2xl font-bold">ไซต์ {item.size}</h2>
                  <p className="text-white/80 text-sm">ประวัติราคากุ้ง</p>
                </div>
              </div>

              {/* Current Price */}
              <div className="text-center">
                <div className="text-3xl font-bold mb-2">
                  ฿{item.price.toLocaleString()}
                </div>
                <div className="text-sm text-white/80">ราคาปัจจุบัน</div>
              </div>
            </div>

            {/* Content */}
            <div className="p-6">
              {/* Trend Summary */}
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="bg-gray-50 rounded-xl p-4 text-center">
                  <div className={`text-lg font-bold mb-1 ${
                    trendInfo.trend === 'up' ? 'text-ocean-600' : 
                    trendInfo.trend === 'down' ? 'text-coral-600' : 'text-amber-600'
                  }`}>
                    {trendInfo.trend === 'up' ? '↗️' : 
                     trendInfo.trend === 'down' ? '↘️' : '➡️'} ฿{trendInfo.change}
                  </div>
                  <div className="text-xs text-gray-500">การเปลี่ยนแปลง</div>
                </div>
                
                <div className="bg-gray-50 rounded-xl p-4 text-center">
                  <div className={`text-lg font-bold mb-1 ${
                    trendInfo.trend === 'up' ? 'text-ocean-600' : 
                    trendInfo.trend === 'down' ? 'text-coral-600' : 'text-amber-600'
                  }`}>
                    {trendInfo.percentage}%
                  </div>
                  <div className="text-xs text-gray-500">เปอร์เซ็นต์</div>
                </div>
              </div>

              {/* Chart */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">
                  📈 กราฟราคา 7 วันย้อนหลัง
                </h3>
                <div className="bg-gray-50 rounded-xl p-4">
                  <PriceHistoryChart data={priceHistory} size={item.size} />
                </div>
              </div>

              {/* Price History List */}
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-4">
                  📋 ประวัติราคาล่าสุด
                </h3>
                <div className="space-y-3 max-h-40 overflow-y-auto">
                  {priceHistory.slice(-5).reverse().map((entry, index) => (
                    <motion.div
                      key={entry.date}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="flex justify-between items-center p-3 bg-gray-50 rounded-lg"
                    >
                      <div>
                        <div className="font-medium text-gray-800">
                          {new Date(entry.date).toLocaleDateString('th-TH', {
                            month: 'short',
                            day: 'numeric'
                          })}
                        </div>
                        <div className="text-xs text-gray-500">
                          {new Date(entry.date).toLocaleDateString('th-TH', {
                            weekday: 'short'
                          })}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-gray-800">
                          ฿{entry.price.toLocaleString()}
                        </div>
                        {index < priceHistory.length - 1 && (
                          <div className={`text-xs ${
                            entry.change > 0 ? 'text-ocean-600' : 
                            entry.change < 0 ? 'text-coral-600' : 'text-gray-500'
                          }`}>
                            {entry.change > 0 ? '+' : ''}{entry.change}
                          </div>
                        )}
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="border-t border-gray-100 p-4 text-center">
              <button
                onClick={onClose}
                className="w-full bg-gradient-to-r from-shrimp-500 to-shrimp-600 text-white py-3 rounded-xl font-semibold hover:from-shrimp-600 hover:to-shrimp-700 transition-all duration-300"
              >
                ปิด
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export default PriceDetailModal