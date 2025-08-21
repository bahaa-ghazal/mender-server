// Copyright 2020 Northern.tech AS
//
//    Licensed under the Apache License, Version 2.0 (the "License");
//    you may not use this file except in compliance with the License.
//    You may obtain a copy of the License at
//
//        http://www.apache.org/licenses/LICENSE-2.0
//
//    Unless required by applicable law or agreed to in writing, software
//    distributed under the License is distributed on an "AS IS" BASIS,
//    WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
//    See the License for the specific language governing permissions and
//    limitations under the License.
import { useEffect, useState } from 'react';
import { FormProvider, useForm } from 'react-hook-form';

import { FormControl, InputLabel, OutlinedInput, TextField, inputLabelClasses } from '@mui/material';
import { makeStyles } from 'tss-react/mui';

import ChipSelect from '@northern.tech/common-ui/ChipSelect';
import { DOCSTIPS, DocsTooltip } from '@northern.tech/common-ui/DocsLink';
import { InfoHintContainer } from '@northern.tech/common-ui/InfoHint';

import { HELPTOOLTIPS } from '../../helptips/HelpTooltips';
import { MenderHelpTooltip } from '../../helptips/MenderTooltip';
import { FileInformation } from './FileInformation';

const defaultVersion = '1.0.0';

const useStyles = makeStyles()(theme => ({
  formWrapper: { display: 'flex', flexDirection: 'column', gap: theme.spacing(2) },
  releaseName: {
    display: 'flex',
    alignItems: 'center',
    [`&.${inputLabelClasses.shrink}`]: {
      background: theme.palette.background.default,
      paddingLeft: theme.spacing(0.5),
      paddingRight: theme.spacing(),
      marginTop: theme.spacing(-0.5)
    }
  }
}));

export const VersionInformation = ({ creation = {}, onRemove, updateCreation }) => {
  const { file, fileSystem: propFs, name, softwareName: propName, softwareVersion: version = '', type } = creation;
  const [fileSystem, setFileSystem] = useState(propFs);
  const [softwareName, setSoftwareName] = useState(propName || name.replace('.', '-'));
  const [softwareVersion, setSoftwareVersion] = useState(version || defaultVersion);
  const { classes } = useStyles();

  useEffect(() => {
    updateCreation({ finalStep: true });
  }, [updateCreation]);

  useEffect(() => {
    updateCreation({ fileSystem, softwareName, softwareVersion, isValid: fileSystem && softwareName && softwareVersion });
  }, [fileSystem, softwareName, softwareVersion, updateCreation]);

  return (
    <>
      <FileInformation file={file} type={type} onRemove={onRemove} />
      <h4>Version information</h4>
      <div className={classes.formWrapper}>
        {[
          { key: 'fileSystem', title: 'Software filesystem', setter: setFileSystem, value: fileSystem },
          { key: 'softwareName', title: 'Software name', setter: setSoftwareName, value: softwareName },
          { key: 'softwareVersion', title: 'Software version', setter: setSoftwareVersion, value: softwareVersion }
        ].map(({ key, title, setter, value: currentValue }, index) => (
          <TextField autoFocus={!index} fullWidth key={key} label={title} onChange={({ target: { value } }) => setter(value)} value={currentValue} />
        ))}
      </div>
    </>
  );
};

const checkDestinationValidity = destination => (destination.length ? /^(?:\/|[a-z]+:\/\/)/.test(destination) : false);

export const ArtifactInformation = ({ creation = {}, deviceTypes = [], onRemove, updateCreation }) => {
  const { destination = '', file, name = '', selectedDeviceTypes = [], type } = creation;

  const methods = useForm({ mode: 'onChange', defaultValues: { deviceTypes: selectedDeviceTypes } });
  const { watch } = methods;
  const formDeviceTypes = watch('deviceTypes');
  const { classes } = useStyles();

  useEffect(() => {
    updateCreation({ selectedDeviceTypes: formDeviceTypes });
  }, [formDeviceTypes, updateCreation]);

  useEffect(() => {
    updateCreation({
      destination,
      isValid: checkDestinationValidity(destination) && selectedDeviceTypes.length && name,
      finalStep: false
    });
  }, [destination, name, selectedDeviceTypes.length, updateCreation]);

  const onDestinationChange = ({ target: { value } }) =>
    updateCreation({ destination: value, isValid: checkDestinationValidity(value) && selectedDeviceTypes.length && name });

  const isValidDestination = checkDestinationValidity(destination);
  return (
    <div className="flexbox column" style={{ gap: 15 }}>
      <FileInformation file={file} type={type} onRemove={onRemove} />
      <TextField
        autoFocus={true}
        error={!isValidDestination}
        fullWidth
        helperText={
          !isValidDestination ? <span className="warning">Destination has to be an absolute path</span> : 'where the file will be installed on your devices'
        }
        label="Destination directory"
        onChange={onDestinationChange}
        placeholder="Example: /opt/installed-by-single-file"
        value={destination}
      />
      <h4>Artifact information</h4>
      <FormControl>
        <InputLabel htmlFor="release-name" className={classes.releaseName} onClick={e => e.preventDefault()}>
          Release name
          <InfoHintContainer>
            <MenderHelpTooltip id={HELPTOOLTIPS.releaseName.id} />
            <DocsTooltip id={DOCSTIPS.releases.id} />
          </InfoHintContainer>
        </InputLabel>
        <OutlinedInput
          defaultValue={name}
          className="release-name-input"
          id="release-name"
          placeholder="A descriptive name for the software"
          onChange={e => updateCreation({ name: e.target.value })}
        />
      </FormControl>
      <FormProvider {...methods}>
        <form noValidate>
          <ChipSelect
            name="deviceTypes"
            label="Device types compatible"
            helperText="Enter all device types this software is compatible with"
            options={deviceTypes}
          />
        </form>
      </FormProvider>
    </div>
  );
};

const steps = [ArtifactInformation, VersionInformation];

export const ArtifactInformationForm = ({ activeStep, ...remainder }) => {
  const Component = steps[activeStep];
  return <Component {...remainder} />;
};

export default ArtifactInformationForm;
