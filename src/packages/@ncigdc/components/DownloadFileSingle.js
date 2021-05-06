// @flow
import React from 'react';
import { compose } from 'recompose';
import { connect } from 'react-redux';

import { withTheme } from '@ncigdc/theme';
import DownloadButtonSingle from '@ncigdc/components/DownloadButtonSingle';
import DownloadIcon from '@ncigdc/theme/icons/Download';
import { setModal } from '@ncigdc/dux/modal';
import BaseModal from '@ncigdc/components/Modals/BaseModal';
import Hidden from '@ncigdc/components/Hidden';
import Button from '@ncigdc/uikit/Button';
import Color from "color";

const styles = {
    button: theme => ({
        padding: '3px 5px',
        height: '22px',
        border: `1px solid ${theme.greyScale4}`,
    }),
    inactive: theme => ({
        backgroundColor: 'white',
        color: theme.greyScale2,
        ':hover': {
            backgroundColor: theme.greyScale6,
        },
    }),
    active: theme => ({
        backgroundColor: theme.success,
        color: '#fff',
        ':hover': {
            backgroundColor: Color(theme.success)
                .darken(0.3)
                .rgbString(),
        },
    }),
};

type TProps = {
  file: Object,
  dispatch: Function,
  inactiveText?: string,
  theme: Object
};

function DownloadFile({
  file,
  dispatch,
  inactiveText,
    theme
}: TProps): any {
  if (file.access === 'open') {
    return (
        <DownloadButtonSingle file={file} />
    );
  }
  return (
    <Button
      className="test-download"
      style={{
        ...styles.button(theme)
    }}
      onClick={() =>
        dispatch(
          setModal(
                <BaseModal title="Access Alert" closeText={'Cancel'} extraButtons={[<Button onClick={() => window.open("https://app.smartsheet.com/b/form/9f20e0eb3f334b388f78a539e3396fd5", "_blank")}>Request Access</Button>]}>
                    <p> You are attempting to download files that are considered controlled access. To protect the privacy of our study participants, a signed Data Use Agreement is required to gain access to this data.
                    </p>
                    <p>
                        Click the button below to request access.
                    </p>
                </BaseModal>
              )
        )}
      leftIcon={inactiveText && <i className={'fa fa-download'} />}
      aria-label="Download file"
    >
        <DownloadIcon
            style={{
                color: '#fff',
            }}
        />
        <Hidden>Download file</Hidden>
    </Button>
  );
}

export default compose(connect(state => ({ ...state.auth, ...state.cart })),withTheme)(
  DownloadFile
);
