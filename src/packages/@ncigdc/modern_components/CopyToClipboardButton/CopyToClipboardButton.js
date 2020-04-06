import React, { Component } from 'react';
import { CopyToClipboard } from 'react-copy-to-clipboard';
import ReactTooltip from 'react-tooltip';

class CopyToClipboardButton extends Component {

    handleMouseOut() {
        setTimeout(()=> ReactTooltip.hide(), 1000)
    }

    render() {
        return (
            <span data-event='click focus' data-tip="Copied!" onMouseOut={() => this.handleMouseOut()}>
                <CopyToClipboard text={this.props.text} >
                    <i className="filename-copy fa fa-copy" />
                </CopyToClipboard>
                <ReactTooltip />
            </span>
        )
    }
}

export default CopyToClipboardButton;

