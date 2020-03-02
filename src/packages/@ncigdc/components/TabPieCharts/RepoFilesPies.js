// @flow
import React from 'react';
import Relay from 'react-relay/classic';
import _ from 'lodash';
import { compose, withState } from 'recompose';

import withSize from '@ncigdc/utils/withSize';
import { IBucket } from '@ncigdc/components/Aggregations/types';
import withRouter from '@ncigdc/utils/withRouter';
import { parseFilterParam } from '@ncigdc/utils/uri';
import {
  ColumnCenter,
  RowCenter,
  WrappedRow,
  ShowToggleBox,
  BottomBorderedBox,
  PieTitle,
  SelfFilteringPie,
} from './';
import features from '../../../../features.json';

export type TProps = {
  push: Function,
  query: Object,
  aggregations: {
    data_category: { buckets: [IBucket] },
    data_type: { buckets: [IBucket] },
    experimental_strategy: { buckets: [IBucket] },
    data_format: { buckets: [IBucket] },
    access: { buckets: [IBucket] },
  },
  setShowingMore: Function,
  showingMore: boolean,
  size: { width: number },
};

const enhance = compose(
  withRouter,
  withState('showingMore', 'setShowingMore', false),
  withSize(),
);

const RepoFilesPiesComponent = ({
  aggregations,
  query,
  push,
  showingMore,
  setShowingMore,
  size: { width },
}: TProps) => {
  const currentFilters =
    (query && parseFilterParam((query || {}).filters, {}).content) || [];
  const currentFieldNames = currentFilters.map(f => f.content.field);
  const pieColMinWidth = width / 5;
  return (
    <div className="test-repo-files-pies">
      <BottomBorderedBox>
        <WrappedRow style={{ maxWidth: `${width}px`, width: '100%' }}>
          {features.pieCharts.primarySite && (
              <React.Fragment>
          <ColumnCenter
            style={{ minWidth: `${pieColMinWidth}px` }}
            className="test-primary-site-pie"
          >
            <PieTitle>Primary Site</PieTitle>
            <SelfFilteringPie
              buckets={_.get(aggregations, 'cases__primary_site.buckets')}
              fieldName="files.cases.primary_site"
              docTypeSingular="file"
              currentFieldNames={currentFieldNames}
              currentFilters={currentFilters}
              query={query}
              push={push}
              path="doc_count"
              height={125}
              width={125}
            />
          </ColumnCenter>
              </React.Fragment>
          )}
          {features.pieCharts.project && (
              <React.Fragment>
          <ColumnCenter
            style={{ minWidth: `${pieColMinWidth}px` }}
            className="test-project-pie"
          >
            <PieTitle>Project</PieTitle>
            <SelfFilteringPie
              buckets={_.get(
                aggregations,
                'cases__project__project_id.buckets',
              )}
              fieldName="cases.project.project_id"
              docTypeSingular="file"
              currentFieldNames={currentFieldNames}
              currentFilters={currentFilters}
              query={query}
              push={push}
              path="doc_count"
              height={125}
              width={125}
            />
          </ColumnCenter>
              </React.Fragment>
          )}
          <ColumnCenter
            style={{ minWidth: `${pieColMinWidth}px` }}
            className="test-data-category-pie"
          >
            <PieTitle>Data Category</PieTitle>
            <SelfFilteringPie
              buckets={_.get(aggregations, 'data_category.buckets')}
              fieldName="data_category"
              docTypeSingular="file"
              currentFieldNames={currentFieldNames}
              currentFilters={currentFilters}
              query={query}
              push={push}
              path="doc_count"
              height={125}
              width={125}
            />
          </ColumnCenter>
          <ColumnCenter
            style={{ minWidth: `${pieColMinWidth}px` }}
            className="test-data-type"
          >
            <PieTitle>Data Type</PieTitle>
            <SelfFilteringPie
              buckets={_.get(aggregations, 'data_type.buckets')}
              fieldName="data_type"
              docTypeSingular="file"
              currentFieldNames={currentFieldNames}
              currentFilters={currentFilters}
              query={query}
              push={push}
              path="doc_count"
              height={125}
              width={125}
            />
          </ColumnCenter>
          <ColumnCenter
            style={{ minWidth: `${pieColMinWidth}px` }}
            className="test-data-format"
          >
            <PieTitle>Data Format</PieTitle>
            <SelfFilteringPie
              buckets={_.get(aggregations, 'data_format.buckets')}
              fieldName="data_format"
              docTypeSingular="file"
              currentFieldNames={currentFieldNames}
              currentFilters={currentFilters}
              query={query}
              push={push}
              path="doc_count"
              height={125}
              width={125}
            />
          </ColumnCenter>
          {/*{showingMore && [*/}
            <ColumnCenter
              style={{ minWidth: `${pieColMinWidth}px` }}
              key="files.experimental_strategy"
              className="test-experimental-strategy"
            >
              <PieTitle>Experimental Strategy</PieTitle>
              <SelfFilteringPie
                buckets={_.get(aggregations, 'experimental_strategy.buckets')}
                fieldName="experimental_strategy"
                docTypeSingular="file"
                currentFieldNames={currentFieldNames}
                currentFilters={currentFilters}
                query={query}
                push={push}
                path="doc_count"
                height={125}
                width={125}
              />
            </ColumnCenter>,
            <ColumnCenter
              key="files.access"
              style={{ minWidth: `${pieColMinWidth}px` }}
              className="test-access-level"
            >
              {features.pieCharts.accessLevel && (
                  <React.Fragment>
              <PieTitle>Access Level</PieTitle>
              <SelfFilteringPie
                buckets={_.get(aggregations, 'access.buckets')}
                fieldName="access"
                docTypeSingular="file"
                currentFieldNames={currentFieldNames}
                currentFilters={currentFilters}
                query={query}
                push={push}
                path="doc_count"
                height={125}
                width={125}
              />
                  </React.Fragment>
              )}
            </ColumnCenter>,
          {/*]}*/}
        </WrappedRow>
      </BottomBorderedBox>
      {/*<RowCenter style={{ marginTop: '-1.5rem' }}>*/}
      {/*  <ShowToggleBox onClick={() => setShowingMore(!showingMore)}>*/}
      {/*    Show {showingMore ? 'Less' : 'More'}*/}
      {/*  </ShowToggleBox>*/}
      {/*</RowCenter>*/}
    </div>
  );
};

export const RepoFilesPiesQuery = {
  fragments: {
    aggregations: () => Relay.QL`
      fragment on FileAggregations {
        data_category {
          buckets {
            doc_count
            key
          }
        }
        data_type {
          buckets {
            doc_count
            key
          }
        }
        experimental_strategy {
          buckets {
            doc_count
            key
          }
        }
        data_format {
          buckets {
            doc_count
            key
          }
        }
        access {
          buckets {
            doc_count
            key
          }
        }
      }
    `,
  },
};

const RepoFilesPies = Relay.createContainer(
  enhance(RepoFilesPiesComponent),
  RepoFilesPiesQuery,
);

export default RepoFilesPies;
