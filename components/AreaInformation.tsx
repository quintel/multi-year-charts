import { useEffect, useState } from 'react';
import { connect } from 'react-redux';
import { Transition } from '@headlessui/react';

import { AppState } from '../store/types';
import useCurrentLocale from '../utils/useCurrentLocale';

function Loading() {
  return (
    <Transition
      show={true}
      appear={true}
      leave="transition-opacity duration-300"
      leaveFrom="opacity-100"
      leaveTo="opacity-0"
      key="area-loading"
    >
      <div className="h-6 w-32 animate-pulse rounded bg-slate-600" />
    </Transition>
  );
}

function FetchedAreaInformation({ areaCode }: { areaCode: string }) {
  const [area, setArea] = useState<any | null>(null);
  const locale = useCurrentLocale();

  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_ETMODEL_URL}/areas/${areaCode}`, {
      method: 'GET',
      headers: { Accept: 'application/json' },
    })
      .then((response) => {
        if (response.ok) {
          return response.json();
        } else {
          throw new Error('Failed to fetch area information');
        }
      })
      .then((data) => {
        setArea(data);
      })
      .catch((error) => {
        setArea({ error });
      });
  }, [areaCode]);

  if (!area) {
    return <Loading />;
  } else if (area.error || !area.name[locale]) {
    return null;
  }

  return (
    <Transition
      show={true}
      appear={true}
      enter="transition-opacity duration-300"
      enterFrom="opacity-0"
      enterTo="opacity-100"
      key="area-information"
    >
      <div className="flex items-center gap-2 font-medium">
        {area.icon ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={`${process.env.NEXT_PUBLIC_ETMODEL_URL}/${area.icon.href}`}
            alt=""
            width={area.icon.width}
            height={area.icon.height}
          />
        ) : null}
        {area.name[locale]}
      </div>
    </Transition>
  );
}

function AreaInformation({ scenarios }: { scenarios: AppState['scenarioData'] }) {
  if (!scenarios || Object.keys(scenarios).length === 0) {
    return <Loading />;
  }

  const areas = Object.values(scenarios).map((data) => data.scenario.areaCode);
  const uniqueAreas = new Set(areas);

  if (uniqueAreas.size !== 1) {
    return null;
  }

  return <FetchedAreaInformation areaCode={areas[0]} />;
}

const mapStateToProps = (state: AppState) => ({
  scenarios: state.scenarioData,
});

export default connect(mapStateToProps, {})(AreaInformation);
