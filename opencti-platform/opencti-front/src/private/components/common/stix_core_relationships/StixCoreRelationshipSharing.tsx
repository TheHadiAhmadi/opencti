import React, { FunctionComponent, useState } from 'react';
import { graphql } from 'react-relay';
import makeStyles from '@mui/styles/makeStyles';
import DialogActions from '@mui/material/DialogActions';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import { AccountBalanceOutlined } from '@mui/icons-material';
import { BankPlus } from 'mdi-material-ui';
import Tooltip from '@mui/material/Tooltip';
import type { FormikHelpers } from 'formik/dist/types';
import { Form, Formik } from 'formik';
import Dialog from '@mui/material/Dialog';
import { DialogTitle } from '@mui/material';
import DialogContent from '@mui/material/DialogContent';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import EETooltip from '@components/common/entreprise_edition/EETooltip';
import EEChip from '@components/common/entreprise_edition/EEChip';
import ObjectOrganizationField from '../form/ObjectOrganizationField';
import { StixCoreRelationshipSharingQuery$data } from './__generated__/StixCoreRelationshipSharingQuery.graphql';
import { commitMutation, QueryRenderer } from '../../../../relay/environment';
import { useFormatter } from '../../../../components/i18n';
import { truncate } from '../../../../utils/String';
import useGranted, { KNOWLEDGE_KNUPDATE_KNORGARESTRICT } from '../../../../utils/hooks/useGranted';
import useEnterpriseEdition from '../../../../utils/hooks/useEnterpriseEdition';
import type { Theme } from '../../../../components/Theme';

// region types
interface ContainerHeaderSharedProps {
  elementId: string;
}

interface OrganizationForm {
  objectOrganization: { value: string; label: string };
}

// endregion

// Deprecated - https://mui.com/system/styles/basics/
// Do not use it for new code.
const useStyles = makeStyles<Theme>(() => ({
  organization: {
    margin: '0 7px 0 0',
    float: 'inline-start',
    fontSize: 12,
    lineHeight: '12px',
    height: 28,
  },
}));

const containerHeaderSharedQuery = graphql`
  query StixCoreRelationshipSharingQuery($id: String!) {
    stixCoreRelationship(id: $id) {
      objectOrganization {
        id
        name
      }
    }
  }
`;

const containerHeaderSharedQueryGroupDeleteMutation = graphql`
  mutation StixCoreRelationshipSharingGroupDeleteMutation(
    $id: ID!
    $organizationId: ID!
  ) {
    stixCoreRelationshipEdit(id: $id) {
      restrictionOrganizationDelete(organizationId: $organizationId) {
        id
        objectOrganization {
          id
          name
        }
      }
    }
  }
`;

const containerHeaderSharedGroupAddMutation = graphql`
  mutation StixCoreRelationshipSharingGroupAddMutation(
    $id: ID!
    $organizationId: ID!
  ) {
    stixCoreRelationshipEdit(id: $id) {
      restrictionOrganizationAdd(organizationId: $organizationId) {
        id
        objectOrganization {
          id
          name
        }
      }
    }
  }
`;

const StixCoreRelationshipSharing: FunctionComponent<
ContainerHeaderSharedProps
> = ({ elementId }) => {
  const classes = useStyles();
  const { t_i18n } = useFormatter();
  const [displaySharing, setDisplaySharing] = useState(false);
  const isEnterpriseEdition = useEnterpriseEdition();
  const userIsOrganizationEditor = useGranted([
    KNOWLEDGE_KNUPDATE_KNORGARESTRICT,
  ]);
  if (!userIsOrganizationEditor) {
    return <div style={{ marginTop: -20 }} />;
  }
  const handleOpenSharing = () => setDisplaySharing(true);
  const handleCloseSharing = () => setDisplaySharing(false);
  const removeOrganization = (organizationId: string) => {
    commitMutation({
      mutation: containerHeaderSharedQueryGroupDeleteMutation,
      variables: { id: elementId, organizationId },
      onCompleted: undefined,
      updater: undefined,
      optimisticUpdater: undefined,
      optimisticResponse: undefined,
      onError: undefined,
      setSubmitting: undefined,
    });
  };
  const onSubmitOrganizations = (
    values: OrganizationForm,
    { setSubmitting, resetForm }: FormikHelpers<OrganizationForm>,
  ) => {
    const { objectOrganization } = values;
    if (objectOrganization.value) {
      commitMutation({
        mutation: containerHeaderSharedGroupAddMutation,
        variables: { id: elementId, organizationId: objectOrganization.value },
        onCompleted: () => {
          setSubmitting(false);
          resetForm();
          setDisplaySharing(false);
        },
        updater: undefined,
        optimisticUpdater: undefined,
        optimisticResponse: undefined,
        onError: undefined,
        setSubmitting: undefined,
      });
    }
  };
  const render = ({
    stixCoreRelationship,
  }: StixCoreRelationshipSharingQuery$data) => {
    const edges = stixCoreRelationship?.objectOrganization ?? [];
    return (
      <React.Fragment>
        <Typography variant="h3" gutterBottom={true} style={{ float: 'inline-start' }}>
          {t_i18n('Organizations sharing')}
        </Typography>
        <EETooltip title={t_i18n('Share with an organization')}>
          <IconButton
            color="primary"
            aria-label="Label"
            onClick={isEnterpriseEdition ? handleOpenSharing : () => {}}
            style={{ float: 'inline-start', margin: '-6px 0 0 3px' }}
            size="small"
          >
            <BankPlus fontSize="small" color={isEnterpriseEdition ? 'primary' : 'disabled'} />
          </IconButton>
        </EETooltip>
        {!isEnterpriseEdition && <EEChip floating={true} />}
        <div className="clearfix" />
        {edges.map((edge) => (
          <Tooltip key={edge.id} title={edge.name}>
            <Chip
              icon={<AccountBalanceOutlined />}
              classes={{ root: classes.organization }}
              color="warning"
              variant="outlined"
              label={truncate(edge.name, 15)}
              onDelete={() => removeOrganization(edge.id)}
            />
          </Tooltip>
        ))}
        <div className="clearfix" />
        <Formik
          initialValues={{ objectOrganization: { value: '', label: '' } }}
          onSubmit={onSubmitOrganizations}
          onReset={handleCloseSharing}
        >
          {({ submitForm, handleReset, isSubmitting }) => (
            <Dialog
              PaperProps={{ elevation: 1 }}
              open={displaySharing}
              onClose={() => handleReset()}
              fullWidth={true}
            >
              <DialogTitle>{t_i18n('Share with an organization')}</DialogTitle>
              <DialogContent style={{ overflowY: 'hidden' }}>
                <Form>
                  <ObjectOrganizationField
                    name="objectOrganization"
                    style={{ width: '100%' }}
                    label={t_i18n('Organization')}
                    multiple={false}
                  />
                </Form>
              </DialogContent>
              <DialogActions>
                <Button onClick={handleReset} disabled={isSubmitting}>
                  {t_i18n('Close')}
                </Button>
                <Button
                  onClick={submitForm}
                  disabled={isSubmitting}
                  color="secondary"
                >
                  {t_i18n('Share')}
                </Button>
              </DialogActions>
            </Dialog>
          )}
        </Formik>
      </React.Fragment>
    );
  };
  return (
    <QueryRenderer
      query={containerHeaderSharedQuery}
      variables={{ id: elementId }}
      render={(result: { props: StixCoreRelationshipSharingQuery$data }) => {
        if (result.props) {
          return render(result.props);
        }
        return <div />;
      }}
    />
  );
};

export default StixCoreRelationshipSharing;
