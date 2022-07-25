import { RadioGroup } from '@headlessui/react';
import { connect } from 'react-redux';

import LocaleMessage from '../LocaleMessage';
import type { AppState, ChartStyle } from '../../store/types';
import { setPreferredChartStyle } from '../../store/actions';

const optionClasses = {
  checked:
    'bg-gradient-to-b from-white/20 to-transparent px-2 py-1 rounded bg-midnight-500 text-white cursor-default transition',
  unchecked:
    'px-2 py-1 rounded cursor-pointer hover:bg-gray-100 active:bg-gray-200 transition text-gray-700',
};

function Option({ checked, children }: { checked: boolean; children: React.ReactNode }) {
  return <div className={optionClasses[checked ? 'checked' : 'unchecked']}>{children}</div>;
}

interface Props {
  value: ChartStyle;
  onChange: (value: ChartStyle) => void;
}

function StyleToggle({ value, onChange }: Props) {
  return (
    <RadioGroup
      value={value}
      onChange={onChange}
      className="-my-1 ml-auto flex select-none items-center gap-1 rounded-md bg-white p-1 text-sm font-medium"
    >
      <RadioGroup.Label className="sr-only">
        <LocaleMessage id="displayAs.title" />
      </RadioGroup.Label>
      <RadioGroup.Option value="area">
        {({ checked }) => (
          <Option checked={checked}>
            <LocaleMessage id="displayAs.area" />
          </Option>
        )}
      </RadioGroup.Option>
      <RadioGroup.Option value="bar">
        {({ checked }) => (
          <Option checked={checked}>
            <LocaleMessage id="displayAs.bar" />
          </Option>
        )}
      </RadioGroup.Option>
      <RadioGroup.Option value="table">
        {({ checked }) => (
          <Option checked={checked}>
            <LocaleMessage id="displayAs.table" />
          </Option>
        )}
      </RadioGroup.Option>
    </RadioGroup>
  );
}

const mapStateToProps = (state: AppState) => ({
  value: state.preferredChartStyle,
});

export default connect(mapStateToProps, { onChange: setPreferredChartStyle })(StyleToggle);
