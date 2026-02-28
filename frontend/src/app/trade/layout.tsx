import { Navbar } from '@/components/Navbar';

export default function TradeLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Navbar />
      {children}
    </>
  );
}
