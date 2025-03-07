import React, { FunctionComponent, useEffect, useState } from 'react';
import { Field, Form, Formik } from 'formik';
import Button from '@mui/material/Button';
import * as Yup from 'yup';
import { graphql } from 'react-relay';
import { RecordSourceSelectorProxy } from 'relay-runtime';
import { FormikConfig } from 'formik/dist/types';
import Drawer, { DrawerControlledDialProps, DrawerVariant } from '@components/common/drawer/Drawer';
import ConfidenceField from '@components/common/form/ConfidenceField';
import { useFormatter } from '../../../../components/i18n';
import { handleErrorInForm } from '../../../../relay/environment';
import CreatedByField from '../../common/form/CreatedByField';
import ObjectLabelField from '../../common/form/ObjectLabelField';
import ObjectMarkingField from '../../common/form/ObjectMarkingField';
import MarkdownField from '../../../../components/fields/MarkdownField';
import { ExternalReferencesField } from '../../common/form/ExternalReferencesField';
import { useSchemaCreationValidation } from '../../../../utils/hooks/useEntitySettings';
import { insertNode } from '../../../../utils/store';
import { Option } from '../../common/form/ReferenceField';
import { OrganizationCreationMutation, OrganizationCreationMutation$variables } from './__generated__/OrganizationCreationMutation.graphql';
import { OrganizationsLinesPaginationQuery$variables } from './__generated__/OrganizationsLinesPaginationQuery.graphql';
import { fieldSpacingContainerStyle } from '../../../../utils/field';
import useDefaultValues from '../../../../utils/hooks/useDefaultValues';
import OpenVocabField from '../../common/form/OpenVocabField';
import CustomFileUploader from '../../common/files/CustomFileUploader';
import useApiMutation from '../../../../utils/hooks/useApiMutation';
import CreateEntityControlledDial from '../../../../components/CreateEntityControlledDial';
import useHelper from '../../../../utils/hooks/useHelper';
import useBulkCommit from '../../../../utils/hooks/useBulkCommit';
import { splitMultilines } from '../../../../utils/String';
import BulkTextModal from '../../../../components/fields/BulkTextField/BulkTextModal';
import ProgressBar from '../../../../components/ProgressBar';
import BulkTextField from '../../../../components/fields/BulkTextField/BulkTextField';
import BulkTextModalButton from '../../../../components/fields/BulkTextField/BulkTextModalButton';

const organizationMutation = graphql`
  mutation OrganizationCreationMutation($input: OrganizationAddInput!) {
    organizationAdd(input: $input) {
      id
      standard_id
      name
      confidence
      description
      entity_type
      parent_types
      ...OrganizationLine_node
    }
  }
`;

const ORGANIZATION_TYPE = 'Organization';

interface OrganizationAddInput {
  name: string
  description: string
  confidence: number | null
  x_opencti_reliability: string | undefined
  x_opencti_organization_type: string | undefined
  createdBy: Option | null
  objectMarking: Option[]
  objectLabel: Option[]
  externalReferences: { value: string }[]
  file: File | null
}

interface OrganizationFormProps {
  updater: (store: RecordSourceSelectorProxy, key: string) => void
  onReset?: () => void;
  onCompleted?: () => void;
  defaultCreatedBy?: { value: string, label: string }
  defaultMarkingDefinitions?: { value: string, label: string }[]
  inputValue?: string;
  bulkModalOpen?: boolean;
  onBulkModalClose: () => void;
}

