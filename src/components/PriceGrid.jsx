import { motion } from 'framer-motion'
import PriceCard from './PriceCard'

const PriceGrid = ({ data, onCardClick }) => {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05,
        delayChildren: 0.1
      }
    }
  }

  const itemVariants = {
    hidden: { 
      opacity: 0, 
      y: 30,
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
    <div className="p-5">
      {/* Section Title */}
      <motion.div 
        className="text-center mb-6"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h2 className="text-xl font-bold text-gray-800 mb-2">
          🦐 ราคาตามไซต์
        </h2>
        <div className="w-16 h-1 bg-gradient-to-r from-shrimp-400 to-shrimp-600 rounded-full mx-auto"></div>
        <p className="text-sm text-gray-500 mt-2">คลิกที่การ์ดเพื่อดูประวัติราคา</p>
      </motion.div>

      {/* Price Grid */}
      <motion.div 
        className="grid grid-cols-2 gap-3"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {data.map((item, index) => (
          <motion.div
            key={item.size}
            variants={itemVariants}
            layout
          >
            <PriceCard 
              item={item} 
              index={index}
              onClick={onCardClick}
            />
          </motion.div>
        ))}
      </motion.div>

      {/* Grid Footer */}
      <motion.div 
        className="text-center mt-6 text-sm text-gray-500"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1, duration: 0.5 }}
      >
        แสดงทั้งหมด {data.length} ไซต์ • คลิกเพื่อดูรายละเอียด
      </motion.div>
    </div>
  )
}

export default PriceGrid