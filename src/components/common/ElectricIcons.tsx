import React from 'react';

export interface IconProps extends React.SVGProps<SVGSVGElement> {
  size?: number | string;
  color?: string;
  strokeWidth?: number;
  className?: string;
}

/**
 * 1. Icon Trafo / Gardu Distribusi (Teknis Line / Symbol style)
 * Berdasarkan gambar istockphoto-1199709741
 */
export const IconGarduTrafo: React.FC<IconProps> = ({
  size = 24,
  color = 'currentColor',
  strokeWidth = 2,
  className = '',
  ...props
}) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 64 64"
    fill="none"
    stroke={color}
    strokeWidth={strokeWidth}
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    {...props}
  >
    {/* Top Bushing 1 (Kiri) */}
    <path d="M 18 18 L 18 12 M 15 15 H 21 M 14 12 H 22 M 16 8 H 20 V 12 H 16 Z" />
    {/* Top Bushing 2 (Tengah) */}
    <path d="M 32 18 L 32 12 M 29 15 H 35 M 28 12 H 36 M 30 8 H 34 V 12 H 30 Z" />
    {/* Top Bushing 3 (Kanan) */}
    <path d="M 46 18 L 46 12 M 43 15 H 49 M 42 12 H 50 M 44 8 H 48 V 12 H 44 Z" />

    {/* Tangki Utama Trafo */}
    <rect x="12" y="24" width="40" height="28" rx="2" />
    <rect x="8" y="18" width="48" height="6" rx="1" />

    {/* Sirip Pendingin Kiri (Cooling Fins) */}
    <path d="M 16 30 H 22 M 16 34 H 22 M 16 38 H 22 M 16 42 H 22 M 16 46 H 22" />

    {/* Sirip Pendingin Kanan */}
    <path d="M 42 30 H 48 M 42 34 H 48 M 42 38 H 48 M 42 42 H 48 M 42 46 H 48" />

    {/* Simbol Kilat Listrik di Tengah */}
    <path d="M 33 28 L 29 37 H 34 L 30 46" fill="currentColor" stroke="currentColor" strokeWidth="1" />

    {/* Dudukan Bawah / Bracket */}
    <path d="M 16 52 V 57 H 24 V 52 M 40 52 V 57 H 48 V 52" />
  </svg>
);

/**
 * 2. Icon Tiang Listrik Single Crossarm (Tiang T / 1 Level Travers)
 * Berdasarkan gambar Gemini_Generated_Image_2e9k7u2e9k7u2e9k
 */
export const IconTiangSingleCrossarm: React.FC<IconProps> = ({
  size = 24,
  color = 'currentColor',
  strokeWidth = 2,
  className = '',
  ...props
}) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 64 64"
    fill="none"
    stroke={color}
    strokeWidth={strokeWidth}
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    {...props}
  >
    {/* Batang Utama Tiang Beton */}
    <path d="M 30 16 L 29 60 H 35 L 34 16 Z" />

    {/* Crossarm / Travers Tunggal */}
    <rect x="12" y="20" width="40" height="5" rx="1" />

    {/* Penopang Diagonal (Braces) */}
    <path d="M 22 25 L 30 35 M 42 25 L 34 35" />

    {/* Isolator Tumpu Kiri */}
    <path d="M 17 20 V 13 M 15 15 H 19 M 14 13 H 20" />
    {/* Isolator Tumpu Tengah */}
    <path d="M 32 20 V 13 M 30 15 H 34 M 29 13 H 35" />
    {/* Isolator Tumpu Kanan */}
    <path d="M 47 20 V 13 M 45 15 H 49 M 44 13 H 50" />
  </svg>
);

/**
 * 3. Icon Tiang Listrik Double Crossarm (Tiang 2 Level / Double Travers)
 * Berdasarkan gambar Gemini_Generated_Image_xsh8n5xsh8n5xsh8
 */
