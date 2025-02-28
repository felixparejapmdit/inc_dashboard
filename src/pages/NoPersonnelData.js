import { motion } from "framer-motion";

const NoPersonnelData = () => {
  return (
    <motion.div
      className="flex flex-col items-center justify-center min-h-screen"
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
    >
      <img
        src={`${process.env.REACT_APP_API_URL}/uploads/no_personnel.webp`} // Adjust file name as needed
        alt="No Personnel Available"
        className="w-40 h-auto max-w-xs opacity-80" // Adjusted size properly
      />
    </motion.div>
  );
};

export default NoPersonnelData;