export const OrganizationCreationForm: FunctionComponent<OrganizationFormProps> = ({
  updater,
  onReset,
  onCompleted,
  defaultCreatedBy,
  defaultMarkingDefinitions,
  bulkModalOpen = false,
  onBulkModalClose,
  inputValue,
}) => {
  const { t_i18n } = useFormatter();
  const [progressBarOpen, setProgressBarOpen] = useState(false);

  const basicShape = {
    name: Yup.string()
      .min(2)
      .required(t_i18n('This field is required')),
    description: Yup.string()
      .nullable(),
    confidence: Yup.number().nullable(),
    x_opencti_organization_type: Yup.string()
      .nullable(),
    x_opencti_reliability: Yup.string()
      .nullable(),
  };
  const organizationValidator = useSchemaCreationValidation(ORGANIZATION_TYPE, basicShape);

  const [commit] = useApiMutation<OrganizationCreationMutation>(
    organizationMutation,
    undefined,
    { successMessage: `${t_i18n('entity_Organization')} ${t_i18n('successfully created')}` },
  );
  const {
    bulkCommit,
    bulkCount,
    bulkCurrentCount,
    BulkResult,
    resetBulk,
  } = useBulkCommit<OrganizationCreationMutation>({
    commit,
    relayUpdater: (store) => {
      if (updater) {
        updater(store, 'organizationAdd');
      }
    },
  });

  useEffect(() => {
    if (bulkCount > 1) {
      setProgressBarOpen(true);
    }
  }, [bulkCount]);

  const onSubmit: FormikConfig<OrganizationAddInput>['onSubmit'] = (values, {
    setSubmitting,
    setErrors,
    resetForm,
  }) => {
    const allNames = splitMultilines(values.name);
    const variables: OrganizationCreationMutation$variables[] = allNames.map((name) => ({
      input: {
        name,
        description: values.description,
        x_opencti_reliability: values.x_opencti_reliability,
        x_opencti_organization_type: values.x_opencti_organization_type,
        createdBy: values.createdBy?.value,
        confidence: parseInt(String(values.confidence), 10),
        objectMarking: values.objectMarking.map((v) => v.value),
        objectLabel: values.objectLabel.map((v) => v.value),
        externalReferences: values.externalReferences.map(({ value }) => value),
        file: values.file,
      },
    }));

    bulkCommit({
      variables,
      onStepError: (error) => {
        handleErrorInForm(error, setErrors);
      },
      onCompleted: (total: number) => {
        setSubmitting(false);
        if (total < 2) {
          resetForm();
          onCompleted?.();
        }
      },
    });
  };

  const initialValues = useDefaultValues(
    ORGANIZATION_TYPE,
    {
      name: inputValue ?? '',
      description: '',
      x_opencti_reliability: undefined,
      x_opencti_organization_type: undefined,
      createdBy: defaultCreatedBy ?? null,
      confidence: null,
      objectMarking: defaultMarkingDefinitions ?? [],
      objectLabel: [],
      externalReferences: [],
      file: null,
    },
  );

  return <Formik<OrganizationAddInput>
    initialValues={initialValues}
    validationSchema={organizationValidator}
    onSubmit={onSubmit}
    onReset={onReset}
         >
    {({
      submitForm,
      handleReset,
      isSubmitting,
      setFieldValue,
      values,
      resetForm,
    }) => (
      <>
        <BulkTextModal
          open={bulkModalOpen}
          onClose={onBulkModalClose}
          onValidate={async (val) => {
            await setFieldValue('name', val);
            if (splitMultilines(val).length > 1) {
              await setFieldValue('file', null);
            }
          }}
          formValue={values.name}
        />
        <ProgressBar
          open={progressBarOpen}
          value={(bulkCurrentCount / bulkCount) * 100}
          label={`${bulkCurrentCount}/${bulkCount}`}
          title={t_i18n('Create multiple entities')}
          onClose={() => {
            setProgressBarOpen(false);
            resetForm();
            resetBulk();
            onCompleted?.();
          }}
        >
          <BulkResult variablesToString={(v) => v.input.name} />
        </ProgressBar>
        <Form>
          <Field
            component={BulkTextField}
            variant="standard"
            name="name"
            label={t_i18n('Name')}
            fullWidth={true}
            detectDuplicate={['Organization']}
          />
          <Field
            component={MarkdownField}
            name="description"
            label={t_i18n('Description')}
            fullWidth={true}
            multiline={true}
            rows="4"
            style={fieldSpacingContainerStyle}
          />
          <ConfidenceField
            entityType="Organization"
            containerStyle={fieldSpacingContainerStyle}
          />
          { /* TODO Improve customization (vocab with letter range) 2662 */}
          <OpenVocabField
            label={t_i18n('Organization type')}
            type="organization_type_ov"
            name="x_opencti_organization_type"
            containerStyle={fieldSpacingContainerStyle}
            multiple={false}
            onChange={setFieldValue}
          />
          <OpenVocabField
            label={t_i18n('Reliability')}
            type="reliability_ov"
            name="x_opencti_reliability"
            containerStyle={fieldSpacingContainerStyle}
            multiple={false}
            onChange={setFieldValue}
          />
          <CreatedByField
            name="createdBy"
            style={fieldSpacingContainerStyle}
            setFieldValue={setFieldValue}
          />
          <ObjectLabelField
            name="objectLabel"
            style={fieldSpacingContainerStyle}
            setFieldValue={setFieldValue}
            values={values.objectLabel}
          />
          <ObjectMarkingField
            name="objectMarking"
            style={fieldSpacingContainerStyle}
            setFieldValue={setFieldValue}
          />
          <ExternalReferencesField
            name="externalReferences"
            style={fieldSpacingContainerStyle}
            setFieldValue={setFieldValue}
            values={values.externalReferences}
          />
          <Field
            component={CustomFileUploader}
            name="file"
            setFieldValue={setFieldValue}
            disabled={splitMultilines(values.name).length > 1}
            noFileSelectedLabel={splitMultilines(values.name).length > 1
              ? t_i18n('File upload not allowed in bulk creation')
              : undefined
            }
          />
          <div style={{
            marginTop: '20px',
            textAlign: 'end',
          }}
          >
            <Button
              variant="contained"
              onClick={handleReset}
              disabled={isSubmitting}
            >
              {t_i18n('Cancel')}
            </Button>
            <Button
              variant="contained"
              color="secondary"
              onClick={submitForm}
              disabled={isSubmitting}
              sx={{ marginInlineStart: 2 }}
            >
              {t_i18n('Create')}
            </Button>
          </div>
        </Form>
      </>
    )}
  </Formik>;
};

const OrganizationCreation = ({ paginationOptions }: {
  paginationOptions: OrganizationsLinesPaginationQuery$variables
}) => {
  const { t_i18n } = useFormatter();
  const [bulkOpen, setBulkOpen] = useState(false);
  const { isFeatureEnable } = useHelper();
  const isFABReplaced = isFeatureEnable('FAB_REPLACEMENT');
  const updater = (store: RecordSourceSelectorProxy) => insertNode(
    store,
    'Pagination_organizations',
    paginationOptions,
    'organizationAdd',
  );
  const CreateOrganizationControlledDial = (props: DrawerControlledDialProps) => (
    <CreateEntityControlledDial entityType='Organization' {...props} />
  );

  return (
    <Drawer
      title={t_i18n('Create an organization')}
      variant={isFABReplaced ? undefined : DrawerVariant.create}
      header={<BulkTextModalButton onClick={() => setBulkOpen(true)} />}
      controlledDial={isFABReplaced ? CreateOrganizationControlledDial : undefined}
    >
      {({ onClose }) => (
        <OrganizationCreationForm
          updater={updater}
          onCompleted={onClose}
          onReset={onClose}
          bulkModalOpen={bulkOpen}
          onBulkModalClose={() => setBulkOpen(false)}
        />
      )}
    </Drawer>
  );
};

export default OrganizationCreation;
