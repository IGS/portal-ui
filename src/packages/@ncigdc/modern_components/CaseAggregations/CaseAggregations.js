/* @flow */
import React from 'react';
import _ from 'lodash';
import {
  compose,
  withState,
  setDisplayName,
  withPropsOnChange,
} from 'recompose';

import Modal from '@ncigdc/uikit/Modal';
import SuggestionFacet from '@ncigdc/modern_components/SuggestionFacet';
import { Row } from '@ncigdc/uikit/Flex';
import FacetSelection from '@ncigdc/modern_components/FacetSelection';
import FacetWrapper from '@ncigdc/components/FacetWrapper';
import UploadSetButton from '@ncigdc/components/UploadSetButton';
import { withTheme } from '@ncigdc/theme';
import CaseIcon from '@ncigdc/theme/icons/Case';
import withFacetSelection from '@ncigdc/utils/withFacetSelection';
import escapeForRelay from '@ncigdc/utils/escapeForRelay';
import tryParseJSON from '@ncigdc/utils/tryParseJSON';
import FacetHeader from '@ncigdc/components/Aggregations/FacetHeader';
import { UploadCaseSet } from '@ncigdc/components/Modals/UploadSet';

import { IBucket } from '@ncigdc/components/Aggregations/types';
import features from '../../../../features';

export type TProps = {
  caseIdCollapsed: boolean,
  setCaseIdCollapsed: Function,
  relay: Object,
  facets: { facets: string },
  parsedFacets: Object,
  aggregations: {
    cases__demographics__sex: { buckets: [IBucket] },
    cases__demographics__age: { buckets: [IBucket] },
    cases__samples__tissue_type: { buckets: [IBucket] },
    cases__provider: { buckets: [IBucket] },
  },
  setAutocomplete: Function,
  theme: Object,
  suggestions: Array<Object>,

  userSelectedFacets: Array<{
    description: String,
    doc_type: String,
    field: String,
    full: String,
    type: 'id' | 'string' | 'long',
  }>,
  handleSelectFacet: Function,
  handleResetFacets: Function,
  handleRequestRemoveFacet: Function,
  presetFacetFields: Array<String>,
  shouldShowFacetSelection: Boolean,
  facetExclusionTest: Function,
  setShouldShowFacetSelection: Function,
};

const presetFacets = [
  {
    title: 'Sex',
    field: 'cases.demographics.sex',
    full: 'cases.demographics.sex',
    type: 'keyword',
  },
  {
    title: 'Age',
    field: 'cases.demographics.age',
    full: 'cases.demographics.age',
    type: 'keyword',
  },
  {
	  title: 'Tissue type',
	  field: 'cases.samples.tissue_type',
	  full: 'cases.samples.tissue_type',
	  type: 'keyword',
  },
  {
	  title: 'Provider',
	  field: 'cases.provider',
	  full: 'cases.provider',
	  type: 'keyword',
  },

];

const presetFacetFields = presetFacets.map(x => x.field);
const entityType = 'Files';

const enhance = compose(
  setDisplayName('RepoCaseAggregations'),
  withFacetSelection({
    entityType,
    presetFacetFields,
  }),
  withTheme,
  withState('caseIdCollapsed', 'setCaseIdCollapsed', false),
  withPropsOnChange(['viewer'], ({ viewer }) => ({
    parsedFacets: viewer.File
      ? tryParseJSON(viewer.File, {})
      : {},
  })),
);

const styles = {
  link: {
    textDecoration: 'underline',
    color: '#2a72a5',
  },
};

const CaseAggregationsComponent = (props: TProps) => (
  <div className="test-case-aggregations">
  { features.caseAggregations &&
    <div
      className="text-right"
      style={{
        padding: '10px 15px',
        borderBottom: `1px solid ${props.theme.greyScale5}`,
      }}
      >
      {!!props.userSelectedFacets.length && (
        <span>
          <a onClick={props.handleResetFacets} style={styles.link}>
            Reset
          </a>
          {' '}
          &nbsp;|&nbsp;
        </span>
      )}
	      <a
	        onClick={() => props.setShouldShowFacetSelection(true)}
	        style={styles.link}
	        >
	        Add a Case/Biospecimen Filter
	      </a>
    </div>
  }
    { features.caseAggregations &&
	    <Modal
	      isOpen={props.shouldShowFacetSelection}
	      style={{
	        content: {
	          border: 0,
	          padding: '15px',
	          width: '65%',
	        },
	      }}
	      >
	      <FacetSelection
	        additionalFacetData={props.parsedFacets}
	        docType="cases"
	        excludeFacetsBy={props.facetExclusionTest}
	        isCaseInsensitive
	        onRequestClose={() => props.setShouldShowFacetSelection(false)}
	        onSelect={props.handleSelectFacet}
	        title="Add a Case/Biospecimen Filter"
	        />
	    </Modal>
    }
    {props.userSelectedFacets.map(facet => (
    		<FacetWrapper
    		aggregation={props.parsedFacets[facet.field]}
    		facet={facet}
    		isRemovable
    		key={facet.full}
    		onRequestRemove={() => props.handleRequestRemoveFacet(facet)}
    		relayVarName="repoCaseCustomFacetFields"
    			style={{ borderBottom: `1px solid ${props.theme.greyScale5}` }}
    		/>
    ))}

    { features.searchByCaseId &&
	    <FacetHeader
	      collapsed={props.caseIdCollapsed}
	      description="Enter UUID or ID of Case, Sample, Portion, Slide, Analyte or Aliquot"
	      field="cases.case_id"
	      setCollapsed={props.setCaseIdCollapsed}
	      title="Case"
	      />
    }
    <SuggestionFacet
      collapsed={props.caseIdCollapsed}
      doctype="cases"
      dropdownItem={x => (
        <Row>
          <CaseIcon style={{
            paddingRight: '1rem',
            paddingTop: '1rem',
          }}
                    />
          <div>
            <div style={{ fontWeight: 'bold' }}>{x.case_id}</div>
            <div style={{ fontSize: '80%' }}>{x.submitter_id}</div>
            {x.project.project_id}
          </div>
        </Row>
      )}
      fieldNoDoctype="case_id"
      placeholder="e.g. TCGA-A5-A0G2, 432fe4a9-2..."
      queryType="case"
      title="Case"
      />
    { features.uploadCaseSet &&
	    <UploadSetButton
	      defaultQuery={{
	        pathname: '/repository',
	        query: { searchTableTab: 'cases' },
	      }}
	      idField="cases.case_id"
	      style={{
	        width: '100%',
	        borderBottom: `1px solid ${props.theme.greyScale5}`,
	        padding: '0 1.2rem 1rem',
	      }}
	      type="case"
	      UploadModal={UploadCaseSet}
	      >
	      Upload Case Set
	    </UploadSetButton>
    }
    {_.reject(presetFacets, { full: 'cases.case_id' }).map(facet => (
      <FacetWrapper
        additionalProps={facet.additionalProps}
        aggregation={
          props.viewer.File.aggregations[
            escapeForRelay(facet.field)
        ]
        }
        facet={facet}
        key={facet.full}
        relay={props.relay}
        title={facet.title}
        />
    ))}
  </div>

);

export default enhance(CaseAggregationsComponent);
