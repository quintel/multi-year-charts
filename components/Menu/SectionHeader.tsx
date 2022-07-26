import Divider from './Divider';

export default function SectionHeader({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Divider />
      <h6 className="ml-3.5 block px-5 pt-2 pb-1 text-xs font-medium uppercase text-slate-400">
        {children}
      </h6>
    </>
  );
}
