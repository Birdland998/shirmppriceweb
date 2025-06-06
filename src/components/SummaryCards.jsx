import { motion } from 'framer-motion'
import { 
  ArrowTrendingUpIcon, 
  ArrowTrendingDownIcon,
  ChartBarIcon 
} from './SimpleIcons'

const SummaryCards = ({ statistics }) => {
  const cards = [
    {
      label: 'ต่ำสุด',
      value: statistics.min,
      color: 'ocean',
      icon: ArrowTrendingDownIcon,
      bgGradient: 'from-ocean-500 to-ocean-600',
      textColor: 'text-ocean-600',
      bgColor: 'bg-ocean-50',
      borderColor: 'border-ocean-200'
    },
    {
      label: 'เฉลี่ย',
      value: statistics.avg,
      color: 'amber',
      icon: ChartBarIcon,
      bgGradient: 'from-amber-500 to-amber-600',
      textColor: 'text-amber-600',
      bgColor: 'bg-amber-50',
      borderColor: 'border-amber-200'
    },
    {
      label: 'สูงสุด',
      value: statistics.max,
      color: 'coral',
      icon: ArrowTrendingUpIcon,
      bgGradient: 'from-coral-500 to-coral-600',
      textColor: 'text-coral-600',
      bgColor: 'bg-coral-50',
      borderColor: 'border-coral-200'
    }
  ]

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  }

  const cardVariants = {
    hidden: { 
      opacity: 0, 
      y: 20,
      scale: 0.9
    },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        duration: 0.5,
        ease: "easeOut"
      }
    }
  }

  return (
    <div className="bg-gradient-to-r from-gray-50 to-slate-100 p-4">
      <motion.div 
        className="grid grid-cols-3 gap-3"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {cards.map((card, index) => {
          const IconComponent = card.icon
          
          return (
            <motion.div
              key={card.label}
              variants={cardVariants}
              whileHover={{ 
                scale: 1.05,
                y: -5,
                transition: { duration: 0.2 }
              }}
              whileTap={{ scale: 0.95 }}
              className={`
                relative overflow-hidden
                bg-white rounded-xl p-4 text-center
                shadow-soft hover:shadow-medium
                border border-gray-100
                cursor-pointer group
                transition-all duration-300
              `}
            >
              {/* Background Gradient */}
              <div className={`
                absolute inset-0 opacity-0 group-hover:opacity-10
                bg-gradient-to-br
                ${card.bgGradient}
                transition-opacity duration-300
              `} />

              {/* Icon */}
              <div className="relative z-10 flex justify-center mb-2">
                <div className={`
                  w-8 h-8 rounded-lg flex items-center justify-center
                  ${card.bgColor}
                  ${card.borderColor}
                  border
                `}>
                  <IconComponent className={`w-4 h-4 ${card.textColor}`} />
                </div>
              </div>

              {/* Value */}
              <div className="relative z-10">
                <motion.div 
                  className={`
                    text-lg font-bold mb-1
                    ${card.textColor}
                  `}
                  key={card.value} // Re-animate when value changes
                  initial={{ scale: 1.2, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 0.3 }}
                >
                  ฿{card.value.toLocaleString()}
                </motion.div>
                
                <div className="text-xs text-gray-500 font-medium uppercase tracking-wide">
                  {card.label}
                </div>
              </div>

              {/* Shine Effect */}
              <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/20 to-transparent skew-x-12" />
            </motion.div>
          )
        })}
      </motion.div>
    </div>
  )
}

export default SummaryCards