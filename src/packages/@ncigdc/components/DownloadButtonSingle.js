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

class DownloadButtonSingle extends Component {
	
	constructor(props) {
		super(props);
		
		this.state = { downloadControlled: false };
		this.downloadFile = this.downloadFile.bind(this);
	}
	
	downloadFile(file) {
		if (file.access === 'open') {
			const url = 'data/knowledgeEnvironment/' + file.file_name;
			const a = document.createElement('a');
			a.style.display = 'none';
			a.href = url;
			document.body.appendChild(a);
			a.click();
			document.body.removeChild(a);
		} else {
			this.setState({downloadControlled: true});
			state.blah = "blah";
		}
	}
	
	render() {
		let dispatch = this.props.dispatch;
		let file = this.props.file;
		let files = this.props.files;
		let theme = this.props.theme;
		let style = this.props.style;
		let asIcon = false;
		
		return (
			<div>
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
					this.downloadFile(file);
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
			</div>
		);
	}
	
	
}
	  

export default compose(connect(state => state.cart), withTheme)(
  DownloadButtonSingle,
);