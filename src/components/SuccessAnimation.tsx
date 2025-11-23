import { motion } from 'framer-motion';
import { CheckCircle2 } from 'lucide-react';

interface SuccessAnimationProps {
  title?: string;
  description?: string;
  onComplete?: () => void;
}

export const SuccessAnimation = ({ 
  title = 'Succès !', 
  description,
  onComplete 
}: SuccessAnimationProps) => {
  return (
    <motion.div
      className="flex flex-col items-center justify-center gap-4 py-8"
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
      onAnimationComplete={onComplete}
    >
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{
          type: 'spring',
          stiffness: 200,
          damping: 15,
          delay: 0.1,
        }}
      >
        <CheckCircle2 className="w-20 h-20 text-green-500" />
      </motion.div>

      <motion.div
        className="text-center space-y-2"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <h3 className="text-2xl font-semibold text-foreground">{title}</h3>
        {description && (
          <p className="text-muted-foreground">{description}</p>
        )}
      </motion.div>

      <motion.div
        className="w-16 h-1 bg-primary rounded-full"
        initial={{ width: 0 }}
        animate={{ width: 64 }}
        transition={{ delay: 0.5, duration: 0.5 }}
      />
    </motion.div>
  );
};
