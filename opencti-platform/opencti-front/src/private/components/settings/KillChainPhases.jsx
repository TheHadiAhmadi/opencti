import React, { Component } from 'react';
import * as PropTypes from 'prop-types';
import { compose, propOr } from 'ramda';
import { graphql } from 'react-relay';
import withStyles from '@mui/styles/withStyles';
import { QueryRenderer } from '../../../relay/environment';
import { buildViewParamsFromUrlAndStorage, saveViewParameters } from '../../../utils/ListParameters';
import inject18n from '../../../components/i18n';
import ListLines from '../../../components/list_lines/ListLines';
import KillChainPhasesLines, { killChainPhasesLinesQuery } from './kill_chain_phases/KillChainPhasesLines';
import KillChainPhaseCreation from './kill_chain_phases/KillChainPhaseCreation';
import LabelsVocabulariesMenu from './LabelsVocabulariesMenu';
import withRouter from '../../../utils/compat-router/withRouter';
import Breadcrumbs from '../../../components/Breadcrumbs';

const styles = () => ({
  container: {
    margin: 0,
    padding: '0 200px 50px 0',
  },
});

export const killChainPhasesSearchQuery = graphql`
  query KillChainPhasesSearchQuery($search: String) {
    killChainPhases(search: $search) {
      edges {
        node {
          id
          kill_chain_name
          phase_name
          x_opencti_order
        }
      }
    }
  }
`;

const LOCAL_STORAGE_KEY = 'killChainPhases';

class KillChainPhases extends Component {
  constructor(props) {
    super(props);
    const params = buildViewParamsFromUrlAndStorage(
      props.navigate,
      props.location,
      LOCAL_STORAGE_KEY,
    );
    this.state = {
      sortBy: propOr('x_opencti_order', 'sortBy', params),
      orderAsc: propOr(true, 'orderAsc', params),
      searchTerm: propOr('', 'searchTerm', params),
      view: propOr('lines', 'view', params),
    };
  }

  saveView() {
    saveViewParameters(
      this.props.navigate,
      this.props.location,
      LOCAL_STORAGE_KEY,
      this.state,
    );
  }

  handleSearch(value) {
    this.setState({ searchTerm: value }, () => this.saveView());
  }

  handleSort(field, orderAsc) {
    this.setState({ sortBy: field, orderAsc }, () => this.saveView());
  }

  renderLines(paginationOptions) {
    const { sortBy, orderAsc, searchTerm } = this.state;
    const dataColumns = {
      kill_chain_name: {
        label: 'Kill chain name',
        width: '30%',
        isSortable: true,
      },
      phase_name: {
        label: 'Phase name',
        width: '35%',
        isSortable: true,
      },
      x_opencti_order: {
        label: 'Order',
        width: '10%',
        isSortable: true,
      },
      created: {
        label: 'Original creation date',
        width: '15%',
        isSortable: true,
      },
    };
    return (
      <ListLines
        sortBy={sortBy}
        orderAsc={orderAsc}
        dataColumns={dataColumns}
        handleSort={this.handleSort.bind(this)}
        handleSearch={this.handleSearch.bind(this)}
        displayImport={false}
        secondaryAction={true}
        keyword={searchTerm}
      >
        <QueryRenderer
          query={killChainPhasesLinesQuery}
          variables={{ count: 25, ...paginationOptions }}
          render={({ props }) => (
            <KillChainPhasesLines
              data={props}
              paginationOptions={paginationOptions}
              dataColumns={dataColumns}
              initialLoading={props === null}
            />
          )}
        />
      </ListLines>
    );
  }

  render() {
    const { t, classes } = this.props;
    const { view, sortBy, orderAsc, searchTerm } = this.state;
    const paginationOptions = {
      search: searchTerm,
      orderBy: sortBy,
      orderMode: orderAsc ? 'asc' : 'desc',
    };
    return (
      <div className={classes.container}>
        <LabelsVocabulariesMenu />
        <Breadcrumbs variant="list" elements={[{ label: t('Settings') }, { label: t('Taxonomies') }, { label: t('Kill chain phases'), current: true }]} />
        {view === 'lines' ? this.renderLines(paginationOptions) : ''}
        <KillChainPhaseCreation paginationOptions={paginationOptions} />
      </div>
    );
  }
}

KillChainPhases.propTypes = {
  classes: PropTypes.object,
  t: PropTypes.func,
  navigate: PropTypes.func,
  location: PropTypes.object,
};

export default compose(
  inject18n,
  withRouter,
  withStyles(styles),
)(KillChainPhases);
