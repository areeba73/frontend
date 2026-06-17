import React from 'react';
import { motion } from 'framer-motion';

const Section5 = () => {
  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0, 
      transition: { duration: 0.8, staggerChildren: 0.3 } 
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: { opacity: 1, scale: 1, transition: { duration: 0.5 } }
  };

  return (
    /* Responsive margins and padding */
    <div className="w-full px-0 md:px-10 font-sans flex justify-center overflow-hidden">
      
      {/* Animated Main Section */}
      <motion.section 
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.3 }}
        /* Mobile pe py-12 aur rounded-3xl, Desktop pe py-16 aur rounded-40px */
        className="w-full max-w-6xl bg-[#2F357D] backdrop-blur-xl py-10 md:py-14 px-6 md:px-8 rounded-[30px] md:rounded-[40px] text-white border border-white/10 relative overflow-hidden"
      >
        
        {/* Decorative Glows - Adjusted for mobile */}
        <div className="absolute -top-24 -left-24 w-48 h-48 md:w-64 md:h-64 bg-purple-500/20 blur-[60px] md:blur-[80px] rounded-full"></div>
        <div className="absolute -bottom-24 -right-24 w-48 h-48 md:w-64 md:h-64 bg-blue-500/20 blur-[60px] md:blur-[80px] rounded-full"></div>

        <div className="relative z-10">
          {/* Header Animation - Flexible spacing */}
          <motion.div 
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="flex items-center justify-center gap-3 md:gap-4 mb-8 md:mb-12"
          >
            <div className="h-[1px] w-8 md:w-20 bg-white/20"></div>
            <h2 className="text-sm md:text-2xl font-semibold tracking-[0.15em] md:tracking-[0.2em] uppercase text-center">
              Emotional Insights
            </h2>
            <div className="h-[1px] w-8 md:w-20 bg-white/20"></div>
          </motion.div>

          {/* Stats Grid - Stacked on mobile, 3-cols on md screens */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12 text-center">
            
            <motion.div variants={itemVariants} className="flex flex-col items-center">
              <h3 className="text-4xl md:text-6xl font-extrabold mb-2 text-purple-300">75%</h3>
              <p className="text-gray-300 text-xs md:text-base font-medium uppercase tracking-wider">
                Improved Mood Awareness
              </p>
            </motion.div>

            <motion.div variants={itemVariants} className="flex flex-col items-center">
              <h3 className="text-4xl md:text-6xl font-extrabold mb-2 text-cyan-300">60%</h3>
              <p className="text-gray-300 text-xs md:text-base font-medium uppercase tracking-wider">
                Reduced Stress in 30 Days
              </p>
            </motion.div>

            <motion.div variants={itemVariants} className="flex flex-col items-center">
              <h3 className="text-4xl md:text-6xl font-extrabold mb-2 text-pink-300">10k+</h3>
              <p className="text-gray-300 text-xs md:text-base font-medium uppercase tracking-wider">
                Emotions Tracked Daily
              </p>
            </motion.div>

          </div>
        </div>
      </motion.section>
      
    </div>
  );
};

export default Section5;
