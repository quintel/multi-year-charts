import { useRouter } from 'next/router';
import AreaInformation from './AreaInformation';

export default function SessionTitle() {
  const title = useRouter().query.title;

  if (!title || title.length === 0) {
    return null;
  }

  return (
    <div className="bg-tyndp-light-blue pt-4 text-grey-800">
      <div className="container mx-auto flex border-b border-b-slate-400 pb-2">
        <h1 className="text-xl font-semibold">{title}</h1>
        <div className="ml-auto flex items-center">
          <AreaInformation />
        </div>
      </div>
    </div>
  );
}
