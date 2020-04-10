import React, { Component } from 'react';
import ReactTooltip from 'react-tooltip';
import copy from 'copy-to-clipboard';

class CopyToClipboardButton extends Component {

    clickHandler() {
        ReactTooltip.show(this.tooltipElement);
        setTimeout(()=> ReactTooltip.hide(), 1000);
        copy(this.props.text);
    }

    render() {
        return (
            <React.Fragment>
                <span ref={ref => this.tooltipElement = ref} data-tip='Copied'></span>
                <span onClick={() => this.clickHandler()}>
                    <i className="filename-copy fa fa-copy" />
                </span>
                <ReactTooltip />
            </React.Fragment>
    )
    }
}

export default CopyToClipboardButton;

