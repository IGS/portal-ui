import React, { Component } from 'react';
import { connect } from 'react-redux';
import { compose } from 'recompose';
import Button from '@ncigdc/uikit/Button';
import { withTheme } from '@ncigdc/theme';
import DownloadIcon from '@ncigdc/theme/icons/Download';
import Hidden from '@ncigdc/components/Hidden';
import Color from 'color';
import ReactGA from 'react-ga';
import BaseModal from '@ncigdc/components/Modals/BaseModal';

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

class DownloadButtonSingleControlled extends Component {
	
	
	render() {
		let dispatch = this.props.dispatch;
		let file = this.props.file;
		let files = this.props.files;
		let theme = this.props.theme;
		let style = this.props.style;
		let asIcon = false;
		
		return (
				<Button
			    className="test-download"
			    style={{
			      ...styles.button(theme)
			    }}
			    onClick={() => {
					ReactGA.event({
						category: 'Download',
						action: 'File',
						label: file.file_name
					});
					downloadFile(file);
			    }}
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
}

const downloadFile = (file) => {
	alert("NO")
};
	
export default compose(connect(state => state.cart), withTheme)(
		DownloadButtonSingleControlled,
);