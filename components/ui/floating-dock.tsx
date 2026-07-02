"use client";

import { cn } from "@/lib/utils";
import { IconLayoutNavbarCollapse } from "@tabler/icons-react";
import {
  AnimatePresence,
  type MotionValue,
  motion,
  useMotionValue,
  useSpring,
  useTransform,
} from "framer-motion";
import gsap from "gsap";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";

export type FloatingDockItem = {
  title: string;
  icon?: React.ReactNode;
  href?: string;
  onClick?: () => void;
  active?: boolean;
  badge?: number;
};

export function FloatingDock({
  items,
  desktopClassName,
  mobileClassName,
}: {
  items: FloatingDockItem[];
  desktopClassName?: string;
  mobileClassName?: string;
}) {
  return (
    <>
      <FloatingDockDesktop items={items} className={desktopClassName} />
      <FloatingDockMobile items={items} className={mobileClassName} />
    </>
  );
}

function DockLink({
  item,
  children,
}: {
  item: FloatingDockItem;
  children: React.ReactNode;
}) {
  if (item.onClick) {
    return (
      <button onClick={item.onClick} aria-label={item.title} className="contents">
        {children}
      </button>
    );
  }
  return (
    <Link href={item.href ?? "#"} aria-label={item.title} className="contents">
      {children}
    </Link>
  );
}

