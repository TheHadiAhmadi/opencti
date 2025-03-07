import React from 'react';
import ItemNumberDifference from '../ItemNumberDifference';
import { useFormatter } from '../i18n';

interface WidgetNumberProps {
  total: number
  value: number
}

const WidgetNumber = ({ total, value }: WidgetNumberProps) => {
  const { t_i18n, n } = useFormatter();
  const difference = total - value;

  return (
    <div style={{display: 'flex', alignItems: 'center', gap: '4px'}}>
      <div style={{ fontSize: 40 }}>
        {n(total)}
      </div>
      <ItemNumberDifference
        difference={difference}
        description={t_i18n('24 hours')}
      />
    </div>
  );
};

export default WidgetNumber;
