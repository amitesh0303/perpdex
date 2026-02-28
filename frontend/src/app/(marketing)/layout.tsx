import { LandingNavbar } from '@/components/LandingNavbar';

export default function MarketingLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <LandingNavbar />
      {children}
    </>
  );
}
