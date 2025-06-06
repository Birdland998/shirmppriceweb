import { motion } from 'framer-motion'

const PriceCard = ({ item, index, onClick }) => {
  // Default styling for all cards
  const getCardStyling = () => {
    return {
      borderColor: 'border-gray-200',
      bgGradient: 'from-white to-gray-50',
      badgeColor: 'bg-gradient-to-r from-shrimp-500 to-shrimp-600',
      label: null
    }
  }

  const getStatusConfig = (status) => {
    switch (status) {
      case 'up':
        return {
          dotColor: 'bg-ocean-500',
          pingColor: 'bg-ocean-400'
        }
      case 'down':
        return {
          dotColor: 'bg-coral-500',
          pingColor: 'bg-coral-400'
        }
      default:
        return {
          dotColor: 'bg-amber-500',
          pingColor: 'bg-amber-400'
        }
    }
  }

  const cardStyle = getCardStyling()
  const statusConfig = getStatusConfig(item.status)

  return (
    <motion.div
      whileHover={{ 
        scale: 1.02,
        y: -4,
        transition: { duration: 0.2 }
      }}
      whileTap={{ scale: 0.98 }}
      onClick={() => onClick && onClick(item)}
      className={`
        relative overflow-hidden group cursor-pointer
        bg-white rounded-xl p-4 text-center
        border-2 transition-all duration-300
        shadow-soft hover:shadow-large
        ${cardStyle.borderColor}
        bg-gradient-to-br ${cardStyle.bgGradient}
      `}
    >
      {/* Click indicator */}
      <div className="absolute top-2 left-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
        <div className="w-6 h-6 bg-shrimp-500 rounded-full flex items-center justify-center">
          <span className="text-white text-xs">👆</span>
        </div>
      </div>

      {/* Top Border Animation */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-shrimp-500 to-shrimp-600 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left" />

      {/* Status Dot */}
      <div className="absolute top-3 right-3">
        <div className={`relative w-3 h-3 rounded-full ${statusConfig.dotColor}`}>
          <div className={`
            absolute inset-0 w-3 h-3 rounded-full animate-ping opacity-75
            ${statusConfig.pingColor}
          `} />
        </div>
      </div>

      {/* Special Label */}
      {cardStyle.label && (
        <div className="absolute top-0 left-0">
          <div className={`
            text-xs text-white px-2 py-1 rounded-br-lg rounded-tl-xl font-medium
            ${cardStyle.badgeColor}
          `}>
            {cardStyle.label}
          </div>
        </div>
      )}

      {/* Size Badge */}
      <div className={`
        inline-block text-white text-sm font-semibold px-3 py-1 rounded-full mb-3 shadow-sm
        ${cardStyle.badgeColor}
      `}>
        ไซต์ {item.size}
      </div>

      {/* Price */}
      <motion.div 
        className="text-xl font-bold text-gray-800 mb-1"
        key={item.price} // Re-animate when price changes
        initial={{ scale: 1.1, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        ฿{item.price.toLocaleString()}
      </motion.div>

      {/* Unit */}
      <div className="text-xs text-gray-500 uppercase tracking-wide">
        ต่อกิโลกรัม
      </div>

      {/* Click hint */}
      <div className="text-xs text-shrimp-500 mt-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
        คลิกดูประวัติราคา
      </div>

      {/* Trend Indicator */}
      <div className="absolute bottom-2 left-2">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: index * 0.05, duration: 0.3 }}
          className={`
            w-1.5 h-6 rounded-full
            ${item.trend === 'up' 
              ? 'bg-gradient-to-t from-ocean-300 to-ocean-500' 
              : 'bg-gradient-to-t from-coral-300 to-coral-500'
            }
          `}
        />
      </div>

      {/* Hover Overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-shrimp-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />

      {/* Shine Effect */}
      <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 bg-gradient-to-r from-transparent via-white/20 to-transparent skew-x-12" />
    </motion.div>
  )
}

export default PriceCard
