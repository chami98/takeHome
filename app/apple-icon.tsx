import { ImageResponse } from 'next/og';

export const size = { width: 180, height: 180 };
export const contentType = 'image/png';

export default function AppleIcon() {
  return new ImageResponse(
    (
      <svg width="180" height="180" viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">
        <rect width="64" height="64" fill="#0B1647" />
        <path d="M16 18h32v9H37v21h-10V27H16z" fill="#fff" />
        <circle cx="48" cy="46" r="6" fill="#F5B73B" />
      </svg>
    ),
    size,
  );
}