export const IconTiangDoubleCrossarm: React.FC<IconProps> = ({
  size = 24,
  color = 'currentColor',
  strokeWidth = 2,
  className = '',
  ...props
}) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 64 64"
    fill="none"
    stroke={color}
    strokeWidth={strokeWidth}
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    {...props}
  >
    {/* Tiang Beton */}
    <path d="M 30 8 L 29 60 H 35 L 34 8 Z" />

    {/* Travers Level 1 (Atas) */}
    <rect x="12" y="14" width="40" height="4" rx="1" />
    <path d="M 20 18 L 30 26 M 44 18 L 34 26" />

    {/* Isolator Atas (3 buah) */}
    <path d="M 17 14 V 9 M 15 11 H 19 M 32 14 V 9 M 30 11 H 34 M 47 14 V 9 M 45 11 H 49" />

    {/* Travers Level 2 (Bawah) */}
    <rect x="12" y="30" width="40" height="4" rx="1" />
    <path d="M 20 34 L 30 42 M 44 34 L 34 42" />

    {/* Isolator Bawah (3 buah) */}
    <path d="M 17 30 V 25 M 15 27 H 19 M 32 30 V 25 M 30 27 H 34 M 47 30 V 25 M 45 27 H 49" />
  </svg>
);

/**
 * 4. Icon Tiang Switching / LBS / FCO (Load Break Switch Pole)
 * Berdasarkan gambar Gemini_Generated_Image_yhb9akyhb9akyhb9
 */
export const IconTiangLBS: React.FC<IconProps> = ({
  size = 24,
  color = 'currentColor',
  strokeWidth = 2,
  className = '',
  ...props
}) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 64 64"
    fill="none"
    stroke={color}
    strokeWidth={strokeWidth}
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    {...props}
  >
    {/* Tiang Utama */}
    <path d="M 34 6 L 33 60 H 39 L 38 6 Z" />

    {/* Travers Atas */}
    <rect x="16" y="14" width="36" height="4" rx="1" />
    <path d="M 22 18 L 34 26 M 46 18 L 38 26" />

    {/* Isolator Atas Strain */}
    <path d="M 20 14 V 8 M 36 14 V 8 M 48 14 V 8" />

    {/* Unit LBS (Switching Box & FCO Fuse Bracket) di Samping Tiang */}
    <rect x="14" y="32" width="18" height="10" rx="1.5" />
    {/* 3 Isolator LBS */}
    <path d="M 17 32 V 26 M 23 32 V 26 M 29 32 V 26" />
    {/* Penopang Siku LBS */}
    <path d="M 14 42 L 33 50 M 32 38 H 34" />

    {/* Pipa/Stang Pengoperasian LBS Downward */}
    <path d="M 37 32 V 56" strokeDasharray="2 2" />
  </svg>
);

/**
 * 5. Icon Gardu Cantol / Gardu Portal 2-Tiang (GTT H-Frame / Portal Transformer)
 * Berdasarkan gambar Gemini_Generated_Image_utn3akutn3akutn3
 */
export const IconGarduPortal: React.FC<IconProps> = ({
  size = 24,
  color = 'currentColor',
  strokeWidth = 2,
  className = '',
  ...props
}) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 64 64"
    fill="none"
    stroke={color}
    strokeWidth={strokeWidth}
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    {...props}
  >
    {/* Tiang Portal Kiri & Kanan */}
    <path d="M 14 10 L 13 58 H 18 L 17 10 Z" />
    <path d="M 46 10 L 45 58 H 50 L 49 10 Z" />

    {/* Travers Atas Pengikat Portal */}
    <rect x="10" y="14" width="44" height="4" rx="1" />
    <path d="M 18 18 L 32 26 M 46 18 L 32 26" />

    {/* Isolator & Arrester Atas */}
    <path d="M 22 14 V 8 M 32 14 V 8 M 42 14 V 8" />

    {/* Platform Gelagar Dudukan Trafo Bawah */}
    <rect x="10" y="48" width="44" height="4" rx="1" />

    {/* Unit Trafo Distribusi Ditempatkan di Tengah Portal */}
    <rect x="22" y="30" width="20" height="18" rx="1.5" />
    {/* Bushing Trafo Portal */}
    <path d="M 26 30 V 25 M 32 30 V 25 M 38 30 V 25" />
    {/* Sirip Trafo */}
    <path d="M 25 35 H 39 M 25 39 H 39 M 25 43 H 39" />
  </svg>
);

