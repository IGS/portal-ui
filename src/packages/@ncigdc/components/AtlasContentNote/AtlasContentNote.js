import React, { Component } from 'react';
// import { ColumnCenter, RowCenter, PieTitle, SelfFilteringPie } from './';
import { Row, Column } from '@ncigdc/uikit/Flex';

class AtlasContentNote extends Component {
	render() {
		return (
			<Row style={{flexWrap: "wrap", justifyContent: "space-around", 
				alignItems: "center", padding: "15px"}}>
				<Column>
					<span style={{fontWeight: "700"}}>PLEASE NOTE:</span>
					The datasets available in this repository are a 
					combination of reference tissue samples and biopsies taken 
					from KPMP participants. In addition to the transcriptomics 
					data and whole slide images, we provide a portion of the 
					clinical data for the samples. This tool is currently still 
					in active development. Additional data releases are expected 
					soon and the user interface will be evolving.
				</Column>
			</Row>
		);
	}
}

export default AtlasContentNote;