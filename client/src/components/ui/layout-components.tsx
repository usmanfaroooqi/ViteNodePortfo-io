import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface SectionProps extends React.HTMLAttributes<HTMLElement> {
  children: React.ReactNode;
  className?: string;
  id?: string;
}

export function Section({ children, className, id, ...props }: SectionProps) {
  return (
    <section
      id={id}
      className={cn("py-20 md:py-32 px-6 md:px-12 max-w-7xl mx-auto", className)}
      style={{ willChange: "contents" }}
      {...props}
    >
      {children}
    </section>
  );
}

export function FadeIn({ children, delay = 0, className }: { children: React.ReactNode, delay?: number, className?: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "0px 0px -100px 0px" }}
      transition={{ duration: 0.5, delay, ease: "easeOut" }}
      className={cn(className, "transform-gpu")}
      style={{ willChange: "transform, opacity" }}
    >
      {children}
    </motion.div>
  );
}
