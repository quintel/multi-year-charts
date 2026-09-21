import { RadioGroup } from '@headlessui/react';
import { useRouter } from 'next/router';

import { Option } from './ChartWrapper/UnitToggle';
import { showingAllInputs } from '../utils/inputs/urls';
import useTranslate from '../utils/useTranslate';

export default function InputsToggle() {
  const router = useRouter();
  const translate = useTranslate();
  const showAll = showingAllInputs(router.query);

  const change = (value: 'all' | 'mod') => {
    const [path, search] = router.asPath.split('?');
    const params = new URLSearchParams(search);

    if (value === 'all') {
      params.set('all', 'true');
    } else {
      params.delete('all');
    }

    const query = params.toString();

    router.replace(`${path}${query ? `?${query}` : ''}`);
  };

  return (
    <RadioGroup
      value={showAll ? 'all' : 'mod'}
      onChange={change}
      className="flex select-none items-center gap-1 rounded border border-myetm-600 bg-myetm-200 p-1 text-sm font-medium"
    >
      <RadioGroup.Label className="sr-only">Which inputs to show</RadioGroup.Label>
      <RadioGroup.Option value="mod">
        {({ checked }) => (
          <Option checked={checked} disabled={false}>
            {translate('inputs.modified')}
          </Option>
        )}
      </RadioGroup.Option>
      <RadioGroup.Option value="all">
        {({ checked }) => (
          <Option checked={checked} disabled={false}>
            {translate('inputs.all')}
          </Option>
        )}
      </RadioGroup.Option>
    </RadioGroup>
  );
}
