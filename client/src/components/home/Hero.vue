.hero-section {
  @apply relative w-full;
  height: 300px;
  background: transparent;
}

.hero-content {
  @apply relative h-full flex flex-col items-center justify-center;
  padding-top: 40px;
  padding-bottom: 40px;
}

/* Bottom boundary effect */
.hero-section::after {
  content: '';
  @apply absolute bottom-0 left-0 right-0 h-[1px];
  background: linear-gradient(
    90deg,
    transparent 0%,
    rgba(167, 139, 250, 0.1) 20%,
    rgba(167, 139, 250, 0.3) 50%,
    rgba(167, 139, 250, 0.1) 80%,
    transparent 100%
  );
  box-shadow:
    0 0 20px 2px rgba(167, 139, 250, 0.2),
    0 0 40px 4px rgba(167, 139, 250, 0.1);
}

/* Bottom glow */
.hero-section::before {
  content: '';
  @apply absolute bottom-0 left-0 right-0 h-[30px];
  background: linear-gradient(
    to top,
    rgba(167, 139, 250, 0.08) 0%,
    rgba(167, 139, 250, 0.05) 40%,
    transparent 100%
  );
  pointer-events: none;
} 