import makeStyles from '@mui/styles/makeStyles';
import React from 'react';
import type { Theme } from '../../../../../components/Theme';
import type { ScaleConfig } from './scale';

// Deprecated - https://mui.com/system/styles/basics/
// Do not use it for new code.
const useStyles = makeStyles<Theme>(() => ({
  railSpan: {
    height: '5px',
    width: '100%',
    display: 'block',
  },
  scaleBar: {
    display: 'flex',
    width: '100%',
    padding: '20px 0 20px 0',
  },
  tickContainer: {
    display: 'flex',
    flexDirection: 'column',
    flex: 1, // same size for all ticks
  },
  tickLabel: {
    textAlign: 'center',
    fontSize: 12,
    padding: '10px 4px',
  },
  tickValue: {
    textAlign: 'start',
  },
}));

const ScaleBar = ({ scale }: { scale: ScaleConfig }) => {
  const classes = useStyles();

  const ticks = [scale.min, ...scale.ticks];

  return (
    <div className={classes.scaleBar}>
      {ticks.map((tick, index) => (
        <div key={index} className={classes.tickContainer}>
          <div className={classes.tickValue}>
            <span style={{ color: `${index === 0 ? '#607d8b' : tick.color}` }}>
              {tick.value}
            </span>
            {index === scale.ticks.length && (
              <span style={{ color: `${tick.color}`, float: 'inline-end' }}>{scale.max.value}</span>
            )}
          </div>
          <div>
            <span
              className={classes.railSpan}
              style={{ backgroundColor: `${tick.color ? tick.color : '#00b1ff'}` }}
            >
            </span>
          </div>
          <div className={classes.tickLabel}>
            <span>{tick.label}</span>
          </div>
        </div>
      ))}
    </div>
  );
};

export default ScaleBar;