/**
 * 6. Icon Gardu Beton / Kiosk Substation ("Listrik Pintar" PLN Building)
 * Berdasarkan gambar large_thumbnail-removebg-preview
 */
export const IconGarduBeton: React.FC<IconProps> = ({
  size = 24,
  color = 'currentColor',
  strokeWidth = 2,
  className = '',
  ...props
}) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 64 64"
    fill="none"
    stroke={color}
    strokeWidth={strokeWidth}
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    {...props}
  >
    {/* Pondasi Bawah */}
    <rect x="8" y="52" width="48" height="5" rx="1" />

    {/* Dinding Utama Bangunan Gardu */}
    <rect x="12" y="22" width="40" height="30" rx="1" />

    {/* Atap Canopy Overhang PLN Blue */}
    <path d="M 8 14 H 56 L 52 22 H 12 Z" fill="none" />
    <rect x="8" y="14" width="48" height="8" rx="1.5" />

    {/* Pintu Besi Ganda (Double Doors) */}
    <rect x="26" y="32" width="16" height="20" rx="1" />
    <path d="M 34 32 V 52" />
    {/* Gagang Pintu */}
    <circle cx="32" cy="42" r="1" fill="currentColor" />
    <circle cx="36" cy="42" r="1" fill="currentColor" />

    {/* Logo PLN / Kilat Listrik Pintar */}
    <path d="M 18 30 C 18 28 22 28 22 32 C 22 36 18 36 18 40" />
    <path d="M 19 28 L 21 24" />
    <path d="M 46 26 L 43 36 H 47 L 44 46" />
  </svg>
);

/**
 * 7. Icon Tiang Portal 3-Pole (H-Frame 3 Tiang)
 * Berdasarkan gambar Gemini_Generated_Image_ezsekzezsekzezse
 */
export const IconTiangPortal3Pole: React.FC<IconProps> = ({
  size = 24,
  color = 'currentColor',
  strokeWidth = 2,
  className = '',
  ...props
}) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 64 64"
    fill="none"
    stroke={color}
    strokeWidth={strokeWidth}
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    {...props}
  >
    {/* 3 Tiang Paralel */}
    <path d="M 14 12 L 13 58 H 17 L 16 12 Z" />
    <path d="M 32 12 L 31 58 H 35 L 34 12 Z" />
    <path d="M 50 12 L 49 58 H 53 L 52 12 Z" />

    {/* Travers Atas */}
    <rect x="10" y="16" width="44" height="4" rx="1" />
    <path d="M 15 20 L 32 28 M 49 20 L 32 28" />

    {/* Isolator Atas (4 Titik) */}
    <path d="M 14 16 V 10 M 26 16 V 10 M 38 16 V 10 M 50 16 V 10" />

    {/* Travers Tengah */}
    <rect x="10" y="34" width="44" height="4" rx="1" />
    <path d="M 15 38 L 32 46 M 49 38 L 32 46" />

    {/* Isolator Tengah */}
    <path d="M 23 34 V 28 M 41 34 V 28" />
  </svg>
);

/**
 * Export Helper SVG Strings untuk Leaflet divIcon atau HTML canvas
 */
