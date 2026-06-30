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
import Link from "next/link";
import { useRef, useState } from "react";

export type FloatingDockItem = {
  title: string;
  icon: React.ReactNode;
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
                      "relative flex h-10 w-10 items-center justify-center rounded-full border border-[#E2E6F0] bg-white shadow-sm",
                      item.active && "ring-2 ring-[#E85D26]"
                    )}
                    onClick={() => setOpen(false)}
                  >
                    <div className="h-[18px] w-[18px]">{item.icon}</div>
                    {!!item.badge && (
                      <span className="absolute -top-1 -right-1 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-[#E85D26] px-1 text-[9px] font-bold leading-none text-white">
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
        "mx-auto hidden h-16 items-end gap-4 rounded-2xl border border-[#E2E6F0] bg-white px-4 pb-3 backdrop-blur-md shadow-[0_4px_24px_rgba(13,27,62,0.12)] md:flex",
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
  const [hovered, setHovered] = useState(false);

  const distance = useTransform(mouseX, (val) => {
    const bounds = ref.current?.getBoundingClientRect() ?? { x: 0, width: 0 };
    return val - bounds.x - bounds.width / 2;
  });

  const widthTransform = useTransform(distance, [-150, 0, 150], [40, 80, 40]);
  const heightTransform = useTransform(distance, [-150, 0, 150], [40, 80, 40]);
  const widthTransformIcon = useTransform(distance, [-150, 0, 150], [20, 40, 20]);
  const heightTransformIcon = useTransform(distance, [-150, 0, 150], [20, 40, 20]);

  const width = useSpring(widthTransform, { mass: 0.1, stiffness: 150, damping: 12 });
  const height = useSpring(heightTransform, { mass: 0.1, stiffness: 150, damping: 12 });
  const widthIcon = useSpring(widthTransformIcon, { mass: 0.1, stiffness: 150, damping: 12 });
  const heightIcon = useSpring(heightTransformIcon, { mass: 0.1, stiffness: 150, damping: 12 });

  return (
    <DockLink item={item}>
      <motion.div
        ref={ref}
        style={{ width, height }}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        className={cn(
          "relative z-0 flex aspect-square items-center justify-center rounded-full bg-white border border-[#E2E6F0]",
          hovered && "z-20",
          item.active && "ring-2 ring-[#E85D26]"
        )}
      >
        <AnimatePresence>
          {hovered && (
            <motion.div
              initial={{ opacity: 0, x: -8, y: "-50%" }}
              animate={{ opacity: 1, x: 0, y: "-50%" }}
              exit={{ opacity: 0, x: -8, y: "-50%" }}
              transition={{ duration: 0.18, ease: "easeOut" }}
              className="pointer-events-none absolute top-1/2 left-full ml-2 z-30 w-fit whitespace-pre rounded-md border border-[#E2E6F0] bg-white px-2 py-0.5 text-xs text-black shadow-sm"
            >
              {item.title}
            </motion.div>
          )}
        </AnimatePresence>
        <motion.div
          style={{ width: widthIcon, height: heightIcon }}
          className="flex items-center justify-center"
        >
          {item.icon}
        </motion.div>
        {!!item.badge && (
          <span className="absolute -top-1 -right-1 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-[#E85D26] px-1 text-[9px] font-bold leading-none text-white">
            {item.badge}
          </span>
        )}
      </motion.div>
    </DockLink>
  );
}
