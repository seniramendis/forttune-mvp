'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { Truck, ShieldCheck, Wrench, MapPin, Mail, Phone } from 'lucide-react'

const LOGO_URL = 'https://res.cloudinary.com/dukv2otyn/image/upload/v1782676866/Forttune-3.1_sj71vp.webp'

const FOOTER_LINKS = {
  'Store Links': [
    { label: 'Products',       href: '/' },
    { label: 'Services',       href: 'https://forttune.lk/services/' },
    { label: 'Media & Events', href: 'https://forttune.lk/media-and-events/' },
    { label: 'Downloads',      href: 'https://forttune.lk/downloads/' },
  ],
  'Quick Links': [
    { label: 'About Us',           href: 'https://forttune.lk/about-us/' },
    { label: 'Dealer Network',     href: 'https://forttune.lk/dealer-network/' },
    { label: 'Terms & Conditions', href: 'https://forttune.lk/terms-conditions/' },
    { label: 'Careers',            href: 'https://forttune.lk/careers/' },
  ],
  'Account': [
    { label: 'Sign In',    href: '/login' },
    { label: 'Register',   href: '/register' },
    { label: 'My Orders',  href: '/dashboard' },
    { label: 'My Account', href: '/dashboard' },
  ],
}

const TRUST_ITEMS = [
  { icon: Truck,       title: 'Island Wide Delivery', desc: 'We deliver anywhere in Sri Lanka' },
  { icon: ShieldCheck, title: 'Trusted Warranty',      desc: 'Official manufacturer warranty on all products' },
  { icon: Wrench,      title: 'After Sales Service',   desc: 'Dedicated technical support team' },
]

const SOCIAL = [
  {
    name: 'Facebook',
    href: 'https://www.facebook.com/profile.php?id=100063397380014',
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
      </svg>
    ),
  },
  {
    name: 'Instagram',
    href: 'https://www.instagram.com/forttunec/',
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
      </svg>
    ),
  },
  {
    name: 'LinkedIn',
    href: 'https://www.linkedin.com/company/forttune-channels-pvt-ltd',
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
      </svg>
    ),
  },
]

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0 },
}