function FloatingDockMobile({
  items,
  className,
}: {
  items: FloatingDockItem[];
  className?: string;
}) {
  const [open, setOpen] = useState(false);
  return (
    <div className={cn("relative block md:hidden", className)}>
      <AnimatePresence>
        {open && (
          <motion.div
            layoutId="forttune-dock"
            className="absolute right-0 top-full mt-2 flex flex-col gap-2 z-50"
          >
            {items.map((item, idx) => (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{
                  opacity: 0,
                  y: -10,
                  transition: { delay: idx * 0.05 },
                }}
                transition={{ delay: idx * 0.05 }}
              >
                <DockLink item={item}>
                  <div
                    className={cn(
                      "relative flex h-10 items-center justify-center whitespace-nowrap rounded-full border px-4 text-[13px] font-medium shadow-sm transition-colors duration-200",
                      item.active
                        ? "border-[#0D1B3E] bg-[#0D1B3E] text-white"
                        : "border-[#E2E6F0] bg-white text-black"
                    )}
                    onClick={() => setOpen(false)}
                  >
                    {item.title}
                    {!!item.badge && (
                      <span className="absolute -top-1 -right-1 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-[#0D1B3E] px-1 text-[9px] font-bold leading-none text-white">
                        {item.badge}
                      </span>
                    )}
                  </div>
                </DockLink>
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
      <button
        onClick={() => setOpen((v) => !v)}
        aria-label="Toggle navigation"
        className="flex h-10 w-10 items-center justify-center rounded-full border border-[#E2E6F0] bg-white shadow-sm"
      >
        <IconLayoutNavbarCollapse className="h-5 w-5 text-black" />
      </button>
    </div>
  );
}

function FloatingDockDesktop({
  items,
  className,
}: {
  items: FloatingDockItem[];
  className?: string;
}) {
  const mouseX = useMotionValue(Infinity);

  return (
    <motion.div
      onMouseMove={(e) => mouseX.set(e.pageX)}
      onMouseLeave={() => mouseX.set(Infinity)}
      className={cn(
        "relative mx-auto hidden h-16 items-end gap-4 rounded-2xl border border-[#E2E6F0] bg-white px-4 pb-3 backdrop-blur-md shadow-[0_4px_24px_rgba(13,27,62,0.12)] md:flex",
        className
      )}
    >
      {items.map((item) => (
        <IconContainer mouseX={mouseX} key={item.title} item={item} />
      ))}
    </motion.div>
  );
}

function IconContainer({
  mouseX,
  item,
}: {
  mouseX: MotionValue;
  item: FloatingDockItem;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const clipRef = useRef<HTMLDivElement>(null);
  const shineRef = useRef<HTMLDivElement>(null);
  const shimmerTl = useRef<gsap.core.Timeline | null>(null);
  const [hovered, setHovered] = useState(false);

  const distance = useTransform(mouseX, (val) => {
    const bounds = ref.current?.getBoundingClientRect() ?? { x: 0, width: 0 };
    return val - bounds.x - bounds.width / 2;
  });

  // Same magnification curve as the original icon dock, just driving a
  // height + font-size grow instead of an icon size grow.
  const heightTransform = useTransform(distance, [-150, 0, 150], [40, 56, 40]);
  const fontSizeTransform = useTransform(distance, [-150, 0, 150], [13, 15, 13]);
  const paddingTransform = useTransform(distance, [-150, 0, 150], [14, 20, 14]);

  const height = useSpring(heightTransform, { mass: 0.1, stiffness: 150, damping: 12 });
  const fontSize = useSpring(fontSizeTransform, { mass: 0.1, stiffness: 150, damping: 12 });
  const paddingX = useSpring(paddingTransform, { mass: 0.1, stiffness: 150, damping: 12 });

  // Wipe the orange fill in/out from the left, clipped inside the pill —
  // nothing escapes the rounded border now.
  useEffect(() => {
    if (!clipRef.current) return;
    const shouldFill = item.active || hovered;
    gsap.to(clipRef.current, {
      clipPath: shouldFill ? "inset(0% 0% 0% 0%)" : "inset(0% 100% 0% 0%)",
      duration: shouldFill ? 0.45 : 0.35,
      ease: shouldFill ? "power3.out" : "power2.inOut",
    });
  }, [item.active, hovered]);

  // Little bounce when this tab becomes the active page.
  useEffect(() => {
    if (!item.active || !ref.current) return;
    gsap.fromTo(ref.current, { scale: 0.88 }, { scale: 1, duration: 0.5, ease: "back.out(3)" });
  }, [item.active]);

  // Idle shimmer loop that sweeps across the active tab every couple seconds.
  useEffect(() => {
    if (!shineRef.current) return;
    shimmerTl.current?.kill();
    if (item.active) {
      gsap.set(shineRef.current, { xPercent: -150 });
      shimmerTl.current = gsap.timeline({ repeat: -1, repeatDelay: 1.6 });
      shimmerTl.current.to(shineRef.current, {
        xPercent: 250,
        duration: 1.1,
        ease: "power1.inOut",
      });
    } else {
      gsap.set(shineRef.current, { xPercent: -150 });
    }
    return () => {
      shimmerTl.current?.kill();
    };
  }, [item.active]);

  const handleEnter = () => {
    setHovered(true);
    gsap.to(ref.current, { y: -4, scale: 1.05, duration: 0.28, ease: "back.out(3)" });
  };

  const handleLeave = () => {
    setHovered(false);
    gsap.to(ref.current, { y: 0, scale: 1, duration: 0.35, ease: "power3.out" });
  };

  return (
    <DockLink item={item}>
      <motion.div
        ref={ref}
        style={{ height, fontSize, paddingLeft: paddingX, paddingRight: paddingX }}
        onMouseEnter={handleEnter}
        onMouseLeave={handleLeave}
        className={cn(
          "relative z-0 flex items-center justify-center overflow-hidden whitespace-nowrap rounded-full border border-[#E2E6F0] bg-white font-medium",
          hovered && "z-20"
        )}
      >
        {/* base label, always present */}
        <span className="relative z-0 select-none text-black">{item.title}</span>

        {/* orange fill, wiped in from the left, clipped to the pill */}
        <div
          ref={clipRef}
          className="pointer-events-none absolute inset-0 z-10 overflow-hidden rounded-full"
          style={{ clipPath: "inset(0% 100% 0% 0%)" }}
        >
          <div className="absolute inset-0 flex items-center justify-center bg-[#0D1B3E]">
            <span className="relative z-0 select-none text-white">{item.title}</span>
            {/* diagonal shimmer that loops while this tab is active */}
            <div
              ref={shineRef}
              className="pointer-events-none absolute inset-y-0 left-0 w-1/3 -skew-x-12 bg-gradient-to-r from-transparent via-white/40 to-transparent"
            />
          </div>
        </div>

        {!!item.badge && (
          <span className="absolute -top-1 -right-1 z-20 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-[#0D1B3E] px-1 text-[9px] font-bold leading-none text-white">
            {item.badge}
          </span>
        )}
      </motion.div>
    </DockLink>
  );
}
