"use client";

import Image from "next/image";
import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import { FadeIn } from "@/components/ui/FadeIn";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { recommendations } from "@/data/luxury-izakaya";

function DishCard({
  item,
  index,
}: {
  item: (typeof recommendations)[0];
  index: number;
}) {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });
  const scale = useTransform(scrollYProgress, [0, 0.5, 1], [1.06, 1, 1.04]);
  const y = useTransform(scrollYProgress, [0, 1], ["4%", "-4%"]);

  return (
    <motion.article
      ref={ref}
      initial={{ opacity: 0, y: 48 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{
        duration: 1.1,
        delay: index * 0.15,
        ease: [0.16, 1, 0.3, 1],
      }}
      className="group w-[82vw] shrink-0 md:w-auto"
    >
      <div className="relative aspect-[3/4] overflow-hidden">
        <motion.div style={{ scale, y }} className="absolute inset-0">
          <Image
            src={item.image}
            alt={item.name}
            fill
            className="cinematic-image object-cover"
            sizes="(max-width: 768px) 82vw, 33vw"
          />
        </motion.div>
        <div className="image-warm-overlay absolute inset-0" />
        <div className="absolute inset-0 bg-gradient-to-t from-ink/80 via-ink/10 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-7 sm:p-8">
          <p className="font-en text-sm italic tracking-wider text-gold/80">{item.price}</p>
          <h3 className="mt-2 font-mincho text-lg tracking-[0.25em] text-washi sm:text-xl">
            {item.name}
          </h3>
        </div>
      </div>
    </motion.article>
  );
}

export function Recommendations() {
  return (
    <section id="recommendations" className="section-luxury">
      <div className="mx-auto max-w-5xl px-6 sm:px-10 md:px-16">
        <SectionHeading label="Seasonal" title="おすすめ料理" />

        <div className="mt-20 -mx-6 flex gap-6 overflow-x-auto px-6 pb-2 scrollbar-hide sm:mt-28 sm:gap-8 md:mx-0 md:grid md:grid-cols-3 md:overflow-visible md:px-0">
          {recommendations.map((item, index) => (
            <DishCard key={item.name} item={item} index={index} />
          ))}
        </div>

        <FadeIn delay={0.3} className="mt-20 text-center">
          <p className="font-mincho text-[10px] tracking-[0.4em] text-ink-muted/50">
            仕入れにより内容が変わる場合がございます
          </p>
        </FadeIn>
      </div>
    </section>
  );
}