export const ELECTRIC_ICON_SVG_STRINGS = {
  garduTrafo: `<svg width="24" height="24" viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M 18 18 L 18 12 M 15 15 H 21 M 14 12 H 22 M 16 8 H 20 V 12 H 16 Z M 32 18 L 32 12 M 29 15 H 35 M 28 12 H 36 M 30 8 H 34 V 12 H 30 Z M 46 18 L 46 12 M 43 15 H 49 M 42 12 H 50 M 44 8 H 48 V 12 H 44 Z"/><rect x="12" y="24" width="40" height="28" rx="2"/><rect x="8" y="18" width="48" height="6" rx="1"/><path d="M 16 30 H 22 M 16 34 H 22 M 16 38 H 22 M 16 42 H 22 M 16 46 H 22 M 42 30 H 48 M 42 34 H 48 M 42 38 H 48 M 42 42 H 48 M 42 46 H 48"/><path d="M 33 28 L 29 37 H 34 L 30 46" fill="currentColor"/><path d="M 16 52 V 57 H 24 V 52 M 40 52 V 57 H 48 V 52"/></svg>`,
  tiangSingle: `<svg width="24" height="24" viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M 30 16 L 29 60 H 35 L 34 16 Z"/><rect x="12" y="20" width="40" height="5" rx="1"/><path d="M 22 25 L 30 35 M 42 25 L 34 35"/><path d="M 17 20 V 13 M 15 15 H 19 M 14 13 H 20 M 32 20 V 13 M 30 15 H 34 M 29 13 H 35 M 47 20 V 13 M 45 15 H 49 M 44 13 H 50"/></svg>`,
  tiangDouble: `<svg width="24" height="24" viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M 30 8 L 29 60 H 35 L 34 8 Z"/><rect x="12" y="14" width="40" height="4" rx="1"/><path d="M 20 18 L 30 26 M 44 18 L 34 26"/><path d="M 17 14 V 9 M 15 11 H 19 M 32 14 V 9 M 30 11 H 34 M 47 14 V 9 M 45 11 H 49"/><rect x="12" y="30" width="40" height="4" rx="1"/><path d="M 20 34 L 30 42 M 44 34 L 34 42"/><path d="M 17 30 V 25 M 15 27 H 19 M 32 30 V 25 M 30 27 H 34 M 47 30 V 25 M 45 27 H 49"/></svg>`,
  tiangLBS: `<svg width="24" height="24" viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M 34 6 L 33 60 H 39 L 38 6 Z"/><rect x="16" y="14" width="36" height="4" rx="1"/><path d="M 22 18 L 34 26 M 46 18 L 38 26"/><path d="M 20 14 V 8 M 36 14 V 8 M 48 14 V 8"/><rect x="14" y="32" width="18" height="10" rx="1.5"/><path d="M 17 32 V 26 M 23 32 V 26 M 29 32 V 26"/><path d="M 14 42 L 33 50 M 32 38 H 34"/><path d="M 37 32 V 56" stroke-dasharray="2 2"/></svg>`,
  garduPortal: `<svg width="24" height="24" viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M 14 10 L 13 58 H 18 L 17 10 Z M 46 10 L 45 58 H 50 L 49 10 Z"/><rect x="10" y="14" width="44" height="4" rx="1"/><path d="M 18 18 L 32 26 M 46 18 L 32 26"/><path d="M 22 14 V 8 M 32 14 V 8 M 42 14 V 8"/><rect x="10" y="48" width="44" height="4" rx="1"/><rect x="22" y="30" width="20" height="18" rx="1.5"/><path d="M 26 30 V 25 M 32 30 V 25 M 38 30 V 25"/><path d="M 25 35 H 39 M 25 39 H 39 M 25 43 H 39"/></svg>`,
  garduBeton: `<svg width="24" height="24" viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><rect x="8" y="52" width="48" height="5" rx="1"/><rect x="12" y="22" width="40" height="30" rx="1"/><rect x="8" y="14" width="48" height="8" rx="1.5"/><rect x="26" y="32" width="16" height="20" rx="1"/><path d="M 34 32 V 52"/><circle cx="32" cy="42" r="1" fill="currentColor"/><circle cx="36" cy="42" r="1" fill="currentColor"/><path d="M 46 26 L 43 36 H 47 L 44 46"/></svg>`,
  tiangPortal3Pole: `<svg width="24" height="24" viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M 14 12 L 13 58 H 17 L 16 12 Z M 32 12 L 31 58 H 35 L 34 12 Z M 50 12 L 49 58 H 53 L 52 12 Z"/><rect x="10" y="16" width="44" height="4" rx="1"/><path d="M 15 20 L 32 28 M 49 20 L 32 28"/><path d="M 14 16 V 10 M 26 16 V 10 M 38 16 V 10 M 50 16 V 10"/><rect x="10" y="34" width="44" height="4" rx="1"/><path d="M 15 38 L 32 46 M 49 38 L 32 46"/><path d="M 23 34 V 28 M 41 34 V 28"/></svg>`
};
