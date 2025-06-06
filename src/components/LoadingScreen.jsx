import { motion } from 'framer-motion'

const LoadingScreen = () => {
  return (
    <motion.div 
      className="fixed inset-0 bg-gradient-to-br from-shrimp-600 via-shrimp-500 to-shrimp-700 flex items-center justify-center z-50"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="text-center text-white">
        {/* Animated Shrimp */}
        <motion.div 
          className="text-8xl mb-8"
          animate={{ 
            y: [0, -20, 0],
            rotate: [0, 10, -10, 0],
            scale: [1, 1.1, 1]
          }}
          transition={{ 
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        >
          🦐
        </motion.div>

        {/* Title */}
        <motion.h1 
          className="text-3xl font-bold mb-4"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.8 }}
        >
          ราคากุ้ง 22 ไซต์
        </motion.h1>

        {/* Subtitle */}
        <motion.p 
          className="text-lg opacity-90 mb-8"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 0.9 }}
          transition={{ delay: 0.5, duration: 0.8 }}
        >
          กำลังโหลดข้อมูลล่าสุด...
        </motion.p>

        {/* Loading Bar */}
        <motion.div 
          className="w-64 h-2 bg-white/20 rounded-full overflow-hidden mx-auto"
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.7, duration: 0.5 }}
        >
          <motion.div 
            className="h-full bg-white rounded-full"
            initial={{ width: "0%" }}
            animate={{ width: "100%" }}
            transition={{ 
              delay: 1,
              duration: 2,
              ease: "easeInOut"
            }}
          />
        </motion.div>

        {/* Loading Dots */}
        <motion.div 
          className="flex justify-center gap-2 mt-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5, duration: 0.5 }}
        >
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              className="w-2 h-2 bg-white rounded-full"
              animate={{
                scale: [1, 1.5, 1],
                opacity: [1, 0.5, 1]
              }}
              transition={{
                duration: 1,
                repeat: Infinity,
                delay: i * 0.2
              }}
            />
          ))}
        </motion.div>

        {/* Version Info */}
        <motion.div 
          className="absolute bottom-8 left-1/2 transform -translate-x-1/2 text-sm opacity-70"
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.7 }}
          transition={{ delay: 2, duration: 0.5 }}
        >
          React + Vite • v2.0
        </motion.div>
      </div>

      {/* Background Bubbles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(6)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute bg-white/10 rounded-full"
            style={{
              width: Math.random() * 100 + 20,
              height: Math.random() * 100 + 20,
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`
            }}
            animate={{
              y: [0, -100],
              opacity: [0, 0.5, 0],
              scale: [0.5, 1, 0.5]
            }}
            transition={{
              duration: 3 + Math.random() * 2,
              repeat: Infinity,
              delay: Math.random() * 2
            }}
          />
        ))}
      </div>
    </motion.div>
  )
}

export default LoadingScreen