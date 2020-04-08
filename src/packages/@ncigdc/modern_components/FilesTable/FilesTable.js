/* @flow */

import React from 'react';
import { compose, setDisplayName, branch, renderComponent } from 'recompose';
import { connect } from 'react-redux';
import Pagination from '@ncigdc/components/Pagination';
import Showing from '@ncigdc/components/Pagination/Showing';
import { Row } from '@ncigdc/uikit/Flex';
import TableActions from '@ncigdc/components/TableActions';
import Table, { Th, Tr, Td } from '@ncigdc/uikit/Table';
import styled from '@ncigdc/theme/styled';
import Button from '@ncigdc/uikit/Button';
import timestamp from '@ncigdc/utils/timestamp';
import DownloadFileSingle from '@ncigdc/components/DownloadFileSingle';

const RemoveButton = styled(Button, {
  backgroundColor: '#FFF',
  borderColor: '#CCC',
  color: '#333',
  margin: '0 auto',
  padding: '0px 5px',
  ':hover': {
    background:
      'linear-gradient(to bottom, #ffffff 50%, #e6e6e6 100%) repeat scroll 0 0 #E6E6E6',
    borderColor: '#ADADAD',
  },
});

export default compose(
  setDisplayName('FilesTablePresentation'),
  connect(state => ({ tableColumns: state.tableColumns.files })),
  branch(
    ({ viewer }) =>
      !viewer.File.hits ||
      !viewer.File.hits.edges.length,
    renderComponent(() => <div>No results found</div>)
  )
)(
  ({
    downloadable,
    viewer: {  File: { hits }  },
    entityType = 'files',
    tableColumns,
    canAddToCart = true,
    tableHeader,
    dispatch,
    parentVariables,
  }) => {
    const tableInfo = tableColumns.slice().filter(x => !x.hidden);

    const prefix = 'files';

    return (
      <div className="test-files-table">
        {tableHeader && (
          <h1
            className="panel-title"
            style={{ padding: '1rem', marginTop: '-6rem' }}
          >
            {tableHeader}
          </h1>
        )}
        <Row
          style={{
            backgroundColor: 'white',
            padding: '1rem',
            justifyContent: 'space-between',
          }}
        >
          <Showing
            docType="files"
            prefix={prefix}
            params={parentVariables}
            total={hits.total}
          />
          <TableActions
            type="file"
            scope="repository"
            total={hits.total}
            endpoint="files"
            downloadable={downloadable}
            arrangeColumnKey={entityType}
            downloadFields={tableInfo
              .filter(x => x.downloadable)
              .map(x => x.field || x.id)}
            sortOptions={tableInfo.filter(x => x.sortable)}
            tsvSelector="#repository-files-table"
            tsvFilename={`repository-files-table.${timestamp()}.tsv`}
          />
        </Row>
        <div style={{ overflowX: 'auto' }}>
          <Table
            id="repository-files-table"
            headings={[
              (
                <Th key="download_column">
                  
                </Th>
              ),
              ...tableInfo.map(x => (
                <x.th key={x.id} hits={hits} canAddToCart={canAddToCart} />
              )),
            ]}
            body={
              <tbody>
                {hits.edges.map((e, i) => (
                  <Tr key={e.node.id} index={i}>
                    {[
                      <Td key="download">
                          <DownloadFileSingle
                              activeText=""
                              file={e.node}
                              inactiveText=""
                          />
                      </Td>,
                      ...tableInfo
                        .filter(x => x.td)
                        .map(x => (
                          <x.td
                            key={x.id}
                            node={e.node}
                            index={i}
                            total={hits.total}
                          />
                        )),
                    ]}
                  </Tr>
                ))}
              </tbody>
            }
          />
        </div>
        <Pagination
          prefix={prefix}
          params={parentVariables}
          total={hits.total}
        />
      </div>
    );
  }
);
