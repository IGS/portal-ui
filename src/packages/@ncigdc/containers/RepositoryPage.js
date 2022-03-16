/* @flow */

import React from 'react';
import Relay from 'react-relay/classic';
import { connect } from 'react-redux';
import { compose, setDisplayName } from 'recompose';
import { Row } from '@ncigdc/uikit/Flex';
import SearchPage from '@ncigdc/components/SearchPage';
import TabbedLinks from '@ncigdc/components/TabbedLinks';
import NoResultsMessage from '@ncigdc/components/NoResultsMessage';
import RepoCasesTable from '@ncigdc/modern_components/RepoCasesTable';
import CaseAggregations from '@ncigdc/modern_components/CaseAggregations';
import FileAggregations from '@ncigdc/modern_components/FileAggregations';

import FilesTable from '@ncigdc/modern_components/FilesTable';
import { SaveIcon } from '@ncigdc/theme/icons';
import withFilters from '@ncigdc/utils/withFilters';
import formatFileSize from '@ncigdc/utils/formatFileSize';
import RepoCasesPies from '@ncigdc/components/TabPieCharts/RepoCasesPies';

import withRouter from '@ncigdc/utils/withRouter';
import ActionsRow from '@ncigdc/components/ActionsRow';
import features from '../../../features';

export type TProps = {
  push: Function,
  relay: Object,
  dispatch: Function,
  filters: any,
  cases_sort: any,
  viewer: {
    autocomplete_case: {
      hits: Array<Object>,
    },
    autocomplete_file: {
      hits: Array<Object>,
    },
    cart_summary: {
      aggregations: {
        fs: {
          value: number,
        },
      },
    },
    repository: {
      customCaseFacets: {
        facets: {
          facets: string,
        },
      },
      customFileFacets: {
        facets: {
          facets: string,
        },
      },
      cases: {
        aggregations: {},
        pies: {},
        hits: {
          total: number,
        },
      },
      files: {
        aggregations: {},
        pies: {},
        hits: {
          total: number,
        },
      },
    },
  },
  showFacets: boolean,
  setShowFacets: Function,
};

const enhance = compose(
  setDisplayName('RepositoryPage'),
  connect(),
  withFilters(),
  withRouter,
);

export const RepositoryPageComponent = (props: TProps) => {
  const fileCount = props.viewer.File.hits.total;
//  const caseCount = props.viewer.repository.cases.hits.total;
//  const fileSize = props.viewer.cart_summary.aggregations.fs.value;
  
  // hacking this in to get things to work
  const caseCount = 1;
  const fileSize = 0;
  const facetTabs=[
	{
	    id: 'participants',
      text: 'PARTICIPANT',
	    component: <CaseAggregations relay={props.relay} />,
	},
    {
      id: 'files',
      text: 'FILE',
      component: <FileAggregations relay={props.relay} />,
    }
   
  ];

  return (
    <div className="test-repository-page">
      <SearchPage
        filtersLinkProps={{
          hideLinkOnEmpty: false,
          linkPathname: '/query',
          linkText: 'Advanced Search',
        }}
        facetTabs={facetTabs}
        results={
          <span>
            <ActionsRow
              totalCases={caseCount}
              totalFiles={fileCount}
              filters={props.filters}
            />
            <TabbedLinks
              queryParam="searchTableTab"
              defaultIndex={0}
              tabToolbar={
                features.saveIcon && (
                <Row spacing="2rem" style={{ alignItems: 'center' }}>
                  <span style={{ flex: 'none' }}>
                    <SaveIcon style={{ marginRight: 5 }} />{' '}
                    <strong>{formatFileSize(fileSize)}</strong>
                  </span>
                </Row>)
              }
              links={[
                {
                  id: 'files',
                  text: `Files (${fileCount.toLocaleString()})`,
                  component: !!props.viewer.File.hits.total ? (
                    <div>
                      <FilesTable downloadable={false} />
                    </div>
                  ) : (
                    <NoResultsMessage>
                      No results found using those filters.
                    </NoResultsMessage>
                  ),
                },
//                {
//                  id: 'cases',
//                  text: `Cases (${caseCount.toLocaleString()})`,
//                  component: !!props.viewer.File.hits.total ? (
//                    <div>
//                      <RepoCasesPies
//                        aggregations={props.viewer.File.pies}
//                      />
//                      <RepoCasesTable />
//                    </div>
//                  ) : (
//                    <NoResultsMessage>
//                      No results found using those filters.
//                    </NoResultsMessage>
//                  ),
//                },
              ]}
            />
          </span>
        }
      />
    </div>
  );
};

export const RepositoryPageQuery = {
  initialVariables: {
    cases_offset: null,
    cases_size: null,
    cases_sort: null,
    files_offset: null,
    files_size: null,
    files_sort: null,
    filters: null,
  },
  fragments: {
    viewer: () => Relay.QL`
      fragment on Root {

          File {

            hits(first: $files_size offset: $files_offset, filters: $filters, sort: $files_sort) {
              total
            }
        }
      }
    `,
  },
};

const RepositoryPage = Relay.createContainer(
  enhance(RepositoryPageComponent),
  RepositoryPageQuery,
);

export default RepositoryPage;
