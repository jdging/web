"use client";

import { motion } from "framer-motion";
import { LogoMark } from "@/components/brand/logo-mark";

/**
 * El propio isologo, a gran escala y baja opacidad, revelado con un barrido
 * diagonal — el mismo ángulo de corte que ya usan las letras de la marca.
 * Reemplaza un intento anterior con formas/anotaciones inventadas que no
 * representaban nada concreto y resultaban confusas.
 */
export function StructuralHeroGraphic({ className }: { className?: string }) {
  return (
    <motion.div
      className={className}
      initial={{ clipPath: "polygon(0 100%, 0 100%, 0 100%, 0 100%)" }}
      animate={{ clipPath: "polygon(0 0, 100% 0, 100% 100%, 0 100%)" }}
      transition={{ duration: 1.1, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
    >
      <motion.div
        className="flex h-full w-full items-center justify-center"
        initial={{ scale: 1.08 }}
        animate={{ scale: 1 }}
        transition={{ duration: 1.1, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
      >
        <LogoMark className="h-auto w-full text-brand opacity-[0.14]" />
      </motion.div>
    </motion.div>
  );
}
