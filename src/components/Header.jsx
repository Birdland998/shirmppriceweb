import { motion } from 'framer-motion'

const Header = ({ lastUpdate, isOnline = true }) => {
  return (
    <div className="bg-gradient-to-r from-shrimp-500 to-shrimp-600 text-white sticky top-0 z-50 shadow-lg backdrop-blur-sm">
      <div className="p-6 text-center">
        {/* Main Title */}
        <motion.div 
          className="flex items-center justify-center gap-3 text-2xl font-bold mb-2"
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <motion.span 
            className="text-3xl"
            animate={{ 
              y: [0, -5, 0],
              rotate: [0, 5, -5, 0]
            }}
            transition={{ 
              duration: 4,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          >
            🦐
          </motion.span>
          
          <span className="bg-gradient-to-r from-white to-blue-100 bg-clip-text text-transparent font-extrabold">
            ราคากุ้ง 22 ไซต์
          </span>
        </motion.div>

        {/* Subtitle */}
        <motion.div 
          className="text-sm opacity-90 font-light"
          initial={{ y: 10, opacity: 0 }}
          animate={{ y: 0, opacity: 0.9 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          ติดตามราคาแบบเรียลไทม์
        </motion.div>

        {/* Status Indicator */}
        <motion.div 
          className="flex items-center justify-center gap-2 mt-3"
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.6 }}
        >
          <div className="relative">
            <div className={`w-2 h-2 rounded-full ${isOnline ? 'bg-green-400' : 'bg-red-400'}`}></div>
            {isOnline && (
              <div className="absolute inset-0 w-2 h-2 bg-green-400 rounded-full animate-ping"></div>
            )}
          </div>
          <span className={`text-xs font-medium ${isOnline ? 'text-green-100' : 'text-red-100'}`}>
            {isOnline ? 'สดใส • เชื่อมต่อแล้ว' : 'ออฟไลน์ • ข้อมูลแคช'}
          </span>
        </motion.div>

        {/* Connection Details */}
        <motion.div 
          className="text-xs opacity-75 mt-1"
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.75 }}
          transition={{ duration: 0.5, delay: 0.8 }}
        >
          {isOnline ? (
            <span>📡 เชื่อมต่อกับเซิร์ฟเวอร์</span>
          ) : (
            <span>📶 ใช้ข้อมูลออฟไลน์</span>
          )}
        </motion.div>
      </div>

      {/* Gradient Border */}
      <div className="h-1 bg-gradient-to-r from-transparent via-white/30 to-transparent"></div>
    </div>
  )
}

export default Header