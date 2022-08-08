// @flow

import React from 'react';
import { uniq } from 'lodash';
import { Th, Td, TdNum, ThNum } from '@ncigdc/uikit/Table';
import CaseLink from '@ncigdc/components/Links/CaseLink';
import ProjectLink from '@ncigdc/components/Links/ProjectLink';
import { RepositoryCasesLink } from '@ncigdc/components/Links/RepositoryLink';
import FileLink from '@ncigdc/components/Links/FileLink';
import { makeFilter } from '@ncigdc/utils/filters';
import FileSize from '@ncigdc/components/FileSize';
import features from '../../../../features';
import CopyToClipboardButton from '@ncigdc/modern_components/CopyToClipboardButton/CopyToClipboardButton';

const filesTableModel = [
  {
    name: 'File UUID',
    id: 'file_id',
    th: () => <Th>File UUID</Th>,
    td: ({ node }) => (
      <Td>
        {features.fileLinking ? (
            <FileLink
                uuid={node.file_id}
                style={{whiteSpace: 'pre-line', wordBreak: 'break-all'}}
            >
              {node.file_id}
            </FileLink>) : (node.file_id)
        }
      </Td>
    ),
    sortable: true,
    downloadable: true,
    hidden: true,
  },
  {
    name: 'Access',
    id: 'access',
    sortable: true,
    downloadable: true,
    th: () => <Th>Access</Th>,
    td: ({ node }) => (
      <Td>
        {node.access === 'open' && <i className="fa fa-unlock-alt" />}
        {node.access === 'controlled' && <i className="fa fa-lock" />}
        <span
          style={{
            marginLeft: '0.3rem',
          }}
        >
          {node.access}
        </span>
      </Td>
    ),
  },
  {
    name: 'File Name',
    id: 'file_name',
    sortable: true,
    downloadable: true,
    th: () => <Th>File Name</Th>,
    td: ({ node }) => (
      <Td>
        <CopyToClipboardButton text={node.file_name} />
        {features.fileLinking ? (
            <FileLink
                uuid={node.file_id}
                style={{whiteSpace: 'pre-line', wordBreak: 'break-all'}}
            >
              {node.file_name}
            </FileLink>
        ) : (node.file_name)
        }
      </Td>
    ),
  },
//  {
//    name: 'Cases',
//    id: 'cases.case_id',
//    th: () => <ThNum>Cases</ThNum>,
//    td: ({
//      node: { cases: { hits: { total = 0, edges: cases } }, file_id: fileId },
//    }) => (
//      <TdNum>
//        {total > 1 && (
//          <RepositoryCasesLink
//            query={{
//              filters: makeFilter(
//                [{ field: 'files.file_id', value: [fileId] }],
//                false,
//              ),
//            }}
//          >
//            {total.toLocaleString()}
//          </RepositoryCasesLink>
//        )}
//        {total === 1 && (
//          <CaseLink uuid={cases[0].node.case_id}>{total}</CaseLink>
//        )}
//
//        {total === 0 && 0}
//      </TdNum>
//    ),
//    downloadable: true,
//  },
//  {
//    name: 'Project',
//    id: 'cases.project.project_id',
//    th: () => <Th>Project</Th>,
//    td: ({ node }) => (
//      <Td>
//        {uniq(
//          node.cases.hits.edges.map(e => e.node.project.project_id),
//        ).map(pId => (
//          <ProjectLink key={pId} uuid={pId}>
//            {pId}
//          </ProjectLink>
//        ))}
//      </Td>
//    ),
//    sortable: true,
//    downloadable: true,
//  },
  {
    name: 'Data Category',
    id: 'data_category',
    th: () => <Th>Data Category</Th>,
    td: ({ node }) => <Td>{node.data_category || '--'}</Td>,
    sortable: true,
    downloadable: true,
  },
  {
    name: 'Data Format',
    id: 'data_format',
    th: () => <Th>Data Format</Th>,
    td: ({ node }) => <Td>{node.data_format || '--'}</Td>,
    sortable: true,
    downloadable: true,
  },
  {
    name: 'Size',
    id: 'file_size',
    th: () => <ThNum>File Size</ThNum>,
    td: ({ node }) => (
      <TdNum>
        <FileSize bytes={node.file_size} />
      </TdNum>
    ),
    sortable: true,
    downloadable: true,
  },
//  {
//    name: 'Annotations',
//    id: 'annotations.annotation_id',
//    th: () => <ThNum>Annotations</ThNum>,
//    td: ({ node }) => (
//      <TdNum>
//        {
//          // leaving link off until we have a proper way to filter the annotation page by file
//          node.annotations.hits.total
//        }
//      </TdNum>
//    ),
//    downloadable: true,
//  },
  {
    name: 'Data Type',
    id: 'data_type',
    th: () => <Th>Data Type</Th>,
    td: ({ node }) => <Td>{node.data_type || '--'}</Td>,
    sortable: true,
    downloadable: true,
    hidden: true,
  },
  {
    name: 'Experimental Strategy',
    id: 'experimental_strategy',
    th: () => <Th>Experimental Strategy</Th>,
    td: ({ node }) => <Td>{node.experimental_strategy || '--'}</Td>,
    sortable: true,
    downloadable: true,
    hidden: true,
  },
  {
    name: 'Workflow Type',
    id: 'workflow_type',
    th: () => <Th>Workflow Type</Th>,
    td: ({ node }) => <Td>{node.workflow_type || '--'}</Td>,
    sortable: true,
    downloadable: true,
    hidden: true,
  },
  {
    name: 'Platform',
    id: 'platform',
    th: () => <Th>Platform</Th>,
    td: ({ node }) => <Td>{node.platform || '--'}</Td>,
    sortable: true,
    downloadable: true,
    hidden: false,
  },
  {
	  name: 'Participant ID',
	  id: 'cases.samples.participant_id',
	  th: () => <Th>Participant ID</Th>,
	  td: ({ node }) => {
      if (node.cases.samples.participant_id) {
        if (node.cases.samples.participant_id.length > 1) {
          return 'Multiple participants';
        }
        else {
          return node.cases.samples.participant_id[0];
        }
      } else {
        return '--';
      }
    },
	  sortable: true,
	  downloadable: true,
	  hidden: false,
  },
  {
    name: 'DOIs',
    id: 'dois',
    th: () => <Th>DOIs</Th>,
    td: ({ node }) => {
      let joinedDois = (node.dois).filter(item => !(item === null));
      let dois = [...new Set(joinedDois)];
        return (
          <Td>{(
            dois.join(", ") !== '') ?
            dois.join(", ") :
            '--'}
          </Td>
        )
      },
    sortable: true,
    downloadable: true,
    hidden: false,
  },
];

export default filesTableModel;