export default function Footer() {
  const year = new Date().getFullYear()

  return (
    <footer className="bg-[#0D1B3E] text-white">

      {/* Trust bar */}
      <div className="border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-0 divide-y sm:divide-y-0 sm:divide-x divide-white/10">
          {TRUST_ITEMS.map((item, i) => (
            <motion.div
              key={item.title}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: '-40px' }}
              variants={fadeUp}
              transition={{ duration: 0.5, delay: i * 0.08, ease: 'easeOut' }}
              className="group flex items-center gap-3 sm:justify-center py-3 sm:py-0"
            >
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white/5 text-[#E85D26] ring-1 ring-white/10 transition-all duration-300 group-hover:scale-110 group-hover:bg-[#E85D26]/10 group-hover:ring-[#E85D26]/30">
                <item.icon className="h-5 w-5" strokeWidth={1.75} />
              </span>
              <div>
                <p className="font-semibold text-sm text-white">{item.title}</p>
                <p className="text-xs text-[#6B7A99]">{item.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Main footer body */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-10">

          {/* Brand column */}
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-40px' }}
            variants={fadeUp}
            transition={{ duration: 0.5, ease: 'easeOut' }}
            className="lg:col-span-2 space-y-5"
          >
            <img
              src={LOGO_URL}
              alt="Forttune Channels"
              className="h-10 object-contain brightness-0 invert"
            />
            <p className="text-[#6B7A99] text-sm leading-relaxed max-w-xs">
              Sri Lanka's trusted IT hardware distributor. Connecting 500+ channel partners across the island with genuine products, official warranty, and island-wide delivery.
            </p>

            {/* Contact info */}
            <div className="space-y-2 text-sm">
              <div className="flex items-start gap-2.5 text-[#6B7A99]">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-[#E85D26]" strokeWidth={1.75} />
                <span>No. 312, Galle Road, Mount Lavinia, Sri Lanka.</span>
              </div>
              <div className="flex items-center gap-2.5 text-[#6B7A99]">
                <Mail className="h-4 w-4 shrink-0 text-[#E85D26]" strokeWidth={1.75} />
                <a href="mailto:info@forttune.lk" className="transition-colors duration-300 hover:text-[#E85D26]">info@forttune.lk</a>
              </div>
              <div className="flex items-start gap-2.5 text-[#6B7A99]">
                <Phone className="mt-0.5 h-4 w-4 shrink-0 text-[#E85D26]" strokeWidth={1.75} />
                <div className="space-y-0.5">
                  <div><span className="text-white/50 text-xs">General:</span> <a href="tel:+94112638538" className="transition-colors duration-300 hover:text-[#E85D26]">+94 112 638 538</a></div>
                  <div><span className="text-white/50 text-xs">Hotline/WhatsApp:</span> <a href="tel:+94725516516" className="transition-colors duration-300 hover:text-[#E85D26]">+94 725 516 516</a></div>
                  <div><span className="text-white/50 text-xs">Retail:</span> <a href="tel:+94724516516" className="transition-colors duration-300 hover:text-[#E85D26]">+94 724 516 516</a></div>
                  <div><span className="text-white/50 text-xs">Technical:</span> <a href="tel:+94720516516" className="transition-colors duration-300 hover:text-[#E85D26]">+94 720 516 516</a></div>
                </div>
              </div>
            </div>

            {/* Social icons */}
            <div className="flex items-center gap-3 pt-1">
              {SOCIAL.map(s => (
                <a
                  key={s.name}
                  href={s.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={s.name}
                  className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/10 transition-all duration-300 hover:-translate-y-0.5 hover:bg-[#E85D26] hover:shadow-lg hover:shadow-[#E85D26]/20"
                >
                  {s.icon}
                </a>
              ))}
            </div>
          </motion.div>

          {/* Link columns */}
          {Object.entries(FOOTER_LINKS).map(([heading, links], colIndex) => (
            <motion.div
              key={heading}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: '-40px' }}
              variants={fadeUp}
              transition={{ duration: 0.5, delay: 0.1 + colIndex * 0.06, ease: 'easeOut' }}
            >
              <h3 className="text-xs font-bold uppercase tracking-widest text-[#E85D26] mb-4">{heading}</h3>
              <ul className="space-y-2.5">
                {links.map(link => (
                  <li key={link.label}>
                    {link.href.startsWith('http') ? (
                      <a
                        href={link.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="group inline-flex items-center text-sm text-[#6B7A99] transition-colors duration-300 hover:text-white"
                      >
                        <span className="relative">
                          {link.label}
                          <span className="absolute -bottom-0.5 left-0 h-px w-0 bg-[#E85D26] transition-all duration-300 group-hover:w-full" />
                        </span>
                      </a>
                    ) : (
                      <Link href={link.href} className="group inline-flex items-center text-sm text-[#6B7A99] transition-colors duration-300 hover:text-white">
                        <span className="relative">
                          {link.label}
                          <span className="absolute -bottom-0.5 left-0 h-px w-0 bg-[#E85D26] transition-all duration-300 group-hover:w-full" />
                        </span>
                      </Link>
                    )}
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}

        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-[#6B7A99]">
          <p>© {year} Forttune Channels (Pvt) Ltd. All rights reserved.</p>
          <p>
            Hosted &amp; Maintained by{' '}
            <a
              href="https://dopmin.vercel.app/"
              target="_blank"
              rel="noopener noreferrer"
              className="font-semibold text-white transition-colors duration-300 hover:text-[#E85D26]"
            >
              DopMin Technologies
            </a>
          </p>
        </div>
      </div>

    </footer>
  )
}
