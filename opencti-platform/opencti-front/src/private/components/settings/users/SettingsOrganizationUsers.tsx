import React, { FunctionComponent } from 'react';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import Paper from '@mui/material/Paper';
import makeStyles from '@mui/styles/makeStyles';
import { HorizontalRule, Security } from '@mui/icons-material';
import SettingsOrganizationUserCreation from '@components/settings/users/SettingsOrganizationUserCreation';
import { SettingsOrganization_organization$data } from '@components/settings/organizations/__generated__/SettingsOrganization_organization.graphql';
import type { Theme } from '../../../../components/Theme';
import { useFormatter } from '../../../../components/i18n';
import useQueryLoading from '../../../../utils/hooks/useQueryLoading';
import SearchInput from '../../../../components/SearchInput';
import { usePaginationLocalStorage } from '../../../../utils/hooks/useLocalStorage';
import { SettingsOrganizationUsersLinesQuery, SettingsOrganizationUsersLinesQuery$variables } from './__generated__/SettingsOrganizationUsersLinesQuery.graphql';
import SettingsOrganizationUsersLines, { settingsOrganizationUsersLinesQuery } from './SettingsOrganizationUsersLines';
import { UserLineDummy } from './UserLine';
import ListLines from '../../../../components/list_lines/ListLines';
import { DataColumns } from '../../../../components/list_lines';

// Deprecated - https://mui.com/system/styles/basics/
// Do not use it for new code.
const useStyles = makeStyles<Theme>(() => ({
  paper: {
    margin: '28px 0 0 0',
    padding: '15px',
    borderRadius: 4,
  },
}));

interface MembersListContainerProps {
  organization: SettingsOrganization_organization$data;
}

const SettingsOrganizationUsers: FunctionComponent<
MembersListContainerProps
> = ({ organization }) => {
  const classes = useStyles();
  const { t_i18n } = useFormatter();
  const LOCAL_STORAGE_KEY = `organization-${organization.id}-users`;
  const { viewStorage, helpers, paginationOptions } = usePaginationLocalStorage<SettingsOrganizationUsersLinesQuery$variables>(LOCAL_STORAGE_KEY, { sortBy: 'name', orderAsc: true }, true);
  const { searchTerm, sortBy, orderAsc } = viewStorage;
  const queryRef = useQueryLoading<SettingsOrganizationUsersLinesQuery>(
    settingsOrganizationUsersLinesQuery,
    { ...paginationOptions, id: organization.id },
  );
  const dataColumns: DataColumns = {
    name: {
      label: 'Name',
      width: '20%',
      isSortable: true,
      render: (user) => user.name,
    },
    user_email: {
      label: 'Email',
      width: '25%',
      isSortable: true,
      render: (user) => user.user_email,
    },
    firstname: {
      label: 'Firstname',
      width: '12.5%',
      isSortable: true,
      render: (user) => user.firstname,
    },
    lastname: {
      label: 'Lastname',
      width: '12.5%',
      isSortable: true,
      render: (user) => user.lastname,
    },
    effective_confidence_level: {
      label: 'Max Confidence',
      width: '10%',
      isSortable: false,
    },
    otp: {
      label: '2FA',
      width: '5%',
      isSortable: false,
      render: (user) => (
        <>
          {user.otp_activated ? (
            <Security fontSize="small" color="secondary" />
          ) : (
            <HorizontalRule fontSize="small" color="primary" />
          )}
        </>
      ),
    },
    created_at: {
      label: 'Platform creation date',
      width: '10%',
      isSortable: true,
      render: (user, { fd }) => fd(user.created_at),
    },
  };

  return (
    <Grid item xs={12} style={{ marginTop: 0 }}>
      <Typography variant="h4" gutterBottom={true} style={{ float: 'inline-start' }}>
        {t_i18n('Users')}
      </Typography>
      <SettingsOrganizationUserCreation
        paginationOptions={paginationOptions}
        organization={organization}
        variant="standard"
      />
      <div style={{ float: 'inline-end', marginTop: -12 }}>
        <SearchInput
          variant="thin"
          onSubmit={helpers.handleSearch}
          keyword={searchTerm}
        />
      </div>
      <Paper classes={{ root: classes.paper }} className={'paper-for-grid'} variant="outlined">
        <ListLines
          handleSort={helpers.handleSort}
          handleSearch={helpers.handleSearch}
          handleAddFilter={helpers.handleAddFilter}
          handleRemoveFilter={helpers.handleRemoveFilter}
          handleToggleExports={helpers.handleToggleExports}
          handleSwitchLocalMode={helpers.handleSwitchLocalMode}
          handleSwitchGlobalMode={helpers.handleSwitchGlobalMode}
          sortBy={sortBy}
          orderAsc={orderAsc}
          dataColumns={dataColumns}
          inline={true}
          secondaryAction={true}
        >
          {queryRef && (
            <React.Suspense
              fallback={
                <>
                  {Array(20)
                    .fill(0)
                    .map((_, idx) => (
                      <UserLineDummy key={idx} dataColumns={dataColumns} />
                    ))}
                </>
              }
            >
              <SettingsOrganizationUsersLines
                dataColumns={dataColumns}
                queryRef={queryRef}
                paginationOptions={paginationOptions}
              />
            </React.Suspense>
          )}
        </ListLines>
      </Paper>
    </Grid>
  );
};

export default SettingsOrganizationUsers;
