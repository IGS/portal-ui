import React from 'react';
import BaseModal from '@ncigdc/components/Modals/BaseModal';


const AtlasContentNote = ({ onClose }) => (	
  <BaseModal title="Welcome to the KPMP Kidney Tissue Atlas Data Repository." closeText="Close" onClose={onClose}>	
    <p>	
    	The datasets available in this repository are a combination of 
    	KPMP participant biopsies and reference tissue samples.
    </p>
    <p>
    	Current data types in the Repository include:
    		<ul><li>Raw and processed transcriptomics data from single-nucleus, 
					single-cell, sub-segmental laser capture microdissection, and bulk 
					total/mRNA experiments</li>
				<li>Light microscopic whole slide image .svs files</li>
    		<li>A limited set of clinical characteristics for each participant 
					(Note: This is a live dataset that is subject to change as we clean 
					the data and/or revise the algorithms that generate the calculated 
					variables.)</li> 
    		</ul>
    </p>
    <p>
		This Atlas Repository is in active development mode. Additional data 
		releases are expected soon, and the user interface will 
		continue to evolve.
    </p>	
    
  </BaseModal>	
);	


export default AtlasContentNote;