import React, { FC } from 'react';
import LocaleContext, { TranslateFunc } from '../utils/LocaleContext';

interface LocaleMessageProps {
  id: string;
  values?: Record<string, string>;
}

const LocaleMessage: FC<LocaleMessageProps> = ({ id, values }) => (
  <LocaleContext.Consumer>
    {(state: { translate: TranslateFunc }) => {
      return state.translate(id, values || {});
    }}
  </LocaleContext.Consumer>
);

export default LocaleMessage;
